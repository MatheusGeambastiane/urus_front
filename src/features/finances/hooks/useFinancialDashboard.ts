"use client";

import { useCallback, useEffect, useState } from "react";

import { financialDashboardEndpoint } from "@/src/features/finances/services/endpoints";
import type { FinancialDashboardData } from "@/src/features/finances/types";

type Params = {
  accessToken: string | null;
  fetchWithAuth: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  filter:
    | { mode: "month"; month: string }
    | { mode: "range"; startDate: string; endDate: string };
  enabled: boolean;
};

export function useFinancialDashboard({ accessToken, fetchWithAuth, filter, enabled }: Params) {
  const [data, setData] = useState<FinancialDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    if (!accessToken) {
      setError("Sessão expirada. Faça login novamente.");
      return;
    }
    if (filter.mode === "range" && (!filter.startDate || !filter.endDate)) {
      setError("Informe as datas inicial e final.");
      return;
    }
    if (filter.mode === "range" && filter.endDate < filter.startDate) {
      setError("A data final deve ser igual ou posterior à data inicial.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const url = new URL(financialDashboardEndpoint);
      if (filter.mode === "month") {
        url.searchParams.set("month", filter.month);
      } else {
        url.searchParams.set("start_date", filter.startDate);
        url.searchParams.set("end_date", filter.endDate);
      }
      const response = await fetchWithAuth(url.toString(), {
        credentials: "include",
        headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) throw new Error("Não foi possível carregar o dashboard financeiro.");
      setData((await response.json()) as FinancialDashboardData);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Erro ao carregar o dashboard financeiro.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, enabled, fetchWithAuth, filter]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
