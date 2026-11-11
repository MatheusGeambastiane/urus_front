"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/src/features/dashboard/components/DashboardShell";
import { useAuth } from "@/src/features/shared/hooks/useAuth";
import { formatDateParam } from "@/src/features/shared/utils/date";
import { formatCurrency } from "@/src/features/shared/utils/money";
import { HighlightsRow } from "@/src/features/home/components/HighlightsRow";
import { ComparisonModeModal } from "@/src/features/home/components/ComparisonModeModal";
import { HomeOverviewCard, PeriodChartCard } from "@/src/features/home/components/HomeOverviewCard";
import { NextAppointmentCard } from "@/src/features/home/components/NextAppointmentCard";
import { ProfessionalBreakdownChart } from "@/src/features/home/components/ProfessionalBreakdownChart";
import { QuickActions } from "@/src/features/home/components/QuickActions";
import { SummaryFilterModal } from "@/src/features/home/components/SummaryFilterModal";
import { SummaryComparisonCard } from "@/src/features/home/components/SummaryComparisonCard";
import { TopProductSalesTable } from "@/src/features/home/components/TopProductSalesTable";
import { TopServicesChart } from "@/src/features/home/components/TopServicesChart";
import { HomeGoalCard } from "@/src/features/goals/components/HomeGoalCard";
import { useHomeGoalProgress } from "@/src/features/goals/hooks/useHomeGoalProgress";
import { useDailySummary } from "@/src/features/home/hooks/useDailySummary";
import { useLast7Days } from "@/src/features/home/hooks/useLast7Days";
import { formatCompactRangeLabel, formatFullDate, formatShortDate, formatShortTime, getWeekdayNumberLabel } from "@/src/features/home/utils/home";
import type { QuickActionKey } from "@/src/features/home/types";

type HomePageProps = {
  firstName: string;
};

