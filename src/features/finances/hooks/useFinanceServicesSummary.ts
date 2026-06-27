"use client";

import { useCallback, useEffect, useState } from "react";
import { financeServicesSummaryEndpoint } from "@/src/features/finances/services/endpoints";
import type { FinanceServicesSummary } from "@/src/features/finances/types";

type UseFinanceServicesSummaryParams = {
  accessToken: string | null;
  fetchWithAuth: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  month: string;
};

export function useFinanceServicesSummary({
  accessToken,
  fetchWithAuth,
  month,
}: UseFinanceServicesSummaryParams) {
  const [summary, setSummary] = useState<FinanceServicesSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!accessToken) {
      setSummary(null);
      setError("Sessão expirada. Faça login novamente.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = new URL(financeServicesSummaryEndpoint);
      url.searchParams.set("month", month);

      const response = await fetchWithAuth(url.toString(), {
        credentials: "include",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Não foi possível carregar o resumo de serviços.");
      }

      const data = (await response.json()) as FinanceServicesSummary;
      setSummary(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro inesperado ao carregar o resumo de serviços.",
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken, fetchWithAuth, month]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    summary,
    loading,
    error,
    refresh,
  };
}
