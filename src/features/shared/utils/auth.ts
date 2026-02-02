type TokenRefreshServiceOptions = {
  apiBaseUrl: string;
  refreshToken: string | null;
  onAccessToken?: (accessToken: string) => void;
};

export type TokenRefreshService = {
  refreshAccessToken: () => Promise<string | null>;
  fetchWithAuth: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
};

export function createTokenRefreshService({
  apiBaseUrl,
  refreshToken,
  onAccessToken,
}: TokenRefreshServiceOptions): TokenRefreshService {
  const refreshAccessToken = async () => {
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await globalThis.fetch(`${apiBaseUrl}/dashboard/auth/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as { access?: string };
      if (!data?.access) {
        return null;
      }

      onAccessToken?.(data.access);
      return data.access;
    } catch {
      return null;
    }
  };

  const fetchWithAuth = async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await globalThis.fetch(input, init);
    if (response.ok) {
      return response;
    }

    const headers = init?.headers ? new Headers(init.headers) : null;
    if (!headers?.has("Authorization")) {
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

    const newAccessToken = await refreshAccessToken();
    if (!newAccessToken) {
      return response;
    }

    headers.set("Authorization", `Bearer ${newAccessToken}`);
    return globalThis.fetch(input, { ...init, headers });
  };

  return { refreshAccessToken, fetchWithAuth };
}
