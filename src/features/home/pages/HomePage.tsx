"use client";

import { useEffect, useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ProfileMenu } from "@/components/ui/ProfileMenu";
import { DashboardShell } from "@/src/features/dashboard/components/DashboardShell";
import { useAuth } from "@/src/features/shared/hooks/useAuth";
import { formatDateParam } from "@/src/features/shared/utils/date";
import { formatCurrency } from "@/src/features/shared/utils/money";
import { HighlightsRow } from "@/src/features/home/components/HighlightsRow";
import { HomeOverviewCard } from "@/src/features/home/components/HomeOverviewCard";
import { NextAppointmentCard } from "@/src/features/home/components/NextAppointmentCard";
import { ProfessionalBreakdownChart } from "@/src/features/home/components/ProfessionalBreakdownChart";
import { QuickActions } from "@/src/features/home/components/QuickActions";
import { SummaryFilterModal } from "@/src/features/home/components/SummaryFilterModal";
import { TopServicesChart } from "@/src/features/home/components/TopServicesChart";
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
  const [typedHeader, setTypedHeader] = useState("");

  const handleLogout = async () => signOut({ callbackUrl: "/dashboard/login" });

  const rotatingPhrases = useMemo(
    () => [
      `Olá, ${firstName}`,
      `Bom trabalho, ${firstName}`,
      `Bem-vindo, ${firstName}`,
    ],
    [firstName],
  );

  useEffect(() => {
    let phraseIndex = 0;
    let characterIndex = 0;
    let isDeleting = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const tick = () => {
      const currentPhrase = rotatingPhrases[phraseIndex] ?? "";

      if (isDeleting) {
        characterIndex = Math.max(characterIndex - 1, 0);
      } else {
        characterIndex = Math.min(characterIndex + 1, currentPhrase.length);
      }

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
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [rotatingPhrases]);

  const triggerQuickAction = (action: QuickActionKey) => {
    if (action === "create-appointment") {
      router.push("/dashboard/agenda/novo");
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

    return {
      key: `${startDate ?? "item"}-${endDate ?? "item"}`,
      label: isRange
        ? isMonthFilter
          ? formatCompactRangeLabel(startDate, endDate)
          : formatFullDate(startDate)
        : getWeekdayNumberLabel(item.day),
      totalValue: item.count,
      displayValue: String(item.count),
      isToday: itemDate === todayKey || startDate === todayKey,
      barHeight: safeHeight,
    };
  });

  const revenueValue = formatCurrency(dailySummary.dailySummary?.revenue ?? "0");
  const appointmentsValue = formatCurrency(dailySummary.dailySummary?.appointments_value ?? "0");
  const sellValue = formatCurrency(dailySummary.dailySummary?.sell_value ?? "0");
  const nextAppointment = dailySummary.dailySummary?.next_appointment ?? null;

  const quickActions = [
    {
      key: "create-appointment" as const,
      title: "Novo Agendamento",
      subtitle: "Abra um atendimento e comece a agenda do dia.",
      image: "/relogio_urus.png",
      className: "border-white bg-white text-black",
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
      className: "border-white/10 bg-[#0f1724] text-white sm:col-span-2",
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
    <DashboardShell activeTab="home" userRole={userRole}>
      <div className="space-y-5 pb-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-white/35">
              Visão Geral
            </p>
            <h1 className="mt-2 text-[2rem] font-medium tracking-tight text-white">
              {typedHeader}
              <span className="ml-1 inline-block h-8 w-[2px] animate-pulse bg-white/70 align-[-4px]" />
            </h1>
          </div>

          <ProfileMenu
            profilePicUrl={profilePic}
            onLogout={handleLogout}
            myProfileHref="/dashboard/meu-perfil"
          />
        </header>

        <HomeOverviewCard
          title={dailySummary.overviewTitle}
          totalValue={revenueValue}
          appointmentsValue={appointmentsValue}
          sellValue={sellValue}
          totalServices={dailySummary.dailySummary?.total_services_performed ?? 0}
          chartItems={chartItems}
          loading={dailySummary.dailySummaryLoading || last7Days.last7DaysLoading}
          error={dailySummary.dailySummaryError ?? last7Days.last7DaysError}
          filterDescription={dailySummary.filterDescription}
          onOpenFilters={dailySummary.handleOpenSummaryFilters}
          onClearFilters={dailySummary.handleClearSummaryFilters}
        />

        <NextAppointmentCard
          nextAppointment={nextAppointment}
          loading={dailySummary.dailySummaryLoading}
          dateLabel={formatShortDate(nextAppointment?.date_time)}
          timeLabel={formatShortTime(nextAppointment?.date_time)}
        />

        <QuickActions actions={quickActions} onAction={triggerQuickAction} />

        <HighlightsRow
          loading={last7Days.last7DaysLoading}
          error={last7Days.last7DaysError}
          cards={highlightCards}
        />

        {userRole !== "professional" ? (
          <ProfessionalBreakdownChart
            items={dailySummary.dailySummary?.appointments_by_professional ?? []}
            loading={dailySummary.dailySummaryLoading}
          />
        ) : null}

        <TopServicesChart
          items={dailySummary.dailySummary?.top_services ?? []}
          loading={dailySummary.dailySummaryLoading}
        />
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
    </DashboardShell>
  );
}
