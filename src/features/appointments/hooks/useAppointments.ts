"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { TokenRefreshService } from "@/src/features/shared/utils/auth";
import { formatDateParam, formatDatePillLabel } from "@/src/features/shared/utils/date";
import { appointmentsEndpointBase, dayRestrictionsEndpointBase, professionalProfilesSimpleListEndpoint } from "@/src/features/appointments/services/endpoints";
import { serviceCategoriesEndpoint } from "@/src/features/services/services/endpoints";
import type { ProfessionalSimple, ServiceCategoryOption, ServiceOption } from "@/src/features/services/types";
import type { AppointmentsResponse, AppointmentItem, AppointmentStatus } from "@/src/features/appointments/types";

type UseAppointmentsParams = {
  accessToken: string | null;
  fetchWithAuth: TokenRefreshService["fetchWithAuth"];
};

type DayRestrictionForm = {
  startDate: string;
  finishDate: string;
  startTime: string;
  finishTime: string;
  isAllDay: boolean;
};

const DASHBOARD_TIMEZONE_OFFSET = "-03:00";

const buildDateTimeWithTimezoneOffset = (date: string, time: string) => {
  if (!date || !time) {
    return null;
  }
  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  return `${date}T${normalizedTime}${DASHBOARD_TIMEZONE_OFFSET}`;
};

