"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestVersion = useRef(0);

  const reload = useCallback(async (signal?: AbortSignal) => {
    if (!enabled) return true;
    if (!accessToken) return false;
    setError(null);
    const version = ++requestVersion.current;
    setLoading(true);
    try {
      const response = await fetchWithAuth(homeGoalProgressEndpoint, {
        cache: "no-store",
        credentials: "include",
        headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
        signal,
      });
      if (!response.ok) throw new Error("Não foi possível atualizar a meta.");
      const payload = (await response.json()) as { goal: HomeGoalProgress | null };
      if (signal?.aborted || version !== requestVersion.current) return false;
      setGoal(payload.goal);
      setUpdatedAt(new Date());
      return true;
    } catch (error) {
      if (!signal?.aborted && version === requestVersion.current) {
        setError(error instanceof Error ? error.message : "Não foi possível atualizar a meta.");
      }
    } finally {
      if (!signal?.aborted && version === requestVersion.current) setLoading(false);
    }
    return false;
  }, [accessToken, enabled, fetchWithAuth]);

  useEffect(() => {
    const controller = new AbortController();
    void reload(controller.signal);
    return () => {
      controller.abort();
      requestVersion.current += 1;
    };
  }, [reload]);

  return { goal, loading, error, reload, updatedAt };
}
