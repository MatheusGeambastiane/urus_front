"use client";

import { useCallback, useEffect, useState } from "react";
import type { TokenRefreshService } from "@/src/features/shared/utils/auth";
import {
  servicesEndpointBase,
  serviceCategoriesEndpoint,
  serviceCategoriesBaseEndpoint,
  productUsagesEndpointBase,
} from "@/src/features/services/services/endpoints";
import type {
  ServiceCategoryOption,
  ServiceItem,
  ServicesResponse,
} from "@/src/features/services/types";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

type UseServicesParams = {
  accessToken: string | null;
  fetchWithAuth: TokenRefreshService["fetchWithAuth"];
};

export function useServices({ accessToken, fetchWithAuth }: UseServicesParams) {
  const [servicesList, setServicesList] = useState<ServiceItem[]>([]);
  const [servicesCount, setServicesCount] = useState(0);
  const [servicesNextPage, setServicesNextPage] = useState<string | null>(null);
  const [servicesPreviousPage, setServicesPreviousPage] = useState<string | null>(null);
  const [servicesPageSize, setServicesPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(
    PAGE_SIZE_OPTIONS[0],
  );
  const [servicesPageUrl, setServicesPageUrl] = useState<string | null>(null);
  const [servicesFetchError, setServicesFetchError] = useState<string | null>(null);
  const [servicesSearchInput, setServicesSearchInput] = useState("");
  const [servicesSearchTerm, setServicesSearchTerm] = useState("");
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<number | null>(null);
  const [servicesLoadingList, setServicesLoadingList] = useState(false);
  const [servicesRefreshToken, setServicesRefreshToken] = useState(0);

  const [serviceCategories, setServiceCategories] = useState<ServiceCategoryOption[]>([]);
  const [serviceCategoriesError, setServiceCategoriesError] = useState<string | null>(null);
  const [serviceCategoriesRefreshToken, setServiceCategoriesRefreshToken] = useState(0);

  // Fetch service categories
  useEffect(() => {
    if (!accessToken) return;
    const controller = new AbortController();

    const fetchCategories = async () => {
      try {
        const response = await fetchWithAuth(serviceCategoriesEndpoint, {
          credentials: "include",
          headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Não foi possível carregar as categorias.");
        const data: ServiceCategoryOption[] = await response.json();
        setServiceCategories(data);
        setServiceCategoriesError(null);
      } catch (err) {
        if (!controller.signal.aborted) {
          setServiceCategoriesError(
            err instanceof Error ? err.message : "Erro ao carregar categorias.",
          );
        }
      }
    };

    fetchCategories();
    return () => controller.abort();
  }, [accessToken, fetchWithAuth, serviceCategoriesRefreshToken]);

  // Fetch services list
  useEffect(() => {
    if (!accessToken) return;
    const controller = new AbortController();

    const fetchServices = async () => {
      setServicesLoadingList(true);
      setServicesFetchError(null);
      try {
        const url = servicesPageUrl
          ? new URL(servicesPageUrl)
          : new URL(servicesEndpointBase);
        if (!servicesPageUrl) {
          url.searchParams.set("page_size", servicesPageSize.toString());
          if (servicesSearchTerm) url.searchParams.set("search", servicesSearchTerm);
          if (selectedServiceCategory)
            url.searchParams.set("category_id", String(selectedServiceCategory));
        }
        const response = await fetchWithAuth(url.toString(), {
          credentials: "include",
          headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Não foi possível carregar os serviços.");
        const data: ServicesResponse = await response.json();
        setServicesList(data.results);
        setServicesCount(data.count);
        setServicesNextPage(data.next);
        setServicesPreviousPage(data.previous);
      } catch (err) {
        if (!controller.signal.aborted) {
          setServicesList([]);
          setServicesCount(0);
          setServicesNextPage(null);
          setServicesPreviousPage(null);
          setServicesFetchError(
            err instanceof Error ? err.message : "Erro ao carregar serviços.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setServicesLoadingList(false);
      }
    };

    fetchServices();
    return () => controller.abort();
  }, [
    accessToken,
    fetchWithAuth,
    servicesPageUrl,
    servicesPageSize,
    servicesSearchTerm,
    selectedServiceCategory,
    servicesRefreshToken,
  ]);

  const handleServiceSearchSubmit = useCallback(() => {
    setServicesSearchTerm(servicesSearchInput.trim());
    setServicesPageUrl(null);
  }, [servicesSearchInput]);

  const handleClearSearch = useCallback(() => {
    setServicesSearchInput("");
    setServicesSearchTerm("");
    setServicesPageUrl(null);
  }, []);

  const handleServiceCategorySelect = useCallback((categoryId: number | null) => {
    setSelectedServiceCategory(categoryId);
    setServicesPageUrl(null);
  }, []);

  const handleServicesPageSizeChange = useCallback((size: number) => {
    setServicesPageSize(size as (typeof PAGE_SIZE_OPTIONS)[number]);
    setServicesPageUrl(null);
  }, []);

  const handleServicesPagination = useCallback(
    (direction: "next" | "previous") => {
      const target = direction === "next" ? servicesNextPage : servicesPreviousPage;
      if (target) setServicesPageUrl(target);
    },
    [servicesNextPage, servicesPreviousPage],
  );

  const refreshServicesList = useCallback(() => {
    setServicesRefreshToken((prev) => prev + 1);
  }, []);

  const refreshCategories = useCallback(() => {
    setServiceCategoriesRefreshToken((prev) => prev + 1);
  }, []);

  const createServiceCategory = useCallback(
    async (name: string, icon: File | null): Promise<{ success: boolean; error?: string }> => {
      if (!accessToken) return { success: false, error: "Sessão expirada." };
      if (!name.trim()) return { success: false, error: "Informe o nome da categoria." };

      const formData = new FormData();
      formData.append("name", name.trim());
      if (icon) formData.append("icon", icon);

      try {
        const response = await fetchWithAuth(serviceCategoriesBaseEndpoint, {
          method: "POST",
          credentials: "include",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        });
        if (!response.ok) {
          const data = await response.json().catch(() => null);
          const detail = (data && (data.detail || data.message)) || "Não foi possível criar a categoria.";
          return { success: false, error: detail };
        }
        refreshCategories();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Erro ao criar categoria.",
        };
      }
    },
    [accessToken, fetchWithAuth, refreshCategories],
  );

  const deleteProductUsage = useCallback(
    async (
      usageId: number,
      accessToken: string,
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const response = await fetchWithAuth(`${productUsagesEndpointBase}${usageId}/`, {
          method: "DELETE",
          credentials: "include",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) return { success: false, error: "Não foi possível remover o produto." };
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Erro ao remover produto.",
        };
      }
    },
    [fetchWithAuth],
  );

  return {
    // List state
    servicesList,
    servicesCount,
    servicesNextPage,
    servicesPreviousPage,
    servicesPageSize,
    servicesLoadingList,
    servicesFetchError,
    servicesSearchInput,
    setServicesSearchInput,
    servicesSearchTerm,
    selectedServiceCategory,
    PAGE_SIZE_OPTIONS,
    // Categories state
    serviceCategories,
    serviceCategoriesError,
    // Actions
    handleServiceSearchSubmit,
    handleClearSearch,
    handleServiceCategorySelect,
    handleServicesPageSizeChange,
    handleServicesPagination,
    refreshServicesList,
    createServiceCategory,
    deleteProductUsage,
  };
}