export function HomePage({ firstName }: HomePageProps) {
  const router = useRouter();
  const { accessToken, fetchWithAuth, profilePic, userRole } = useAuth();
  const dailySummary = useDailySummary({ accessToken, fetchWithAuth });
  const last7Days = useLast7Days({
    accessToken,
    fetchWithAuth,
    filters: dailySummary.weeklyFilter,
  });
  const goalsEnabled = userRole === "admin" || userRole === "professional";
  const goalProgress = useHomeGoalProgress({
    accessToken,
    fetchWithAuth,
    enabled: goalsEnabled,
  });
  const homeGoal = goalProgress.goal;
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const loading = refreshing || dailySummary.dailySummaryLoading || last7Days.last7DaysLoading ||
    (goalsEnabled && goalProgress.loading);
  const initialDates = [dailySummary.updatedAt, last7Days.updatedAt,
    ...(goalsEnabled ? [goalProgress.updatedAt] : [])];
  const initialUpdatedAt = initialDates.every((date) => date !== null)
    ? new Date(Math.min(...initialDates.map((date) => date!.getTime()))) : null;
  const lastUpdated = lastRefresh ?? initialUpdatedAt;

  const handleRefresh = async () => {
    if (loading || !accessToken) return;
    // Preserve the last successful timestamp if any request fails.
    setLastRefresh(lastUpdated);
    setRefreshing(true);
    setRefreshError(null);
    try {
      const results = await Promise.all([
        dailySummary.reload(), last7Days.reload(), goalProgress.reload(),
      ]);
      if (results.every(Boolean)) setLastRefresh(new Date());
      else setRefreshError("Alguns dados não foram atualizados. Tente novamente.");
    } catch {
      setRefreshError("Não foi possível atualizar os dados. Tente novamente.");
    } finally {
      setRefreshing(false);
    }
  };

  const [typedHeader, setTypedHeader] = useState("");
  const rotatingPhrases = useMemo(
    () => [
      `Olá, ${firstName}`,
      `Bom trabalho, ${firstName}`,
      `Bem-vindo, ${firstName}`,
    ],
    [firstName],
  );
  const todayLabel = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    timeZone: "America/Bahia",
  }).format(new Date());

  useEffect(() => {
    let phraseIndex = 0;
    let characterIndex = 0;
    let isDeleting = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const tick = () => {
      const currentPhrase = rotatingPhrases[phraseIndex] ?? "";
      characterIndex = isDeleting
        ? Math.max(characterIndex - 1, 0)
        : Math.min(characterIndex + 1, currentPhrase.length);
      setTypedHeader(currentPhrase.slice(0, characterIndex));

      if (!isDeleting && characterIndex === currentPhrase.length) {
        timeoutId = setTimeout(() => {
          isDeleting = true;
          tick();
        }, 1600);
        return;
      }

      if (isDeleting && characterIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % rotatingPhrases.length;
      }

      timeoutId = setTimeout(tick, isDeleting ? 40 : 75);
    };

    tick();
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [rotatingPhrases]);

  const triggerQuickAction = (action: QuickActionKey) => {
    if (action === "create-appointment") {
      router.push("/dashboard/agenda/novo");
      return;
    }
    if (action === "create-professional-interval") {
      router.push("/dashboard/intervalos/novo");
      return;
    }
    if (action === "create-product-sale") {
      router.push("/dashboard/produtos?nova_venda_produto=1");
      return;
    }
    router.push("/dashboard/produtos?novo_produto=1");
  };

  const weeklyItems = last7Days.last7DaysData?.last_7_days ?? [];
  const todayKey = formatDateParam(new Date());
  const maxWeeklyCount = weeklyItems.reduce((current, item) => {
    return Math.max(current, item.count);
  }, 1);

  const chartItems = weeklyItems.map((item) => {
    const startDate = item.start_date ?? item.date ?? null;
    const endDate = item.end_date ?? item.date ?? null;
    const itemDate = item.date ?? item.start_date ?? "";
    const safeHeight = maxWeeklyCount > 0 ? (item.count / maxWeeklyCount) * 100 : 0;
    const isRange = Boolean(item.start_date || item.end_date);
    const isMonthFilter = Boolean(dailySummary.weeklyFilter.month);
    const filterDate = item.date ?? (startDate === endDate ? startDate : null);
    const highlightedDate = dailySummary.activeSummaryDay ?? todayKey;

    return {
      key: `${startDate ?? "item"}-${endDate ?? "item"}`,
      label: isRange
        ? isMonthFilter
          ? formatCompactRangeLabel(startDate, endDate)
          : formatFullDate(startDate)
        : getWeekdayNumberLabel(item.day),
      totalValue: item.count,
      displayValue: String(item.count),
      isToday: itemDate === highlightedDate || startDate === highlightedDate,
      barHeight: safeHeight,
      filterDate,
    };
  });

  const revenueValue = formatCurrency(dailySummary.dailySummary?.revenue ?? "0");
  const appointmentsValue = formatCurrency(dailySummary.dailySummary?.appointments_value ?? "0");
  const sellValue = formatCurrency(dailySummary.dailySummary?.sell_value ?? "0");
  const nextAppointment = dailySummary.dailySummary?.next_appointment ?? null;
  const comparison = dailySummary.dailySummary?.comparison ?? null;
  const goalPeriodLabel = dailySummary.activeSummaryRangeStart && dailySummary.activeSummaryRangeEnd
    ? "Meta para o período"
    : dailySummary.activeSummaryMonth
      ? "Meta para o mês"
      : "Semana até hoje";

  const quickActions = [
    {
      key: "create-appointment" as const,
      title: "Novo Agendamento",
      subtitle: "Abra um atendimento e comece a agenda do dia.",
      image: "/relogio_urus.png",
      className: "border-white bg-white text-black lg:border-[#e5e7eb]/40 lg:bg-[#e5e7eb] lg:text-[#0a0a0a]",
    },
    {
      key: "create-professional-interval" as const,
      title: "Criar novo intervalo",
      subtitle: "Bloqueie um período pontual ou recorrente na agenda.",
      image: "/icon_calendar.png",
      className: "border-white/10 bg-[#151515] text-white hover:bg-[#1b1b1b] lg:border-[#e5e7eb]/15 lg:bg-[#0a0a0a]",
    },
    {
      key: "create-product-sale" as const,
      title: "Venda Rápida",
      subtitle: "Registre uma venda de produto com poucos toques.",
      image: "/lata_urus.png",
      className: "border-neutral-900 bg-[#0a0a0a] text-white hover:bg-neutral-900",
    },
    {
      key: "create-product" as const,
      title: "Novo Produto",
      subtitle: "Adicione itens ao estoque sem sair do dashboard.",
      image: "/caixa_urus.png",
      className: "border-white/10 bg-[#0f1724] text-white",
      imageClassName: "sm:h-24 sm:w-24",
    },
  ];

  const topDay = last7Days.last7DaysData?.top_day_in_month ?? null;
  const topFinanceDay = last7Days.last7DaysData?.top_best_finance_day ?? null;
  const highlightCards = [];

  if (userRole === "admin") {
    highlightCards.push({
      title: "Maior faturamento",
      label: topFinanceDay ? `${formatShortDate(topFinanceDay.date)} • pico do mês` : "Sem dados no período.",
      value: topFinanceDay ? formatCurrency(topFinanceDay.total) : "--",
    });
  }

  highlightCards.push({
    title: "Maior agendamento",
    label: topDay ? `${formatShortDate(topDay.date)} • maior pico do mês` : "Sem dados no período.",
    value: topDay ? String(topDay.count) : "--",
    accent: "muted" as const,
  });

  return (
    <DashboardShell activeTab="home" profilePic={profilePic} userRole={userRole} desktopVariant="luxury">
      <div className="home-dashboard space-y-5 pb-6 lg:grid lg:grid-cols-12 lg:items-start lg:gap-5 lg:space-y-0">
        <header className="flex flex-wrap items-center justify-between gap-4 lg:col-span-12">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-white/35 lg:text-[#e5e7eb]/80">
              <span className="lg:hidden">Visão Geral</span>
              <span className="hidden lg:inline">Painel operacional</span>
            </p>
            <h1 className="mt-2 text-[2rem] font-medium tracking-tight text-white lg:hidden">
              {typedHeader}
              <span className="ml-1 inline-block h-8 w-[2px] animate-pulse bg-white/70 align-[-4px]" />
            </h1>
            <h1 className="home-display home-title-reveal mt-2 hidden font-medium tracking-tight text-white lg:block lg:text-[2.75rem] lg:leading-none lg:tracking-[-0.025em]">
              Olá, {firstName}.
            </h1>
            <p className="mt-3 hidden text-sm capitalize text-white/45 lg:block">
              {todayLabel} <span className="mx-2 text-[#e5e7eb]/50">•</span> acompanhe o ritmo da barbearia.
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:flex-col sm:items-end">
            <button
              type="button"
              onClick={() => void handleRefresh()}
              disabled={loading || !accessToken}
              aria-busy={refreshing}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw aria-hidden="true" className={`h-4 w-4 ${refreshing ? "motion-safe:animate-spin" : ""}`} />
              {refreshing ? "Atualizando…" : "Atualizar"}
            </button>
            <p className="text-xs text-white/50" role="status" aria-live="polite">
              Última atualização: {lastUpdated ? (
                <time dateTime={lastUpdated.toISOString()} title={lastUpdated.toLocaleString("pt-BR", { timeZone: "America/Bahia" })}>
                  {lastUpdated.toLocaleTimeString("pt-BR", { timeZone: "America/Bahia", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </time>
              ) : "—"}
            </p>
          </div>
        </header>
        {refreshError ? <p role="alert" className="text-sm text-amber-200 lg:col-span-12">{refreshError}</p> : null}

        {homeGoal ? <HomeGoalCard goal={homeGoal} periodLabel={goalPeriodLabel} /> : null}

        <HomeOverviewCard
          title={dailySummary.overviewTitle}
          totalValue={revenueValue}
          appointmentsValue={appointmentsValue}
          sellValue={sellValue}
          totalAppointments={dailySummary.dailySummary?.total_appointments ?? 0}
          totalServices={dailySummary.dailySummary?.total_services_performed ?? 0}
          highlights={highlightCards}
          revenueComparison={comparison?.variation.revenue ?? null}
          chartItems={chartItems}
          loading={dailySummary.dailySummaryLoading || last7Days.last7DaysLoading}
          error={dailySummary.dailySummaryError ?? last7Days.last7DaysError}
          filterDescription={dailySummary.filterDescription}
          onOpenFilters={dailySummary.handleOpenSummaryFilters}
          onClearFilters={dailySummary.handleClearSummaryFilters}
          onSelectChartDay={dailySummary.handleSelectSummaryDay}
        />

        <div className="hidden lg:col-span-7 lg:block xl:col-span-8">
          <PeriodChartCard
            chartItems={chartItems}
            loading={dailySummary.dailySummaryLoading || last7Days.last7DaysLoading}
            error={dailySummary.dailySummaryError ?? last7Days.last7DaysError}
            onSelectDay={dailySummary.handleSelectSummaryDay}
          />
        </div>

        <div className="lg:col-span-5 xl:col-span-4">
          <NextAppointmentCard
            nextAppointment={nextAppointment}
            loading={dailySummary.dailySummaryLoading}
            dateLabel={formatShortDate(nextAppointment?.date_time)}
            timeLabel={formatShortTime(nextAppointment?.date_time)}
          />
        </div>

        <div className="lg:col-span-12">
          <QuickActions actions={quickActions} onAction={triggerQuickAction} />
        </div>

        <div className="lg:hidden">
          <HighlightsRow
            loading={last7Days.last7DaysLoading}
            error={last7Days.last7DaysError}
            cards={highlightCards}
          />
        </div>

        {comparison && !dailySummary.dailySummaryLoading ? (
          <div className="lg:col-span-12">
            <SummaryComparisonCard comparison={comparison} />
          </div>
        ) : null}

        {userRole !== "professional" ? (
          <div className="lg:col-span-4">
            <ProfessionalBreakdownChart
              items={dailySummary.dailySummary?.appointments_by_professional ?? []}
              loading={dailySummary.dailySummaryLoading}
            />
          </div>
        ) : null}

        <div className={userRole !== "professional" ? "lg:col-span-4" : "lg:col-span-6"}>
          <TopServicesChart
            items={dailySummary.dailySummary?.top_services ?? []}
            loading={dailySummary.dailySummaryLoading}
            showAllForPeriod={Boolean(
              dailySummary.activeSummaryMonth ||
              (dailySummary.activeSummaryRangeStart && dailySummary.activeSummaryRangeEnd),
            )}
          />
        </div>

        <div className={userRole !== "professional" ? "lg:col-span-4" : "lg:col-span-6"}>
          <TopProductSalesTable
            items={dailySummary.dailySummary?.top_products ?? []}
            loading={dailySummary.dailySummaryLoading}
            isPeriod={Boolean(
              dailySummary.activeSummaryMonth ||
              (dailySummary.activeSummaryRangeStart && dailySummary.activeSummaryRangeEnd),
            )}
          />
        </div>
      </div>

      <SummaryFilterModal
        open={dailySummary.showSummaryFilters}
        mode={dailySummary.summaryFilterMode}
        onModeChange={dailySummary.setSummaryFilterMode}
        dayInput={dailySummary.summaryDayInput}
        onDayInputChange={dailySummary.setSummaryDayInput}
        monthYear={dailySummary.summaryMonthYear}
        onMonthYearChange={dailySummary.setSummaryMonthYear}
        monthValue={dailySummary.summaryMonthValue}
        onMonthValueChange={dailySummary.setSummaryMonthValue}
        rangeStart={dailySummary.summaryRangeStart}
        rangeEnd={dailySummary.summaryRangeEnd}
        rangeMonth={dailySummary.summaryRangeMonth}
        years={dailySummary.summaryFilterYears}
        compareEnabled={dailySummary.pendingSummaryCompare}
        onCompareEnabledChange={dailySummary.setPendingSummaryCompare}
        error={dailySummary.summaryFilterError}
        onClose={dailySummary.handleCloseSummaryFilters}
        onClear={dailySummary.handleClearSummaryFilters}
        onApply={dailySummary.handleApplySummaryFilters}
        onSetCurrentMonth={dailySummary.handleSetCurrentSummaryMonth}
        onPrevMonth={dailySummary.handleSummaryRangePrevMonth}
        onNextMonth={dailySummary.handleSummaryRangeNextMonth}
        onSelectDayDate={dailySummary.handleSelectSummaryDayDate}
        onSelectRangeDate={dailySummary.handleSelectSummaryRangeDate}
      />

      <ComparisonModeModal
        open={dailySummary.showComparisonModeModal}
        rangeStart={dailySummary.summaryRangeStart}
        rangeEnd={dailySummary.summaryRangeEnd}
        onSelect={dailySummary.handleSelectComparisonMode}
        onCancel={dailySummary.handleCancelComparisonMode}
      />
    </DashboardShell>
  );
}
