"use client";

import { useCallback, useEffect, useState } from "react";

import { goalsEndpoint, goalsOverviewEndpoint } from "@/src/features/goals/services/endpoints";
import type { GoalPeriodType, GoalsOverview, SaveGoalInput } from "@/src/features/goals/types";
import { getApiErrorMessage } from "@/src/features/shared/utils/api-errors";

type Params = {
  accessToken: string | null;
  fetchWithAuth: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  periodType: GoalPeriodType;
  period: string;
};

export function useGoals({ accessToken, fetchWithAuth, periodType, period }: Params) {
  const [data, setData] = useState<GoalsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      setError("Sessão expirada. Faça login novamente.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const url = new URL(goalsOverviewEndpoint);
      url.searchParams.set("period_type", periodType);
      url.searchParams.set("period", period);
      const response = await fetchWithAuth(url.toString(), {
        credentials: "include",
        headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(getApiErrorMessage(payload, "Não foi possível carregar as metas."));
      }
      setData((await response.json()) as GoalsOverview);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Erro inesperado ao carregar as metas.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, fetchWithAuth, period, periodType]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(async (input: SaveGoalInput) => {
    if (!accessToken) throw new Error("Sessão expirada. Faça login novamente.");
    setSaving(true);
    try {
      const response = await fetchWithAuth(goalsEndpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(getApiErrorMessage(payload, "Não foi possível salvar a meta."));
      }
      await load();
    } finally {
      setSaving(false);
    }
  }, [accessToken, fetchWithAuth, load]);

  return { data, loading, saving, error, refresh: load, save };
}
