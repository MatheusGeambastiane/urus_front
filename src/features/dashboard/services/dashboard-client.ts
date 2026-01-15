import { env } from "@/lib/env";

export class DashboardApiError extends Error {
  public readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "DashboardApiError";
    this.status = status;
  }
}

const resolveDashboardUrl = (path: string) => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return new URL(path, env.apiBaseUrl).toString();
};

export type DashboardFetch = <TResponse>(path: string, init?: RequestInit) => Promise<TResponse>;

export const createDashboardClient = (accessToken: string | null): DashboardFetch => {
  return async <TResponse,>(path: string, init?: RequestInit) => {
    if (!accessToken) {
      throw new DashboardApiError("Sessão expirada. Faça login novamente.");
    }

    const headers = new Headers(init?.headers);
    headers.set("Accept", "application/json");
    if (init?.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    headers.set("Authorization", `Bearer ${accessToken}`);

    const response = await fetch(resolveDashboardUrl(path), {
      ...init,
      headers,
      credentials: init?.credentials ?? "include",
    });

    if (!response.ok) {
      let errorMessage = "Erro inesperado ao comunicar com o dashboard.";
      try {
        const data = (await response.json()) as { detail?: string; message?: string } | null;
        if (data?.detail || data?.message) {
          errorMessage = data.detail ?? data.message ?? errorMessage;
        }
      } catch {
        /* ignore body parsing errors */
      }
      throw new DashboardApiError(errorMessage, response.status);
    }

    if (response.status === 204) {
      return null as TResponse;
    }

    return (await response.json()) as TResponse;
  };
};
