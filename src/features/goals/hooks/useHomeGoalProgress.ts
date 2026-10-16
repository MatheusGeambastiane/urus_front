"use client";

import { useEffect, useState } from "react";

import { homeGoalProgressEndpoint } from "@/src/features/goals/services/endpoints";
import type { HomeGoalProgress } from "@/src/features/goals/types";
import type { TokenRefreshService } from "@/src/features/shared/utils/auth";

type Params = {
  accessToken: string | null;
  fetchWithAuth: TokenRefreshService["fetchWithAuth"];
  enabled: boolean;
};

export function useHomeGoalProgress({ accessToken, fetchWithAuth, enabled }: Params) {
  const [goal, setGoal] = useState<HomeGoalProgress | null>(null);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!accessToken || !enabled) return;
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetchWithAuth(homeGoalProgressEndpoint, {
          credentials: "include",
          headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
          signal: controller.signal,
        });
        if (!response.ok) return;
        const payload = (await response.json()) as { goal: HomeGoalProgress | null };
        if (!controller.signal.aborted) setGoal(payload.goal);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Não foi possível carregar o progresso da meta.", error);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [accessToken, enabled, fetchWithAuth]);

  return { goal, loading };
}
