"use client";

import { useCallback, useEffect, useState } from "react";
import {
  professionalServiceSummaryEndpointBase,
  repassesEndpoint,
  repassesRecalculateEndpointBase,
} from "@/src/features/finances/services/endpoints";
import type { ProfessionalServiceSummary, RepasseDetail, RepasseItem } from "@/src/features/repasses/types";
import { transactionsEndpointBase } from "@/src/features/products/services/endpoints";
import { formatDateParam } from "@/src/features/shared/utils/date";

type FetchWithAuth = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

type UseRepassesParams = {
  accessToken: string | null;
  fetchWithAuth: FetchWithAuth;
  month: string;
  userRole?: string;
};

type RepassePaymentInput = {
  price: string;
  transaction_payment: string;
  money_resource: string;
  payment_proof: File | null;
};

export function useRepasses({ accessToken, fetchWithAuth, month, userRole }: UseRepassesParams) {
  const [repasses, setRepasses] = useState<RepasseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recalculating, setRecalculating] = useState(false);
  const [detailCache, setDetailCache] = useState<Record<number, RepasseDetail>>({});

  const refresh = useCallback(async () => {
    if (!accessToken) {
      setRepasses([]);
      setError("Sessão expirada. Faça login novamente.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const url = new URL(repassesEndpoint);
      url.searchParams.set("month", month);

      const response = await fetchWithAuth(url.toString(), {
        credentials: "include",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Não foi possível carregar os repasses.");
      }

      const data = (await response.json()) as RepasseItem[] | { results?: RepasseItem[] };
      setRepasses(Array.isArray(data) ? data : data.results ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado ao carregar os repasses.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, fetchWithAuth, month]);

  const fetchDetail = useCallback(async (repasseId: number, force = false) => {
    if (!accessToken) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    if (!force && detailCache[repasseId]) {
      return detailCache[repasseId];
    }

    const response = await fetchWithAuth(`${repassesEndpoint}${repasseId}/`, {
      credentials: "include",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Não foi possível carregar os detalhes do repasse.");
    }

    const data = (await response.json()) as RepasseDetail;
    setDetailCache((previous) => ({ ...previous, [repasseId]: data }));
    setRepasses((previous) =>
      previous.map((item) =>
        item.id === data.id
          ? {
              ...item,
              allowence: data.allowence,
              invoice: data.invoice,
              is_paid: data.is_paid,
              value_service: data.value_service,
              value_product: data.value_product,
              value_tips: data.value_tips,
            }
          : item,
      ),
    );
    return data;
  }, [accessToken, detailCache, fetchWithAuth]);

  const recalculate = useCallback(async () => {
    if (!accessToken || repasses.length === 0) {
      return;
    }

    setRecalculating(true);
    setError(null);
    try {
      const professionalIds = Array.from(new Set(repasses.map((item) => item.professional.id)));
      await Promise.all(
        professionalIds.map(async (professionalId) => {
          const url = new URL(repassesRecalculateEndpointBase);
          url.searchParams.set("month", month);
          url.searchParams.set("professional_profile_id", String(professionalId));

          const response = await fetchWithAuth(url.toString(), {
            method: "POST",
            credentials: "include",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!response.ok) {
            throw new Error("Não foi possível recalcular os repasses.");
          }
        }),
      );

      await refresh();
    } finally {
      setRecalculating(false);
    }
  }, [accessToken, fetchWithAuth, month, refresh, repasses]);

  const updateAllowance = useCallback(async (repasseId: number, allowence: string) => {
    if (!accessToken) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    const response = await fetchWithAuth(`${repassesEndpoint}${repasseId}/`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ allowence }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.detail ?? "Não foi possível atualizar a ajuda de custo.");
    }

    return fetchDetail(repasseId, true);
  }, [accessToken, fetchDetail, fetchWithAuth]);

  const uploadInvoice = useCallback(async (repasseId: number, file: File) => {
    if (!accessToken) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    const formData = new FormData();
    formData.append("invoice", file);

    const response = await fetchWithAuth(`${repassesEndpoint}${repasseId}/`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.detail ?? "Não foi possível cadastrar a nota fiscal.");
    }

    return fetchDetail(repasseId, true);
  }, [accessToken, fetchDetail, fetchWithAuth]);

  const registerPayment = useCallback(async (detail: RepasseDetail, payload: RepassePaymentInput) => {
    if (!accessToken) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    const formData = new FormData();
    formData.append("type", "payment");
    formData.append("price", payload.price);
    formData.append("date_of_transaction", formatDateParam(new Date()));
    formData.append("transaction_payment", payload.transaction_payment);
    formData.append("money_resource", payload.money_resource);
    formData.append("user", String(detail.professional.user_id ?? detail.professional.id));
    if (payload.payment_proof) {
      formData.append("payment_proof", payload.payment_proof);
    }

    const response = await fetchWithAuth(transactionsEndpointBase, {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.detail ?? "Não foi possível registrar o pagamento.");
    }

    return fetchDetail(detail.id, true);
  }, [accessToken, fetchDetail, fetchWithAuth]);

  const fetchAnalytics = useCallback(async (detail: RepasseDetail) => {
    if (!accessToken) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    const basePath =
      userRole === "professional"
        ? `${professionalServiceSummaryEndpointBase}me/service-summary/`
        : `${professionalServiceSummaryEndpointBase}${detail.professional.id}/service-summary/`;

    const url = new URL(basePath);
    url.searchParams.set("month", detail.month?.slice(0, 7) || month);

    const response = await fetchWithAuth(url.toString(), {
      credentials: "include",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Não foi possível carregar as análises do profissional.");
    }

    return (await response.json()) as ProfessionalServiceSummary;
  }, [accessToken, fetchWithAuth, month, userRole]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    repasses,
    loading,
    error,
    recalculating,
    refresh,
    fetchDetail,
    recalculate,
    updateAllowance,
    uploadInvoice,
    registerPayment,
    fetchAnalytics,
  };
}
