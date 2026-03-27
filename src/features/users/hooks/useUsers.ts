"use client";

import { useCallback, useEffect, useState } from "react";
import type { TokenRefreshService } from "@/src/features/shared/utils/auth";
import {
  usersEndpointBase,
  roleChoicesEndpoint,
} from "@/src/features/users/services/endpoints";
import type { RoleOption, UserItem, UsersResponse } from "@/src/features/users/types";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

type UseUsersParams = {
  accessToken: string | null;
  fetchWithAuth: TokenRefreshService["fetchWithAuth"];
};

export function useUsers({ accessToken, fetchWithAuth }: UseUsersParams) {
  const [usersData, setUsersData] = useState<UsersResponse | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [usersRefreshToken, setUsersRefreshToken] = useState(0);

  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(PAGE_SIZE_OPTIONS[0]);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

  const [usersEndpoint, setUsersEndpoint] = useState(() => {
    const url = new URL(usersEndpointBase);
    url.searchParams.set("page_size", PAGE_SIZE_OPTIONS[0].toString());
    return url.toString();
  });

  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  const [roleOptionsError, setRoleOptionsError] = useState<string | null>(null);

  // Fetch role options
  useEffect(() => {
    if (!accessToken) return;
    const controller = new AbortController();

    const fetchRoleOptions = async () => {
      try {
        const response = await fetchWithAuth(roleChoicesEndpoint, {
          credentials: "include",
          headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Não foi possível carregar os tipos de usuário.");
        const data: RoleOption[] = await response.json();
        setRoleOptions(data);
        setRoleOptionsError(null);
      } catch (err) {
        if (!controller.signal.aborted) {
          setRoleOptionsError(
            err instanceof Error ? err.message : "Erro ao carregar tipos de usuário.",
          );
        }
      }
    };

    fetchRoleOptions();
    return () => controller.abort();
  }, [accessToken, fetchWithAuth]);

  // Fetch users list
  useEffect(() => {
    if (!accessToken) return;
    const controller = new AbortController();

    const fetchUsers = async () => {
      setUsersLoading(true);
      setUsersError(null);
      try {
        const response = await fetchWithAuth(usersEndpoint, {
          credentials: "include",
          headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Não foi possível carregar os usuários.");
        const data: UsersResponse = await response.json();
        setUsersData(data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setUsersError(err instanceof Error ? err.message : "Erro ao carregar usuários.");
        }
      } finally {
        if (!controller.signal.aborted) setUsersLoading(false);
      }
    };

    fetchUsers();
    return () => controller.abort();
  }, [accessToken, fetchWithAuth, usersEndpoint, usersRefreshToken]);

  const buildEndpoint = useCallback(
    (overrides: { search?: string; role?: string | null; size?: number } = {}) => {
      const url = new URL(usersEndpointBase);
      const resolvedSearch = overrides.search ?? searchTerm;
      const resolvedRole = "role" in overrides ? overrides.role : roleFilter;
      const resolvedSize = overrides.size ?? pageSize;
      url.searchParams.set("page_size", resolvedSize.toString());
      if (resolvedSearch) url.searchParams.set("search", resolvedSearch);
      if (resolvedRole) url.searchParams.set("role", resolvedRole);
      return url.toString();
    },
    [searchTerm, roleFilter, pageSize],
  );

  const handleSearchSubmit = useCallback(() => {
    const trimmed = searchInput.trim();
    setSearchTerm(trimmed);
    setUsersEndpoint(buildEndpoint({ search: trimmed }));
  }, [searchInput, buildEndpoint]);

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setSearchTerm("");
    setUsersEndpoint(buildEndpoint({ search: "" }));
  }, [buildEndpoint]);

  const handleRoleSelect = useCallback(
    (role: string | null) => {
      setRoleFilter(role);
      setUsersEndpoint(buildEndpoint({ role }));
    },
    [buildEndpoint],
  );

  const handlePageSizeChange = useCallback(
    (size: number) => {
      const newSize = size as (typeof PAGE_SIZE_OPTIONS)[number];
      setPageSize(newSize);
      setUsersEndpoint(buildEndpoint({ size: newSize }));
    },
    [buildEndpoint],
  );

  const handlePagination = useCallback((direction: "next" | "previous") => {
    const target = direction === "next" ? usersData?.next : usersData?.previous;
    if (target) setUsersEndpoint(target);
  }, [usersData]);

  const refreshUsers = useCallback(() => {
    setUsersRefreshToken((prev) => prev + 1);
  }, []);

  const usersList = usersData?.results ?? [];
  const totalUsers = usersData?.count ?? 0;

  return {
    usersList,
    totalUsers,
    usersLoading,
    usersError,
    hasNext: !!usersData?.next,
    hasPrevious: !!usersData?.previous,
    pageSize,
    PAGE_SIZE_OPTIONS,
    searchInput,
    setSearchInput,
    searchTerm,
    roleFilter,
    roleOptions,
    roleOptionsError,
    handleSearchSubmit,
    handleClearSearch,
    handleRoleSelect,
    handlePageSizeChange,
    handlePagination,
    refreshUsers,
  };
}
