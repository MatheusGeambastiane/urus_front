"use client";

import { useCallback, useEffect, useState } from "react";
import { financeMonthlyReportEndpoint, financeSummaryEndpoint } from "@/src/features/finances/services/endpoints";
import type { FinanceSummary } from "@/src/features/finances/types";

type UseFinanceSummaryParams = {
  accessToken: string | null;
  fetchWithAuth: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  month: string;
};

export function useFinanceSummary({ accessToken, fetchWithAuth, month }: UseFinanceSummaryParams) {
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!accessToken) {
      setSummary(null);
      setError("Sessão expirada. Faça login novamente.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = new URL(financeSummaryEndpoint);
      url.searchParams.set("month", month);

      const response = await fetchWithAuth(url.toString(), {
        credentials: "include",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Não foi possível carregar o resumo financeiro.");
      }

      const data = (await response.json()) as FinanceSummary;
      setSummary(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro inesperado ao carregar o resumo financeiro.",
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken, fetchWithAuth, month]);

  const generateMonthlyReport = useCallback(async () => {
    if (!accessToken || reportLoading) {
      return null;
    }

    setReportLoading(true);
    try {
      const url = new URL(financeMonthlyReportEndpoint);
      url.searchParams.set("month", month);

      const response = await fetchWithAuth(url.toString(), {
        credentials: "include",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Não foi possível gerar o relatório mensal.");
      }

      const data = (await response.json()) as { file?: { url?: string | null } };
      const reportUrl = typeof data.file?.url === "string" ? data.file.url : "";

      if (!reportUrl) {
        throw new Error("Relatório gerado sem URL de acesso.");
      }

      return reportUrl;
    } finally {
      setReportLoading(false);
    }
  }, [accessToken, fetchWithAuth, month, reportLoading]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    summary,
    loading,
    error,
    refresh,
    reportLoading,
    generateMonthlyReport,
  };
}
