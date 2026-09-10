"use client";

import { useCallback, useState } from "react";
import {
  financeNewClientsEndpoint,
  financeReturningClientsEndpoint,
} from "@/src/features/finances/services/endpoints";
import type {
  FinanceClientAppointmentsResponse,
  FinanceClientGroup,
} from "@/src/features/finances/types";

type UseFinanceClientAppointmentsParams = {
  accessToken: string | null;
  fetchWithAuth: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
};

export function useFinanceClientAppointments({
  accessToken,
  fetchWithAuth,
}: UseFinanceClientAppointmentsParams) {
  const [data, setData] = useState<FinanceClientAppointmentsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (group: FinanceClientGroup, month: string) => {
      if (!accessToken) {
        setData(null);
        setLoading(false);
        setError("Sessão expirada. Faça login novamente.");
        return;
      }

      setLoading(true);
      setError(null);
      setData(null);

      try {
        const endpoint = group === "new" ? financeNewClientsEndpoint : financeReturningClientsEndpoint;
        const url = new URL(endpoint);
        url.searchParams.set("month", month);
        const response = await fetchWithAuth(url.toString(), {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Não foi possível carregar os clientes e atendimentos.");
        }

        setData((await response.json()) as FinanceClientAppointmentsResponse);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erro inesperado ao carregar os clientes e atendimentos.",
        );
      } finally {
        setLoading(false);
      }
    },
    [accessToken, fetchWithAuth],
  );

  return { data, loading, error, load };
}
