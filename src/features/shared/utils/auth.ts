const ACCESS_TOKEN_REFRESH_MARGIN_MS = 30_000;

type TokenRefreshServiceOptions = {
  apiBaseUrl: string;
  refreshToken: string | null;
  accessToken?: string | null;
  onAccessToken?: (accessToken: string) => void;
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

export function createTokenRefreshService({
  apiBaseUrl,
  refreshToken: initialRefreshToken,
  accessToken: initialAccessToken,
  onAccessToken,
}: TokenRefreshServiceOptions): TokenRefreshService {
  let currentAccessToken = initialAccessToken ?? null;
  let currentRefreshToken = initialRefreshToken;
  let refreshInFlight: Promise<string | null> | null = null;

  const performRefresh = async (): Promise<string | null> => {
    if (!currentRefreshToken) {
      return null;
    }

    try {
      const response = await globalThis.fetch(`${apiBaseUrl}/dashboard/auth/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: currentRefreshToken }),
        cache: "no-store",
      });

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as { access?: string; refresh?: string };
      if (!data.access) {
        return null;
      }

      currentAccessToken = data.access;
      currentRefreshToken = data.refresh ?? currentRefreshToken;
      onAccessToken?.(data.access);
      return data.access;
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
    const headers = new Headers(init?.headers);
    const suppliedAccessToken = getBearerToken(headers);

    if (!suppliedAccessToken) {
      return globalThis.fetch(input, init);
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
    const response = await globalThis.fetch(input, { ...init, headers });
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
    return globalThis.fetch(input, { ...init, headers });
  };

  return { refreshAccessToken, fetchWithAuth };
}
