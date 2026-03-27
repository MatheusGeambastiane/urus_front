"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const controller = new AbortController();

    const fetchLast7Days = async () => {
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
          url.searchParams.set("day", filters.day);
        }

        const response = await fetchWithAuth(url.toString(), {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Não foi possível carregar os dados dos últimos sete dias.");
        }

        const data: Last7DaysResponse = await response.json();
        setLast7DaysData(data);
      } catch (error) {
        if (!controller.signal.aborted) {
          setLast7DaysError(
            error instanceof Error ? error.message : "Erro inesperado ao carregar o gráfico semanal.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLast7DaysLoading(false);
        }
      }
    };

    void fetchLast7Days();
    return () => controller.abort();
  }, [accessToken, fetchWithAuth, filters.day, filters.month, filters.startDate, filters.endDate]);

  return {
    last7DaysData,
    last7DaysLoading,
    last7DaysError,
  };
}
