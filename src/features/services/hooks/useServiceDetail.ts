"use client";

import { useCallback, useEffect, useState } from "react";
import type { TokenRefreshService } from "@/src/features/shared/utils/auth";
import {
  servicesEndpointBase,
  productUsagesEndpointBase,
} from "@/src/features/services/services/endpoints";
import type { ProductUsage, ServiceCategoryOption, ServiceItem } from "@/src/features/services/types";

type ServiceDetailItem = ServiceItem & { product_usages: ProductUsage[] };

type UseServiceDetailParams = {
  serviceId: number | null;
  accessToken: string | null;
  fetchWithAuth: TokenRefreshService["fetchWithAuth"];
  serviceCategories: ServiceCategoryOption[];
};

export function useServiceDetail({
  serviceId,
  accessToken,
  fetchWithAuth,
  serviceCategories,
}: UseServiceDetailParams) {
  const [serviceDetail, setServiceDetail] = useState<ServiceDetailItem | null>(null);
  const [serviceDetailLoading, setServiceDetailLoading] = useState(false);
  const [serviceDetailError, setServiceDetailError] = useState<string | null>(null);
  const [canEditService, setCanEditService] = useState(false);
  const [isUpdatingService, setIsUpdatingService] = useState(false);
  const [productUsageDeletingId, setProductUsageDeletingId] = useState<number | null>(null);
  const [isAddingProductUsage, setIsAddingProductUsage] = useState(false);

  useEffect(() => {
    if (!serviceId || !accessToken) return;
    const controller = new AbortController();

    const fetchServiceDetail = async () => {
      setServiceDetailLoading(true);
      setServiceDetailError(null);
      try {
        const response = await fetchWithAuth(`${servicesEndpointBase}${serviceId}/`, {
          credentials: "include",
          headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Não foi possível carregar o serviço.");
        const data = (await response.json()) as ServiceItem & { product_usages?: ProductUsage[] };
        setServiceDetail({ ...data, product_usages: data.product_usages ?? [] });
        setCanEditService(false);
      } catch (err) {
        if (!controller.signal.aborted) {
          setServiceDetailError(
            err instanceof Error ? err.message : "Erro ao carregar serviço.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setServiceDetailLoading(false);
      }
    };

    fetchServiceDetail();
    return () => controller.abort();
  }, [serviceId, accessToken, fetchWithAuth]);

  const toggleEdit = useCallback(() => {
    setCanEditService((prev) => !prev);
  }, []);

  const updateService = useCallback(
    async (values: {
      name: string;
      price: string;
      category: string;
      duration: string;
      isActive: boolean;
    }): Promise<{ success: boolean; error?: string }> => {
      if (!accessToken || !serviceDetail) return { success: false, error: "Sessão expirada." };

      const payload = {
        name: values.name.trim(),
        price: values.price,
        category: Number(values.category),
        duration: values.duration,
        is_active: values.isActive,
      };

      setIsUpdatingService(true);
      try {
        const response = await fetchWithAuth(`${servicesEndpointBase}${serviceDetail.id}/`, {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => null);
          const detail = (data && (data.detail || data.message)) || "Não foi possível atualizar o serviço.";
          return { success: false, error: detail };
        }
        setServiceDetail((prev) =>
          prev
            ? {
                ...prev,
                name: values.name.trim(),
                price: values.price,
                category: Number(values.category),
                category_name:
                  serviceCategories.find((cat) => String(cat.id) === values.category)?.name ||
                  prev.category_name,
                duration: values.duration,
                is_active: values.isActive,
              }
            : prev,
        );
        setCanEditService(false);
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Erro ao atualizar serviço.",
        };
      } finally {
        setIsUpdatingService(false);
      }
    },
    [accessToken, serviceDetail, fetchWithAuth, serviceCategories],
  );

  const deleteProductUsage = useCallback(
    async (usageId: number): Promise<{ success: boolean; error?: string }> => {
      if (!accessToken) return { success: false, error: "Sessão expirada." };
      setProductUsageDeletingId(usageId);
      try {
        const response = await fetchWithAuth(`${productUsagesEndpointBase}${usageId}/`, {
          method: "DELETE",
          credentials: "include",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) return { success: false, error: "Não foi possível remover o produto." };
        setServiceDetail((prev) =>
          prev
            ? { ...prev, product_usages: prev.product_usages.filter((u) => u.id !== usageId) }
            : prev,
        );
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Erro ao remover produto.",
        };
      } finally {
        setProductUsageDeletingId(null);
      }
    },
    [accessToken, fetchWithAuth],
  );

  const addProductUsage = useCallback(
    async (
      productId: number,
      quantity: number,
      productName: string,
    ): Promise<{ success: boolean; error?: string }> => {
      if (!accessToken || !serviceDetail) return { success: false, error: "Sessão expirada." };
      setIsAddingProductUsage(true);
      try {
        const response = await fetchWithAuth(productUsagesEndpointBase, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            service: serviceDetail.id,
            product: productId,
            quantity_used: quantity,
          }),
        });
        if (!response.ok) return { success: false, error: "Não foi possível adicionar o produto." };
        const usageResponse: ProductUsage = await response.json();
        const usage: ProductUsage = {
          ...usageResponse,
          product_name: usageResponse.product_name || productName,
        };
        setServiceDetail((prev) =>
          prev ? { ...prev, product_usages: [...prev.product_usages, usage] } : prev,
        );
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Erro ao adicionar produto.",
        };
      } finally {
        setIsAddingProductUsage(false);
      }
    },
    [accessToken, serviceDetail, fetchWithAuth],
  );

  return {
    serviceDetail,
    serviceDetailLoading,
    serviceDetailError,
    canEditService,
    isUpdatingService,
    productUsageDeletingId,
    isAddingProductUsage,
    toggleEdit,
    updateService,
    deleteProductUsage,
    addProductUsage,
  };
}
