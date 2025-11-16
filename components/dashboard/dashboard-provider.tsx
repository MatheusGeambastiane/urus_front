"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { useSession } from "next-auth/react";

import { env } from "@/lib/env";

export class DashboardApiError extends Error {
  public readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "DashboardApiError";
    this.status = status;
  }
}

type DashboardContextValue = {
  accessToken: string | null;
  refreshToken: string | null;
  fetchDashboard: <TResponse>(path: string, init?: RequestInit) => Promise<TResponse>;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

const resolveUrl = (path: string) => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return new URL(path, env.apiBaseUrl).toString();
};

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  const fetchDashboard = useCallback(
    async <TResponse,>(path: string, init?: RequestInit) => {
      const token = session?.accessToken;

      if (!token) {
        throw new DashboardApiError("Sessão expirada. Faça login novamente.");
      }

      const headers = new Headers(init?.headers);
      headers.set("Accept", "application/json");
      if (init?.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      headers.set("Authorization", `Bearer ${token}`);

      const response = await fetch(resolveUrl(path), {
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
    },
    [session?.accessToken],
  );

  const value = useMemo<DashboardContextValue>(
    () => ({
      accessToken: session?.accessToken ?? null,
      refreshToken: session?.refreshToken ?? null,
      fetchDashboard,
    }),
    [fetchDashboard, session?.accessToken, session?.refreshToken],
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error("useDashboard deve ser usado dentro de DashboardProvider");
  }

  return context;
}
