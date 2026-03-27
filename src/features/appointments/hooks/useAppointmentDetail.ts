"use client";

import { useCallback, useEffect, useState } from "react";
import type { TokenRefreshService } from "@/src/features/shared/utils/auth";
import { appointmentsEndpointBase } from "@/src/features/appointments/services/endpoints";
import type { AppointmentItem, AppointmentStatus } from "@/src/features/appointments/types";

type UseAppointmentDetailParams = {
  appointmentId: number | null;
  accessToken: string | null;
  fetchWithAuth: TokenRefreshService["fetchWithAuth"];
  onStatusUpdated?: () => void;
};

export function useAppointmentDetail({
  appointmentId,
  accessToken,
  fetchWithAuth,
  onStatusUpdated,
}: UseAppointmentDetailParams) {
  const [appointmentDetail, setAppointmentDetail] = useState<AppointmentItem | null>(null);
  const [appointmentDetailLoading, setAppointmentDetailLoading] = useState(false);
  const [appointmentDetailError, setAppointmentDetailError] = useState<string | null>(null);
  const [appointmentDetailRefreshToken, setAppointmentDetailRefreshToken] = useState(0);
  const [appointmentStatusUpdating, setAppointmentStatusUpdating] = useState(false);
  const [showAppointmentCancelModal, setShowAppointmentCancelModal] = useState(false);

  useEffect(() => {
    if (!appointmentId || !accessToken) {
      setAppointmentDetail(null);
      setAppointmentDetailError(null);
      setAppointmentDetailLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchAppointmentDetail = async () => {
      setAppointmentDetailLoading(true);
      setAppointmentDetailError(null);
      try {
        const response = await fetchWithAuth(`${appointmentsEndpointBase}${appointmentId}/`, {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Não foi possível carregar o agendamento.");
        }

        const data: AppointmentItem = await response.json();
        setAppointmentDetail(data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setAppointmentDetailError(
            err instanceof Error ? err.message : "Erro inesperado ao carregar o agendamento.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setAppointmentDetailLoading(false);
        }
      }
    };

    void fetchAppointmentDetail();
    return () => controller.abort();
  }, [appointmentId, accessToken, fetchWithAuth, appointmentDetailRefreshToken]);

  const refreshAppointmentDetail = useCallback(() => {
    setAppointmentDetailRefreshToken((previous) => previous + 1);
  }, []);

  const updateAppointmentStatus = useCallback(
    async (status: AppointmentStatus) => {
      if (!appointmentId || !accessToken) {
        return;
      }
      if (appointmentDetail?.status === status) {
        return;
      }

      setAppointmentDetailError(null);
      setAppointmentStatusUpdating(true);
      try {
        const response = await fetchWithAuth(`${appointmentsEndpointBase}${appointmentId}/`, {
          method: "PATCH",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ status }),
        });

        if (!response.ok) {
          let errorMessage = "Não foi possível atualizar o status.";
          try {
            const data = await response.json();
            if (data?.detail) {
              errorMessage = data.detail;
            }
          } catch {
            /* noop */
          }
          throw new Error(errorMessage);
        }

        refreshAppointmentDetail();
        onStatusUpdated?.();
      } catch (err) {
        setAppointmentDetailError(
          err instanceof Error ? err.message : "Erro inesperado ao atualizar o status.",
        );
      } finally {
        setAppointmentStatusUpdating(false);
      }
    },
    [
      accessToken,
      appointmentDetail?.status,
      appointmentId,
      fetchWithAuth,
      onStatusUpdated,
      refreshAppointmentDetail,
    ],
  );

  const openAppointmentCancelModal = useCallback(() => {
    if (appointmentStatusUpdating || appointmentDetailLoading) {
      return;
    }
    setShowAppointmentCancelModal(true);
  }, [appointmentStatusUpdating, appointmentDetailLoading]);

  const closeAppointmentCancelModal = useCallback(() => {
    setShowAppointmentCancelModal(false);
  }, []);

  const confirmAppointmentCancel = useCallback(async () => {
    await updateAppointmentStatus("cancelado");
    setShowAppointmentCancelModal(false);
  }, [updateAppointmentStatus]);

  return {
    appointmentDetail,
    appointmentDetailLoading,
    appointmentDetailError,
    appointmentStatusUpdating,
    showAppointmentCancelModal,
    refreshAppointmentDetail,
    updateAppointmentStatus,
    openAppointmentCancelModal,
    closeAppointmentCancelModal,
    confirmAppointmentCancel,
  };
}
