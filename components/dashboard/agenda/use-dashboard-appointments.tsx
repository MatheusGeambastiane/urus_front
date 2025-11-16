"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { DashboardApiError, useDashboard } from "@/components/dashboard/dashboard-provider";

export type AppointmentStatus = "agendado" | "iniciado" | "realizado";

type AppointmentService = {
  id: number;
  name: string;
};

export type AppointmentListItem = {
  id: number;
  client_name: string | null;
  professional_name: string | null;
  date_time: string;
  status: AppointmentStatus;
  services: AppointmentService[];
  price_paid: string;
};

type AppointmentsResponse = {
  results: AppointmentListItem[];
  count: number;
  completed_total_count?: number;
  completed_total_price?: string;
};

export type NewAppointmentPayload = {
  clientId: number;
  professionalId: number;
  serviceIds: number[];
  paymentType: "pix" | "dinheiro" | "credito" | "debito";
  startsAtIso: string;
  price: number;
  status?: AppointmentStatus;
};

type AppointmentSummary = {
  totalCount: number;
  completedCount: number;
  completedValue: number;
};

type HookState = {
  appointments: AppointmentListItem[];
  isLoading: boolean;
  error: string | null;
  summary: AppointmentSummary;
  dateFilter: string;
  statusFilter: AppointmentStatus;
  setDateFilter: (value: string) => void;
  setStatusFilter: (value: AppointmentStatus) => void;
  refresh: () => Promise<void>;
  createAppointment: (payload: NewAppointmentPayload) => Promise<AppointmentListItem>;
};

const defaultSummary: AppointmentSummary = {
  totalCount: 0,
  completedCount: 0,
  completedValue: 0,
};

const toCurrency = (value: string | number) => {
  const parsed = typeof value === "number" ? value : Number.parseFloat(value ?? "0");
  return Number.isFinite(parsed) ? parsed : 0;
};

export function useDashboardAppointments(initialDate: string): HookState {
  const { fetchDashboard } = useDashboard();
  const [appointments, setAppointments] = useState<AppointmentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<AppointmentSummary>(defaultSummary);
  const [dateFilter, setDateFilter] = useState(initialDate);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus>("agendado");

  const fetchList = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);
      try {
        const searchParams = new URLSearchParams({ date: dateFilter, status: statusFilter });
        const response = await fetchDashboard<AppointmentsResponse>(
          `/dashboard/appointments/?${searchParams.toString()}`,
          { signal },
        );
        if (signal?.aborted) {
          return;
        }
        setAppointments(response.results);
        setSummary({
          totalCount: response.count,
          completedCount: response.completed_total_count ?? 0,
          completedValue: toCurrency(response.completed_total_price ?? 0),
        });
      } catch (err) {
        if (signal?.aborted) {
          return;
        }
        const message =
          err instanceof DashboardApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Erro inesperado ao carregar agendamentos.";
        setError(message);
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [dateFilter, fetchDashboard, statusFilter],
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetchList(controller.signal);
    return () => controller.abort();
  }, [fetchList]);

  const refresh = useCallback(async () => {
    await fetchList();
  }, [fetchList]);

  const createAppointment = useCallback<HookState["createAppointment"]>(
    async ({ clientId, professionalId, serviceIds, paymentType, startsAtIso, price, status = "agendado" }) => {
      const payload = {
        client: clientId,
        professional: professionalId,
        services: serviceIds,
        payment_type: paymentType,
        date_time: startsAtIso,
        price_paid: price.toFixed(2),
        status,
      };

      const appointment = await fetchDashboard<AppointmentListItem>("/dashboard/appointments/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setAppointments((previous) => [appointment, ...previous]);
      setSummary((previous) => ({
        ...previous,
        totalCount: previous.totalCount + 1,
      }));

      return appointment;
    },
    [fetchDashboard],
  );

  return useMemo(
    () => ({
      appointments,
      isLoading,
      error,
      summary,
      dateFilter,
      statusFilter,
      setDateFilter,
      setStatusFilter,
      refresh,
      createAppointment,
    }),
    [appointments, createAppointment, dateFilter, error, isLoading, refresh, statusFilter, summary],
  );
}
