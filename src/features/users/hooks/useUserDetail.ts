"use client";

import { useCallback, useEffect, useState } from "react";
import { env } from "@/lib/env";
import type { TokenRefreshService } from "@/src/features/shared/utils/auth";
import {
  usersEndpointBase,
  professionalProfilesEndpointBase,
  professionalIntervalsEndpointBase,
} from "@/src/features/users/services/endpoints";
import type {
  ClientHistorySummary,
  ProfessionalProfileDetail,
  UserDetail,
} from "@/src/features/users/types";

type UseUserDetailParams = {
  userId: number | null;
  accessToken: string | null;
  fetchWithAuth: TokenRefreshService["fetchWithAuth"];
};

export function useUserDetail({ userId, accessToken, fetchWithAuth }: UseUserDetailParams) {
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);
  const [userDetailError, setUserDetailError] = useState<string | null>(null);
  const [detailRefreshToken, setDetailRefreshToken] = useState(0);
  const [canEditUser, setCanEditUser] = useState(false);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);

  const [showClientHistory, setShowClientHistory] = useState(false);
  const [clientHistoryData, setClientHistoryData] = useState<ClientHistorySummary | null>(null);
  const [clientHistoryLoading, setClientHistoryLoading] = useState(false);
  const [clientHistoryError, setClientHistoryError] = useState<string | null>(null);

  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [showReviewEmailModal, setShowReviewEmailModal] = useState(false);

  // Fetch user detail
  useEffect(() => {
    if (!userId || !accessToken) return;
    const controller = new AbortController();

    const fetchDetail = async () => {
      setUserDetailLoading(true);
      setUserDetailError(null);
      try {
        const response = await fetchWithAuth(`${usersEndpointBase}${userId}/`, {
          credentials: "include",
          headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Não foi possível carregar o usuário.");
        const data: UserDetail = await response.json();
        setUserDetail(data);
        setCanEditUser(false);
      } catch (err) {
        if (!controller.signal.aborted) {
          setUserDetailError(err instanceof Error ? err.message : "Erro ao carregar usuário.");
        }
      } finally {
        if (!controller.signal.aborted) setUserDetailLoading(false);
      }
    };

    fetchDetail();
    return () => controller.abort();
  }, [userId, accessToken, fetchWithAuth, detailRefreshToken]);

  // Fetch client history
  useEffect(() => {
    if (!showClientHistory || !userId || !accessToken) return;
    const controller = new AbortController();

    const fetchHistory = async () => {
      setClientHistoryLoading(true);
      setClientHistoryError(null);
      try {
        const response = await fetchWithAuth(
          `${env.apiBaseUrl}/dashboard/appointments/summary/${userId}/`,
          {
            credentials: "include",
            headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
            signal: controller.signal,
          },
        );
        if (!response.ok) throw new Error("Não foi possível carregar o histórico.");
        const data: ClientHistorySummary = await response.json();
        setClientHistoryData(data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setClientHistoryError(err instanceof Error ? err.message : "Erro ao carregar histórico.");
        }
      } finally {
        if (!controller.signal.aborted) setClientHistoryLoading(false);
      }
    };

    fetchHistory();
    return () => controller.abort();
  }, [showClientHistory, userId, accessToken, fetchWithAuth]);

  const toggleEdit = useCallback(() => setCanEditUser((prev) => !prev), []);

  const refreshUserDetail = useCallback(() => {
    setDetailRefreshToken((prev) => prev + 1);
  }, []);

  const updateUser = useCallback(
    async (
      payload: Record<string, unknown> | FormData,
    ): Promise<{ success: boolean; error?: string }> => {
      if (!accessToken || !userId) return { success: false, error: "Sessão expirada." };
      setIsUpdatingUser(true);
      try {
        const response = await fetchWithAuth(`${usersEndpointBase}${userId}/`, {
          method: "PATCH",
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: payload instanceof FormData ? payload : JSON.stringify(payload),
          ...(payload instanceof FormData
            ? {}
            : { headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${accessToken}` } }),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => null);
          const detail = (data && (data.detail || data.message)) || "Não foi possível atualizar o usuário.";
          return { success: false, error: detail };
        }
        const updated: UserDetail = await response.json();
        setUserDetail(updated);
        setCanEditUser(false);
        return { success: true };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Erro ao atualizar." };
      } finally {
        setIsUpdatingUser(false);
      }
    },
    [accessToken, userId, fetchWithAuth],
  );

  const updateProfessionalProfile = useCallback(
    async (
      profileId: number | undefined,
      payload: Partial<ProfessionalProfileDetail>,
    ): Promise<{ success: boolean; error?: string }> => {
      if (!accessToken) return { success: false, error: "Sessão expirada." };

      const url = profileId
        ? `${professionalProfilesEndpointBase}${profileId}/`
        : professionalProfilesEndpointBase;
      const method = profileId ? "PATCH" : "POST";

      try {
        const response = await fetchWithAuth(url, {
          method,
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
          const detail = (data && (data.detail || data.message)) || "Não foi possível salvar o perfil.";
          return { success: false, error: detail };
        }
        const updated: ProfessionalProfileDetail = await response.json();
        setUserDetail((prev) => (prev ? { ...prev, professional_profile: updated } : prev));
        return { success: true };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Erro ao salvar perfil." };
      }
    },
    [accessToken, fetchWithAuth],
  );

  const sendPasswordReset = useCallback(
    async (password: string): Promise<{ success: boolean; error?: string }> => {
      if (!accessToken || !userId) return { success: false, error: "Sessão expirada." };
      try {
        const response = await fetchWithAuth(
          `${env.apiBaseUrl}/dashboard/auth/password-change/`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ user_id: userId, password }),
          },
        );
        if (!response.ok) {
          const data = await response.json().catch(() => null);
          const detail = (data && (data.detail || data.message)) || "Não foi possível redefinir a senha.";
          return { success: false, error: detail };
        }
        return { success: true };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Erro ao redefinir senha." };
      }
    },
    [accessToken, userId, fetchWithAuth],
  );

  const sendReviewEmail = useCallback(
    async (): Promise<{ success: boolean; error?: string }> => {
      if (!accessToken || !userId) return { success: false, error: "Sessão expirada." };
      try {
        const response = await fetchWithAuth(
          `${usersEndpointBase}${userId}/send-appointment-review-email/`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        if (!response.ok) {
          const data = await response.json().catch(() => null);
          const detail = (data && (data.detail || data.message)) || "Não foi possível enviar o email de avaliação.";
          return { success: false, error: detail };
        }
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Erro ao enviar email de avaliação.",
        };
      }
    },
    [accessToken, userId, fetchWithAuth],
  );

  const addProfessionalInterval = useCallback(
    async (payload: Record<string, unknown>): Promise<{ success: boolean; error?: string }> => {
      if (!accessToken) return { success: false, error: "Sessão expirada." };
      try {
        const response = await fetchWithAuth(professionalIntervalsEndpointBase, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) return { success: false, error: "Não foi possível criar o intervalo." };
        return { success: true };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Erro ao criar intervalo." };
      }
    },
    [accessToken, fetchWithAuth],
  );

  return {
    userDetail,
    userDetailLoading,
    userDetailError,
    canEditUser,
    isUpdatingUser,
    showClientHistory,
    setShowClientHistory,
    clientHistoryData,
    clientHistoryLoading,
    clientHistoryError,
    showPasswordResetModal,
    setShowPasswordResetModal,
    showReviewEmailModal,
    setShowReviewEmailModal,
    toggleEdit,
    updateUser,
    updateProfessionalProfile,
    sendPasswordReset,
    addProfessionalInterval,
    sendReviewEmail,
    refreshUserDetail,
  };
}
