"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { appointmentsLast7DaysEndpoint } from "@/src/features/appointments/services/endpoints";
import type { Last7DaysResponse } from "@/src/features/appointments/types";
import type { TokenRefreshService } from "@/src/features/shared/utils/auth";
import type { HomeWeeklyFilter } from "@/src/features/home/types";

type UseLast7DaysParams = {
  accessToken: string | null;
  fetchWithAuth: TokenRefreshService["fetchWithAuth"];
  filters: HomeWeeklyFilter;
};

export function useLast7Days({ accessToken, fetchWithAuth, filters }: UseLast7DaysParams) {
  const [last7DaysData, setLast7DaysData] = useState<Last7DaysResponse | null>(null);
  const [last7DaysLoading, setLast7DaysLoading] = useState(false);
  const [last7DaysError, setLast7DaysError] = useState<string | null>(null);

  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const requestVersion = useRef(0);

  const reload = useCallback(async (signal?: AbortSignal) => {
    if (!accessToken) {
      return false;
    }
    const version = ++requestVersion.current;
    setLast7DaysLoading(true);
    setLast7DaysError(null);
    try {
      const url = new URL(appointmentsLast7DaysEndpoint);
      if (filters.startDate && filters.endDate) {
        url.searchParams.set("start_date", filters.startDate);
        url.searchParams.set("end_date", filters.endDate);
      } else if (filters.month) {
        url.searchParams.set("month", filters.month);
      } else if (filters.day) {
        url.searchParams.set("date", filters.day);
      }

      const response = await fetchWithAuth(url.toString(), {
        cache: "no-store",
        credentials: "include",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        signal,
      });

      if (!response.ok) {
        throw new Error("Não foi possível carregar os dados dos últimos sete dias.");
      }

      const data: Last7DaysResponse = await response.json();
      if (signal?.aborted || version !== requestVersion.current) return false;
      setLast7DaysData(data);
      setUpdatedAt(new Date());
      return true;
    } catch (error) {
      if (!signal?.aborted && version === requestVersion.current) {
        setLast7DaysError(
          error instanceof Error ? error.message : "Erro inesperado ao carregar o gráfico semanal.",
        );
      }
    } finally {
      if (!signal?.aborted && version === requestVersion.current) {
        setLast7DaysLoading(false);
      }
    }
    return false;
  }, [accessToken, fetchWithAuth, filters.day, filters.month, filters.startDate, filters.endDate]);

  useEffect(() => {
    const controller = new AbortController();
    void reload(controller.signal);
    return () => {
      controller.abort();
      requestVersion.current += 1;
    };
  }, [reload]);

  return {
    reload,
    updatedAt,
    last7DaysData,
    last7DaysLoading,
    last7DaysError,
  };
}
