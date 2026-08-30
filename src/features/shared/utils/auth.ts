const ACCESS_TOKEN_REFRESH_MARGIN_MS = 30_000;

type TokenRefreshServiceOptions = {
  accessToken?: string | null;
  refreshAccessToken: () => Promise<string | null>;
};

export type TokenRefreshService = {
  refreshAccessToken: () => Promise<string | null>;
  fetchWithAuth: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
};

type JwtPayload = {
  exp?: number;
};

function getTokenExpiration(token: string): number | null {
  const payloadPart = token.split(".")[1];
  if (!payloadPart) {
    return null;
  }

  try {
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const payload = JSON.parse(globalThis.atob(paddedBase64)) as JwtPayload;

    return typeof payload.exp === "number" ? payload.exp * 1_000 : null;
  } catch {
    return null;
  }
}

function getBearerToken(headers: Headers): string | null {
  const authorization = headers.get("Authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

function tokenIsExpired(token: string, marginMs = 0): boolean {
  const expiration = getTokenExpiration(token);
  return expiration !== null && expiration <= Date.now() + marginMs;
}

function tokenWithLatestExpiration(first: string, second: string): string {
  const firstExpiration = getTokenExpiration(first);
  const secondExpiration = getTokenExpiration(second);

  if (firstExpiration === null || secondExpiration === null) {
    return second;
  }

  return firstExpiration >= secondExpiration ? first : second;
}

function expiredTokenResponse(): Response {
  return new Response(
    JSON.stringify({
      detail: "Sessão expirada. Não foi possível renovar o token.",
      code: "token_not_valid",
    }),
    {
      status: 401,
      headers: { "Content-Type": "application/json" },
    },
  );
}

function omitCredentialsForCrossOriginRequest(
  input: RequestInfo | URL,
  init?: RequestInit,
): RequestInit | undefined {
  const currentOrigin = globalThis.location?.origin;
  if (!currentOrigin) {
    return init;
  }

  const requestUrl =
    input instanceof Request
      ? input.url
      : input instanceof URL
        ? input.href
        : input;

  try {
    if (new URL(requestUrl, currentOrigin).origin !== currentOrigin) {
      // Dashboard APIs authenticate with a Bearer token. Sending browser
      // cookies cross-origin is unnecessary and forces credentialed CORS.
      return { ...init, credentials: "omit" };
    }
  } catch {
    return init;
  }

  return init;
}

export function createTokenRefreshService({
  accessToken: initialAccessToken,
  refreshAccessToken: refreshOnServer,
}: TokenRefreshServiceOptions): TokenRefreshService {
  let currentAccessToken = initialAccessToken ?? null;
  let refreshInFlight: Promise<string | null> | null = null;

  const performRefresh = async (): Promise<string | null> => {
    try {
      const accessToken = await refreshOnServer();
      if (!accessToken) {
        return null;
      }
      currentAccessToken = accessToken;
      return accessToken;
    } catch {
      return null;
    }
  };

  const refreshAccessToken = (): Promise<string | null> => {
    if (!refreshInFlight) {
      refreshInFlight = performRefresh().finally(() => {
        refreshInFlight = null;
      });
    }

    return refreshInFlight;
  };

  const fetchWithAuth = async (input: RequestInfo | URL, init?: RequestInit) => {
    const requestInit = omitCredentialsForCrossOriginRequest(input, init);
    const headers = new Headers(requestInit?.headers);
    const suppliedAccessToken = getBearerToken(headers);

    if (!suppliedAccessToken) {
      return globalThis.fetch(input, requestInit);
    }

    currentAccessToken = currentAccessToken
      ? tokenWithLatestExpiration(currentAccessToken, suppliedAccessToken)
      : suppliedAccessToken;

    if (tokenIsExpired(currentAccessToken, ACCESS_TOKEN_REFRESH_MARGIN_MS)) {
      const refreshedAccessToken = await refreshAccessToken();

      if (refreshedAccessToken) {
        currentAccessToken = refreshedAccessToken;
      } else if (tokenIsExpired(currentAccessToken)) {
        // Do not send a request that is already known to contain an expired token.
        return expiredTokenResponse();
      }
    }

    headers.set("Authorization", `Bearer ${currentAccessToken}`);
    const response = await globalThis.fetch(input, { ...requestInit, headers });
    if (response.ok) {
      return response;
    }

    let payload: { code?: string } | null = null;
    try {
      payload = (await response.clone().json()) as { code?: string };
    } catch {
      payload = null;
    }

    if (payload?.code !== "token_not_valid") {
      return response;
    }

    const rejectedAccessToken = getBearerToken(headers);
    const newAccessToken =
      rejectedAccessToken && currentAccessToken !== rejectedAccessToken
        ? currentAccessToken
        : await refreshAccessToken();

    if (!newAccessToken) {
      return response;
    }

    headers.set("Authorization", `Bearer ${newAccessToken}`);
    return globalThis.fetch(input, { ...requestInit, headers });
  };

  return { refreshAccessToken, fetchWithAuth };
}
