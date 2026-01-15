"use client";

import { createContext, useContext, useMemo } from "react";
import { useSession } from "next-auth/react";

import {
  createDashboardClient,
  type DashboardFetch,
} from "@/features/dashboard/services/dashboard-client";

type DashboardContextValue = {
  accessToken: string | null;
  refreshToken: string | null;
  fetchDashboard: DashboardFetch;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  const fetchDashboard = useMemo(
    () => createDashboardClient(session?.accessToken ?? null),
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
