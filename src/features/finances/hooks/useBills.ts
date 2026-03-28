"use client";

import { useCallback, useEffect, useState } from "react";
import { billsEndpointBase } from "@/src/features/finances/services/endpoints";
import type { BillDetail, BillItem } from "@/src/features/bills/types";
import { transactionsEndpointBase } from "@/src/features/products/services/endpoints";
import { formatDateParam } from "@/src/features/shared/utils/date";

type FetchWithAuth = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

type UseBillsParams = {
  accessToken: string | null;
  fetchWithAuth: FetchWithAuth;
  month: string;
};

type BillInput = {
  name: string;
  value: string;
  type: string;
  bill_type: string;
  finish_month: string | null;
  date_of_payment: string;
  is_paid?: boolean;
};

type BillPaymentInput = {
  price: string;
  transaction_payment: string;
  money_resource: string;
  payment_proof: File | null;
};

export function useBills({ accessToken, fetchWithAuth, month }: UseBillsParams) {
  const [bills, setBills] = useState<BillItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailCache, setDetailCache] = useState<Record<number, BillDetail>>({});

  const refresh = useCallback(async () => {
    if (!accessToken) {
      setBills([]);
      setError("Sessão expirada. Faça login novamente.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const url = new URL(billsEndpointBase);
      url.searchParams.set("month", month);

      const response = await fetchWithAuth(url.toString(), {
        credentials: "include",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Não foi possível carregar as contas.");
      }

      const data = (await response.json()) as BillItem[] | { results?: BillItem[] };
      setBills(Array.isArray(data) ? data : data.results ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado ao carregar as contas.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, fetchWithAuth, month]);

  const fetchDetail = useCallback(async (billId: number, force = false) => {
    if (!accessToken) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    if (!force && detailCache[billId]) {
      return detailCache[billId];
    }

    const response = await fetchWithAuth(`${billsEndpointBase}${billId}/`, {
      credentials: "include",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Não foi possível carregar os detalhes da conta.");
    }

    const data = (await response.json()) as BillDetail;
    setDetailCache((previous) => ({ ...previous, [billId]: data }));
    setBills((previous) =>
      previous.map((item) =>
        item.id === data.id
          ? {
              ...item,
              name: data.name,
              bill_type: data.bill_type,
              value: data.value,
              is_paid: data.is_paid,
              date_of_payment: data.date_of_payment,
            }
          : item,
      ),
    );
    return data;
  }, [accessToken, detailCache, fetchWithAuth]);

  const createBill = useCallback(async (payload: BillInput) => {
    if (!accessToken) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    const response = await fetchWithAuth(billsEndpointBase, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.detail ?? "Não foi possível criar a conta.");
    }

    const created = (await response.json()) as BillItem;
    setBills((previous) => [created, ...previous]);
    return created;
  }, [accessToken, fetchWithAuth]);

  const updateBill = useCallback(async (billId: number, payload: BillInput) => {
    if (!accessToken) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    const response = await fetchWithAuth(`${billsEndpointBase}${billId}/`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.detail ?? "Não foi possível atualizar a conta.");
    }

    return fetchDetail(billId, true);
  }, [accessToken, fetchDetail, fetchWithAuth]);

  const registerPayment = useCallback(async (billId: number, payload: BillPaymentInput) => {
    if (!accessToken) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    const formData = new FormData();
    formData.append("type", "payment");
    formData.append("price", payload.price);
    formData.append("date_of_transaction", formatDateParam(new Date()));
    formData.append("transaction_payment", payload.transaction_payment);
    formData.append("money_resource", payload.money_resource);
    formData.append("bill", String(billId));
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

    return fetchDetail(billId, true);
  }, [accessToken, fetchDetail, fetchWithAuth]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    bills,
    loading,
    error,
    refresh,
    fetchDetail,
    createBill,
    updateBill,
    registerPayment,
  };
}