export function useAppointments({ accessToken, fetchWithAuth }: UseAppointmentsParams) {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [appointmentsSummary, setAppointmentsSummary] = useState({
    completed_total_price: "0",
    completed_total_count: 0,
    total: 0,
    total_scheduled: "0",
    scheduled_status_total: 0,
    scheduled_by_professional: [] as AppointmentsResponse["scheduled_by_professional"],
  });
  const [showAppointmentsSummaryDetails, setShowAppointmentsSummaryDetails] = useState(false);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);
  const [appointmentsRefreshToken, setAppointmentsRefreshToken] = useState(0);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [startDateFilter, setStartDateFilter] = useState<string | null>(null);
  const [endDateFilter, setEndDateFilter] = useState<string | null>(null);
  const [filterServiceId, setFilterServiceId] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState<string | null>(null);
  const [filterProfessionalId, setFilterProfessionalId] = useState<string | null>(null);

  const [showAppointmentsFilterModal, setShowAppointmentsFilterModal] = useState(false);
  const [pendingStartDate, setPendingStartDate] = useState("");
  const [pendingEndDate, setPendingEndDate] = useState("");
  const [pendingServiceId, setPendingServiceId] = useState("");
  const [pendingProfessionalId, setPendingProfessionalId] = useState("");
  const [pendingCategoryId, setPendingCategoryId] = useState("");

  const [professionalsList, setProfessionalsList] = useState<ServiceOption[]>([]);
  const [professionalsError, setProfessionalsError] = useState<string | null>(null);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategoryOption[]>([]);
  const [serviceCategoriesError, setServiceCategoriesError] = useState<string | null>(null);
  const [filterOptionsLoaded, setFilterOptionsLoaded] = useState(false);

  const [dayRestriction, setDayRestriction] = useState<AppointmentsResponse["day_restriction"]>(null);
  const [showDeleteDayRestrictionModal, setShowDeleteDayRestrictionModal] = useState(false);
  const [deleteDayRestrictionError, setDeleteDayRestrictionError] = useState<string | null>(null);
  const [deleteDayRestrictionSubmitting, setDeleteDayRestrictionSubmitting] = useState(false);
  const [showAgendaFabOptions, setShowAgendaFabOptions] = useState(false);
  const [showDayRestrictionModal, setShowDayRestrictionModal] = useState(false);
  const [dayRestrictionForm, setDayRestrictionForm] = useState<DayRestrictionForm>({
    startDate: formatDateParam(new Date()),
    finishDate: formatDateParam(new Date()),
    startTime: "09:00",
    finishTime: "18:00",
    isAllDay: false,
  });
  const [dayRestrictionError, setDayRestrictionError] = useState<string | null>(null);
  const [dayRestrictionSubmitting, setDayRestrictionSubmitting] = useState(false);

  useEffect(() => {
    if (!accessToken || !showAppointmentsFilterModal || filterOptionsLoaded) {
      return;
    }
    const controller = new AbortController();

    const fetchFilterOptions = async () => {
      try {
        const [professionalsResponse, categoriesResponse] = await Promise.all([
          fetchWithAuth(professionalProfilesSimpleListEndpoint, {
            credentials: "include",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            signal: controller.signal,
          }),
          fetchWithAuth(serviceCategoriesEndpoint, {
            credentials: "include",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            signal: controller.signal,
          }),
        ]);

        if (!professionalsResponse.ok) {
          throw new Error("Não foi possível carregar profissionais.");
        }

        if (!categoriesResponse.ok) {
          throw new Error("Não foi possível carregar categorias.");
        }

        const professionalsData = (await professionalsResponse.json()) as ProfessionalSimple[];
        const categoriesData: ServiceCategoryOption[] = await categoriesResponse.json();

        setProfessionalsList(
          Array.isArray(professionalsData)
            ? professionalsData.map((item) => ({ id: item.id, name: item.user_name }))
            : [],
        );
        setServiceCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setProfessionalsError(null);
        setServiceCategoriesError(null);
        setFilterOptionsLoaded(true);
      } catch (err) {
        if (!controller.signal.aborted) {
          const message =
            err instanceof Error ? err.message : "Erro inesperado ao carregar filtros.";

          if (message.includes("profissionais")) {
            setProfessionalsError(message);
          } else if (message.includes("categorias")) {
            setServiceCategoriesError(message);
          } else {
            setProfessionalsError(message);
            setServiceCategoriesError(message);
          }
        }
      }
    };

    void fetchFilterOptions();
    return () => controller.abort();
  }, [accessToken, fetchWithAuth, filterOptionsLoaded, showAppointmentsFilterModal]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }
    const controller = new AbortController();

    const fetchAppointments = async () => {
      setAppointmentsLoading(true);
      setAppointmentsError(null);
      try {
        const url = new URL(appointmentsEndpointBase);
        if (startDateFilter && endDateFilter) {
          url.searchParams.set("start_date", startDateFilter);
          url.searchParams.set("end_date", endDateFilter);
        } else {
          url.searchParams.set("date", formatDateParam(selectedDate));
        }
        if (filterProfessionalId) {
          url.searchParams.set("professional_profile_id", filterProfessionalId);
        }
        if (filterServiceId) {
          url.searchParams.set("service_id", filterServiceId);
        }
        if (filterCategoryId) {
          url.searchParams.set("service_category_id", filterCategoryId);
        }
        const response = await fetchWithAuth(url.toString(), {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Não foi possível carregar os agendamentos.");
        }

        const data: AppointmentsResponse = await response.json();
        setAppointments(data.results);
        setAppointmentsCount(data.count);
        setDayRestriction(data.day_restriction ?? null);
        setAppointmentsSummary({
          completed_total_price: data.completed_total_price ?? "0",
          completed_total_count: data.completed_total_count ?? 0,
          total: data.total ?? data.count ?? 0,
          total_scheduled: data.total_scheduled ?? "0",
          scheduled_status_total: data.scheduled_status_total ?? 0,
          scheduled_by_professional: data.scheduled_by_professional ?? [],
        });
      } catch (err) {
        if (!controller.signal.aborted) {
          setDayRestriction(null);
          setAppointmentsError(
            err instanceof Error ? err.message : "Erro inesperado ao carregar agendamentos.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setAppointmentsLoading(false);
        }
      }
    };

    void fetchAppointments();
    return () => controller.abort();
  }, [
    accessToken,
    appointmentsRefreshToken,
    endDateFilter,
    fetchWithAuth,
    filterCategoryId,
    filterProfessionalId,
    filterServiceId,
    selectedDate,
    startDateFilter,
  ]);

  const appointmentsDateOptions = useMemo(() => {
    const options: { date: Date; label: string; key: string }[] = [];
    for (let offset = -20; offset <= 20; offset += 1) {
      const date = new Date(selectedDate);
      date.setDate(date.getDate() + offset);
      options.push({
        date,
        label: formatDatePillLabel(date, new Date()),
        key: formatDateParam(date),
      });
    }
    return options;
  }, [selectedDate]);

  const pendingAppointments = useMemo(() => {
    return appointments
      .filter((appointment) => appointment.status !== "realizado" && appointment.status !== "cancelado")
      .slice()
      .sort((left, right) => new Date(left.date_time).getTime() - new Date(right.date_time).getTime());
  }, [appointments]);

  const nextPendingAppointment = pendingAppointments[0] ?? null;

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setStartDateFilter(null);
    setEndDateFilter(null);
  };

  const handleOpenAppointmentsFilter = () => {
    setPendingStartDate(startDateFilter ?? "");
    setPendingEndDate(endDateFilter ?? "");
    setPendingServiceId(filterServiceId);
    setPendingProfessionalId(filterProfessionalId ?? "");
    setPendingCategoryId(filterCategoryId ?? "");
    setShowAppointmentsFilterModal(true);
  };

  const handleApplyAppointmentsFilter = () => {
    setStartDateFilter(pendingStartDate || null);
    setEndDateFilter(pendingEndDate || null);
    setFilterServiceId(pendingServiceId.trim());
    setFilterProfessionalId(pendingProfessionalId || null);
    setFilterCategoryId(pendingCategoryId || null);
    setShowAppointmentsFilterModal(false);
  };

  const handleClearAppointmentsFilter = () => {
    setPendingStartDate("");
    setPendingEndDate("");
    setPendingServiceId("");
    setPendingProfessionalId("");
    setPendingCategoryId("");
    setStartDateFilter(null);
    setEndDateFilter(null);
    setFilterServiceId("");
    setFilterProfessionalId(null);
    setFilterCategoryId(null);
  };

  const handleOpenDeleteDayRestrictionModal = () => {
    if (!dayRestriction) {
      return;
    }
    setDeleteDayRestrictionError(null);
    setShowDeleteDayRestrictionModal(true);
  };

  const handleCloseDeleteDayRestrictionModal = () => {
    setShowDeleteDayRestrictionModal(false);
    setDeleteDayRestrictionError(null);
  };

  const handleToggleAgendaFab = () => {
    setShowAgendaFabOptions((previous) => !previous);
  };

  const handleOpenDayRestrictionModal = () => {
    const selectedDateValue = formatDateParam(selectedDate);
    setDayRestrictionForm({
      startDate: selectedDateValue,
      finishDate: selectedDateValue,
      startTime: "09:00",
      finishTime: "18:00",
      isAllDay: false,
    });
    setDayRestrictionError(null);
    setShowDayRestrictionModal(true);
    setShowAgendaFabOptions(false);
  };

  const handleCloseDayRestrictionModal = () => {
    setShowDayRestrictionModal(false);
    setDayRestrictionError(null);
  };

  const handleSubmitDayRestriction = async () => {
    if (!accessToken) {
      setDayRestrictionError("Sessão expirada. Faça login novamente.");
      return;
    }
    if (!dayRestrictionForm.startDate || !dayRestrictionForm.finishDate) {
      setDayRestrictionError("Informe a data de início e a data final.");
      return;
    }
    if (!dayRestrictionForm.isAllDay && (!dayRestrictionForm.startTime || !dayRestrictionForm.finishTime)) {
      setDayRestrictionError("Informe o horário de início e de término.");
      return;
    }

    const startDateTimeRaw = `${dayRestrictionForm.startDate}T${
      dayRestrictionForm.isAllDay ? "00:00:00" : `${dayRestrictionForm.startTime}:00`
    }`;
    const finishDateTimeRaw = `${dayRestrictionForm.finishDate}T${
      dayRestrictionForm.isAllDay ? "23:59:00" : `${dayRestrictionForm.finishTime}:00`
    }`;

    const startDateTime = new Date(startDateTimeRaw);
    const finishDateTime = new Date(finishDateTimeRaw);
    if (
      Number.isNaN(startDateTime.getTime()) ||
      Number.isNaN(finishDateTime.getTime()) ||
      finishDateTime <= startDateTime
    ) {
      setDayRestrictionError("O período informado é inválido.");
      return;
    }

    const startDateTimeIso = buildDateTimeWithTimezoneOffset(
      dayRestrictionForm.startDate,
      dayRestrictionForm.isAllDay ? "00:00" : dayRestrictionForm.startTime,
    );
    const finishDateTimeIso = buildDateTimeWithTimezoneOffset(
      dayRestrictionForm.finishDate,
      dayRestrictionForm.isAllDay ? "23:59" : dayRestrictionForm.finishTime,
    );

    if (!startDateTimeIso || !finishDateTimeIso) {
      setDayRestrictionError("Não foi possível montar as datas para envio.");
      return;
    }

    setDayRestrictionSubmitting(true);
    setDayRestrictionError(null);
    try {
      const response = await fetchWithAuth(dayRestrictionsEndpointBase, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          start_datetime: startDateTimeIso,
          finish_datetime: finishDateTimeIso,
          is_all_day: dayRestrictionForm.isAllDay,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Não foi possível criar a restrição de agenda.";
        try {
          const errorData = await response.json();
          if (errorData?.detail) {
            errorMessage = errorData.detail;
          }
        } catch {
          // noop
        }
        throw new Error(errorMessage);
      }

      setAppointmentsRefreshToken((previous) => previous + 1);
      setShowDayRestrictionModal(false);
    } catch (err) {
      setDayRestrictionError(
        err instanceof Error ? err.message : "Erro inesperado ao criar a restrição de agenda.",
      );
    } finally {
      setDayRestrictionSubmitting(false);
    }
  };

  const handleDeleteDayRestriction = async () => {
    if (!accessToken) {
      setDeleteDayRestrictionError("Sessão expirada. Faça login novamente.");
      return;
    }
    if (!dayRestriction) {
      setDeleteDayRestrictionError("Nenhuma restrição selecionada.");
      return;
    }

    setDeleteDayRestrictionSubmitting(true);
    setDeleteDayRestrictionError(null);
    try {
      const response = await fetchWithAuth(`${dayRestrictionsEndpointBase}${dayRestriction.id}/`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        let errorMessage = "Não foi possível excluir a restrição.";
        try {
          const errorData = await response.json();
          if (errorData?.detail) {
            errorMessage = errorData.detail;
          }
        } catch {
          // noop
        }
        throw new Error(errorMessage);
      }

      setDayRestriction(null);
      setShowDeleteDayRestrictionModal(false);
      setAppointmentsRefreshToken((previous) => previous + 1);
    } catch (err) {
      setDeleteDayRestrictionError(
        err instanceof Error ? err.message : "Erro inesperado ao excluir a restrição.",
      );
    } finally {
      setDeleteDayRestrictionSubmitting(false);
    }
  };

  const updateAppointmentStatus = useCallback(
    async (appointmentId: number, status: AppointmentStatus) => {
      if (!accessToken) {
        setAppointmentsError("Sessão expirada. Faça login novamente.");
        return false;
      }

      setStatusUpdatingId(appointmentId);
      setAppointmentsError(null);
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
            // noop
          }
          throw new Error(errorMessage);
        }

        const updated: AppointmentItem | null = await response.json().catch(() => null);
        setAppointments((previous) =>
          previous.map((appointment) =>
            appointment.id === appointmentId
              ? {
                  ...appointment,
                  ...(updated ?? {}),
                  status,
                }
              : appointment,
          ),
        );
        setAppointmentsRefreshToken((previous) => previous + 1);
        return true;
      } catch (err) {
        setAppointmentsError(
          err instanceof Error ? err.message : "Erro inesperado ao atualizar o status.",
        );
        return false;
      } finally {
        setStatusUpdatingId(null);
      }
    },
    [accessToken, fetchWithAuth],
  );

  return {
    appointments,
    appointmentsCount,
    appointmentsSummary,
    showAppointmentsSummaryDetails,
    appointmentsLoading,
    appointmentsError,
    selectedDate,
    appointmentsDateOptions,
    startDateFilter,
    endDateFilter,
    filterServiceId,
    filterCategoryId,
    filterProfessionalId,
    showAppointmentsFilterModal,
    pendingStartDate,
    pendingEndDate,
    pendingServiceId,
    pendingProfessionalId,
    pendingCategoryId,
    professionalsList,
    professionalsError,
    serviceCategories,
    serviceCategoriesError,
    dayRestriction,
    showDeleteDayRestrictionModal,
    deleteDayRestrictionError,
    deleteDayRestrictionSubmitting,
    showAgendaFabOptions,
    showDayRestrictionModal,
    dayRestrictionForm,
    dayRestrictionError,
    dayRestrictionSubmitting,
    nextPendingAppointment,
    pendingAppointmentsCount: pendingAppointments.length,
    statusUpdatingId,
    setShowAppointmentsSummaryDetails,
    handleSelectDate,
    handleOpenAppointmentsFilter,
    handleApplyAppointmentsFilter,
    handleClearAppointmentsFilter,
    setShowAppointmentsFilterModal,
    setPendingStartDate,
    setPendingEndDate,
    setPendingServiceId,
    setPendingProfessionalId,
    setPendingCategoryId,
    handleOpenDeleteDayRestrictionModal,
    handleCloseDeleteDayRestrictionModal,
    handleToggleAgendaFab,
    handleOpenDayRestrictionModal,
    handleCloseDayRestrictionModal,
    setDayRestrictionForm,
    handleSubmitDayRestriction,
    handleDeleteDayRestriction,
    updateAppointmentStatus,
  };
}
