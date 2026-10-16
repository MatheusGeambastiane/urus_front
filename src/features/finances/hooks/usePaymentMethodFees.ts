"use client";

import { useCallback, useEffect, useState } from "react";

import { paymentMethodFeesEndpoint } from "@/src/features/finances/services/endpoints";
import type { PaymentMethodFee } from "@/src/features/finances/types";

type Params = {
  accessToken: string | null;
  fetchWithAuth: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  enabled: boolean;
};

export function usePaymentMethodFees({ accessToken, fetchWithAuth, enabled }: Params) {
  const [fees, setFees] = useState<PaymentMethodFee[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async (init?: RequestInit) => {
    if (!accessToken) throw new Error("Sessão expirada. Faça login novamente.");
    const response = await fetchWithAuth(paymentMethodFeesEndpoint, {
      credentials: "include",
      ...init,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...init?.headers,
      },
    });
    if (!response.ok) throw new Error("Não foi possível salvar as taxas de pagamento.");
    return (await response.json()) as { fees: PaymentMethodFee[] };
  }, [accessToken, fetchWithAuth]);

  const load = useCallback(async () => {
    if (!enabled || !accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const payload = await request();
      setFees(payload.fees);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Erro ao carregar as taxas.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, enabled, request]);

  const save = useCallback(async (nextFees: PaymentMethodFee[]) => {
    setSaving(true);
    setError(null);
    try {
      const payload = await request({
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fees: nextFees.map(({ payment_method, rate }) => ({ payment_method, rate })) }),
      });
      setFees(payload.fees);
      return payload.fees;
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Erro ao salvar as taxas.";
      setError(message);
      throw saveError;
    } finally {
      setSaving(false);
    }
  }, [request]);

  useEffect(() => {
    void load();
  }, [load]);

  return { fees, loading, saving, error, save };
}
