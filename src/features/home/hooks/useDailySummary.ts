"use client";

import { useEffect, useMemo, useState } from "react";
import { env } from "@/lib/env";
import type { TokenRefreshService } from "@/src/features/shared/utils/auth";
import { convertDisplayDateToIso, formatDateParam, formatDisplayDate, formatIsoToDisplay } from "@/src/features/shared/utils/date";
import { addMonths, parseIsoDate, summaryFilterMonthOptions } from "@/src/features/home/utils/home";
import type { DailySummaryResponse, HomeWeeklyFilter, SummaryFilterMode } from "@/src/features/home/types";

type UseDailySummaryParams = {
  accessToken: string | null;
  fetchWithAuth: TokenRefreshService["fetchWithAuth"];
};

export function useDailySummary({ accessToken, fetchWithAuth }: UseDailySummaryParams) {
  const [dailySummary, setDailySummary] = useState<DailySummaryResponse | null>(null);
  const [dailySummaryLoading, setDailySummaryLoading] = useState(false);
  const [dailySummaryError, setDailySummaryError] = useState<string | null>(null);

  const [showSummaryFilters, setShowSummaryFilters] = useState(false);
  const [summaryFilterMode, setSummaryFilterMode] = useState<SummaryFilterMode>("day");
  const [summaryDayInput, setSummaryDayInput] = useState("");
  const [summaryMonthYear, setSummaryMonthYear] = useState("");
  const [summaryMonthValue, setSummaryMonthValue] = useState("");
  const [summaryRangeStart, setSummaryRangeStart] = useState<Date | null>(null);
  const [summaryRangeEnd, setSummaryRangeEnd] = useState<Date | null>(null);
  const [summaryRangeMonth, setSummaryRangeMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [activeSummaryDay, setActiveSummaryDay] = useState<string | null>(null);
  const [activeSummaryMonth, setActiveSummaryMonth] = useState<string | null>(null);
  const [activeSummaryRangeStart, setActiveSummaryRangeStart] = useState<string | null>(null);
  const [activeSummaryRangeEnd, setActiveSummaryRangeEnd] = useState<string | null>(null);
  const [summaryFilterError, setSummaryFilterError] = useState<string | null>(null);

  const summaryFilterYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, index) => String(currentYear + 1 - index));
  }, []);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const controller = new AbortController();

    const fetchDailySummary = async () => {
      setDailySummaryLoading(true);
      setDailySummaryError(null);

      try {
        const url = new URL(`${env.apiBaseUrl}/dashboard/summary/daily/`);
        if (activeSummaryRangeStart && activeSummaryRangeEnd) {
          url.searchParams.set("start_date", activeSummaryRangeStart);
          url.searchParams.set("end_date", activeSummaryRangeEnd);
        } else {
          if (activeSummaryDay) {
            url.searchParams.set("day", activeSummaryDay);
          }
          if (activeSummaryMonth) {
            url.searchParams.set("month", activeSummaryMonth);
          }
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
          throw new Error("Não foi possível carregar o resumo diário.");
        }

        const data: DailySummaryResponse = await response.json();
        setDailySummary(data);
      } catch (error) {
        if (!controller.signal.aborted) {
          setDailySummaryError(
            error instanceof Error ? error.message : "Erro inesperado ao carregar o resumo diário.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setDailySummaryLoading(false);
        }
      }
    };

    void fetchDailySummary();
    return () => controller.abort();
  }, [
    accessToken,
    activeSummaryDay,
    activeSummaryMonth,
    activeSummaryRangeStart,
    activeSummaryRangeEnd,
    fetchWithAuth,
  ]);

  const handleOpenSummaryFilters = () => {
    setSummaryFilterError(null);

    if (activeSummaryDay) {
      setSummaryFilterMode("day");
      setSummaryDayInput(formatIsoToDisplay(activeSummaryDay));
      const activeDayDate = parseIsoDate(activeSummaryDay);
      if (activeDayDate) {
        setSummaryRangeMonth(new Date(activeDayDate.getFullYear(), activeDayDate.getMonth(), 1));
      }
    } else {
      setSummaryDayInput("");
    }

    if (activeSummaryMonth) {
      setSummaryFilterMode("month");
      const [yearValue = "", monthValue = ""] = activeSummaryMonth.split("-");
      setSummaryMonthYear(yearValue);
      setSummaryMonthValue(monthValue);
    } else {
      setSummaryMonthYear("");
      setSummaryMonthValue("");
    }

    if (activeSummaryRangeStart && activeSummaryRangeEnd) {
      const startDate = parseIsoDate(activeSummaryRangeStart);
      const endDate = parseIsoDate(activeSummaryRangeEnd);
      if (startDate && endDate) {
        setSummaryFilterMode("range");
        setSummaryRangeStart(startDate);
        setSummaryRangeEnd(endDate);
        setSummaryRangeMonth(new Date(startDate.getFullYear(), startDate.getMonth(), 1));
      }
    } else {
      setSummaryRangeStart(null);
      setSummaryRangeEnd(null);
    }

    setShowSummaryFilters(true);
  };

  const handleCloseSummaryFilters = () => {
    setShowSummaryFilters(false);
  };

  const handleSelectSummaryDayDate = (date: Date) => {
    setSummaryFilterError(null);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (selected.getTime() > today.getTime()) {
      return;
    }
    setSummaryDayInput(formatIsoToDisplay(formatDateParam(selected)));
  };

  const handleSelectSummaryRangeDate = (date: Date) => {
    setSummaryFilterError(null);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (selected.getTime() > today.getTime()) {
      return;
    }

    if (!summaryRangeStart || summaryRangeEnd) {
      setSummaryRangeStart(selected);
      setSummaryRangeEnd(null);
      return;
    }

    if (selected.getTime() < summaryRangeStart.getTime()) {
      setSummaryRangeStart(selected);
      setSummaryRangeEnd(null);
      return;
    }

    setSummaryRangeEnd(selected);
  };

  const handleSummaryRangePrevMonth = () => {
    setSummaryRangeMonth((current) => addMonths(current, -1));
  };

  const handleSummaryRangeNextMonth = () => {
    setSummaryRangeMonth((current) => addMonths(current, 1));
  };

  const handleSetCurrentSummaryMonth = () => {
    const now = new Date();
    setSummaryMonthYear(String(now.getFullYear()));
    setSummaryMonthValue(String(now.getMonth() + 1).padStart(2, "0"));
  };

  const handleApplySummaryFilters = () => {
    setSummaryFilterError(null);

    if (summaryFilterMode === "day") {
      const isoValue = convertDisplayDateToIso(summaryDayInput);
      if (!isoValue) {
        setSummaryFilterError("Informe uma data válida no formato dd/mm/aaaa.");
        return;
      }

      setActiveSummaryDay(isoValue);
      setActiveSummaryMonth(null);
      setActiveSummaryRangeStart(null);
      setActiveSummaryRangeEnd(null);
      setShowSummaryFilters(false);
      return;
    }

    if (summaryFilterMode === "range") {
      if (!summaryRangeStart || !summaryRangeEnd) {
        setSummaryFilterError("Selecione a data inicial e a data final.");
        return;
      }

      setActiveSummaryRangeStart(formatDateParam(summaryRangeStart));
      setActiveSummaryRangeEnd(formatDateParam(summaryRangeEnd));
      setActiveSummaryDay(null);
      setActiveSummaryMonth(null);
      setShowSummaryFilters(false);
      return;
    }

    if (!summaryMonthYear || !summaryMonthValue) {
      setSummaryFilterError("Selecione o ano e o mês.");
      return;
    }

    setActiveSummaryMonth(`${summaryMonthYear}-${summaryMonthValue}`);
    setActiveSummaryDay(null);
    setActiveSummaryRangeStart(null);
    setActiveSummaryRangeEnd(null);
    setShowSummaryFilters(false);
  };

  const handleClearSummaryFilters = () => {
    setActiveSummaryDay(null);
    setActiveSummaryMonth(null);
    setActiveSummaryRangeStart(null);
    setActiveSummaryRangeEnd(null);
    setSummaryDayInput("");
    setSummaryMonthYear("");
    setSummaryMonthValue("");
    setSummaryRangeStart(null);
    setSummaryRangeEnd(null);
    setSummaryFilterError(null);
  };

  const filterDescription =
    activeSummaryDay
      ? `Filtrando por dia: ${formatIsoToDisplay(activeSummaryDay)}`
      : activeSummaryMonth
        ? `Filtrando por mês: ${activeSummaryMonth}`
        : activeSummaryRangeStart && activeSummaryRangeEnd
          ? `Filtrando por período: ${formatIsoToDisplay(activeSummaryRangeStart)} até ${formatIsoToDisplay(activeSummaryRangeEnd)}`
          : null;

  const overviewTitle =
    activeSummaryRangeStart && activeSummaryRangeEnd
      ? `Faturamento de ${formatIsoToDisplay(activeSummaryRangeStart)} até ${formatIsoToDisplay(activeSummaryRangeEnd)}`
      : activeSummaryDay
        ? `Faturamento de ${formatIsoToDisplay(activeSummaryDay)}`
        : activeSummaryMonth
          ? `Faturamento do mês de ${
              summaryFilterMonthOptions.find((month) => month.value === activeSummaryMonth.split("-")[1])?.label ??
              activeSummaryMonth
            }`
          : "Faturamento de Hoje";

  const weeklyFilter: HomeWeeklyFilter = {
    day: activeSummaryDay,
    month: activeSummaryMonth,
    startDate: activeSummaryRangeStart,
    endDate: activeSummaryRangeEnd,
  };

  return {
    dailySummary,
    dailySummaryLoading,
    dailySummaryError,
    showSummaryFilters,
    summaryFilterMode,
    setSummaryFilterMode,
    summaryDayInput,
    setSummaryDayInput: (value: string) => setSummaryDayInput(formatDisplayDate(value)),
    summaryMonthYear,
    setSummaryMonthYear,
    summaryMonthValue,
    setSummaryMonthValue,
    summaryRangeStart,
    summaryRangeEnd,
    summaryRangeMonth,
    summaryFilterError,
    summaryFilterYears,
    activeSummaryDay,
    activeSummaryMonth,
    activeSummaryRangeStart,
    activeSummaryRangeEnd,
    filterDescription,
    overviewTitle,
    weeklyFilter,
    handleOpenSummaryFilters,
    handleCloseSummaryFilters,
    handleSelectSummaryDayDate,
    handleSelectSummaryRangeDate,
    handleSummaryRangePrevMonth,
    handleSummaryRangeNextMonth,
    handleApplySummaryFilters,
    handleClearSummaryFilters,
    handleSetCurrentSummaryMonth,
  };
}
