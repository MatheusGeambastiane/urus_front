"use client";

import { useCallback, useEffect, useState } from "react";

import { productSalesDashboardEndpoint } from "@/src/features/products/services/endpoints";
import type { ProductSalesDashboard } from "@/src/features/products/types";

type SalesDashboardFilter =
  | { mode: "month"; month: string }
  | { mode: "range"; startDate: string; endDate: string };

type Params = {
  accessToken: string | null;
  fetchWithAuth: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  filter: SalesDashboardFilter;
};

export function useProductSalesDashboard({ accessToken, fetchWithAuth, filter }: Params) {
  const [data, setData] = useState<ProductSalesDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) {
      setData(null);
      setError("Sessão expirada. Faça login novamente.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const url = new URL(productSalesDashboardEndpoint);
      if (filter.mode === "month") {
        url.searchParams.set("month", filter.month);
      } else {
        url.searchParams.set("start_date", filter.startDate);
        url.searchParams.set("end_date", filter.endDate);
      }
      const response = await fetchWithAuth(url.toString(), {
        credentials: "include",
        headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) {
        throw new Error("Não foi possível carregar o dashboard de vendas.");
      }
      setData((await response.json()) as ProductSalesDashboard);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Erro inesperado ao carregar as vendas.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, fetchWithAuth, filter]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, refresh: load };
}
