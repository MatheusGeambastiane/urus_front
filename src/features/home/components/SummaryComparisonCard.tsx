"use client";

import { useState } from "react";
import { CalendarDays, Package, Scissors } from "lucide-react";
import { formatCurrency } from "@/src/features/shared/utils/money";
import type { DailySummaryComparison, DailySummaryComparisonMetric } from "@/src/features/home/types";
import { formatShortDate } from "@/src/features/home/utils/home";

type SummaryComparisonCardProps = {
  comparison: DailySummaryComparison;
};

const formatPercentage = (value: string | null) => {
  if (value === null) {
    return "Sem percentual";
  }

  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return "Sem percentual";
  }

  return `${numeric > 0 ? "+" : ""}${numeric.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
};

const formatNumber = (value: string | number) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return String(value);
  }

  return numeric.toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  });
};

const getToneClass = (metric: DailySummaryComparisonMetric) => {
  const numeric = Number(metric.difference);
  if (Number.isNaN(numeric) || numeric >= 0) {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
  }
  return "border-rose-400/20 bg-rose-400/10 text-rose-200";
};

const formatPeriodLabel = (start: string, end: string) => {
  const startDate = start.slice(0, 10);
  const endDate = end.slice(0, 10);
  if (startDate === endDate) {
    return formatShortDate(startDate);
  }
  return `${formatShortDate(startDate)}–${formatShortDate(endDate)}`;
};

export function SummaryComparisonCard({ comparison }: SummaryComparisonCardProps) {
  const [activeChartItemKey, setActiveChartItemKey] = useState<string | null>(null);
  const sellVariation = comparison.variation.sell_value;
  const servicesVariation = comparison.variation.total_services_performed;
  const isSameWeekdayComparison = comparison.type === "same_weekday_in_month";
  const comparisonTitle = isSameWeekdayComparison
    ? `Média de ${comparison.weekday_name}`
    : comparison.type === "same_ordinal_week_average"
      ? `${comparison.ordinal_week ? `${comparison.ordinal_week}ª semana` : "Semanas equivalentes"} · média dos 2 meses anteriores`
      : "Média dos 2 meses anteriores";
  const comparedChartItems = isSameWeekdayComparison
    ? comparison.compared_days.map((day) => ({
        key: day.date,
        label: formatShortDate(day.date),
        revenue: Number(day.metrics.revenue),
        revenueLabel: formatCurrency(day.metrics.revenue),
        appointments: Number(day.metrics.total_appointments),
        services: Number(day.metrics.total_services_performed),
        salesLabel: formatCurrency(day.metrics.sell_value),
        isCurrent: false,
      }))
    : comparison.compared_periods.map((period) => ({
        key: `${period.start}-${period.end}`,
        label: formatPeriodLabel(period.start, period.end),
        revenue: Number(period.metrics.revenue),
        revenueLabel: formatCurrency(period.metrics.revenue),
        appointments: Number(period.metrics.total_appointments),
        services: Number(period.metrics.total_services_performed),
        salesLabel: formatCurrency(period.metrics.sell_value),
        isCurrent: false,
      }));
  const revenueChartItems = [
    ...comparedChartItems,
    {
      key: "current-period",
      label: isSameWeekdayComparison
        ? formatShortDate(comparison.current_period.start)
        : formatPeriodLabel(comparison.current_period.start, comparison.current_period.end),
      revenue: Number(comparison.current_period.metrics.revenue),
      revenueLabel: formatCurrency(comparison.current_period.metrics.revenue),
      appointments: Number(comparison.current_period.metrics.total_appointments),
      services: Number(comparison.current_period.metrics.total_services_performed),
      salesLabel: formatCurrency(comparison.current_period.metrics.sell_value),
      isCurrent: true,
    },
  ];
  const activeChartItem = revenueChartItems.find((item) => item.key === activeChartItemKey) ?? null;
  const maxRevenue = revenueChartItems.reduce((current, item) => {
    if (Number.isNaN(item.revenue)) {
      return current;
    }
    return Math.max(current, item.revenue);
  }, 0);

  return (
    <section className="rounded-[28px] border border-white/8 bg-[#090909] p-5 shadow-card lg:rounded-[20px] lg:border-white/[0.07] lg:bg-[#0a0a0a]">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black lg:rounded-xl lg:bg-[#e5e7eb] lg:text-[#0a0a0a]">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/40 lg:text-[#e5e7eb]/70">
            Comparativo
          </p>
          <p className="home-display mt-2 text-lg font-semibold tracking-tight text-white lg:text-2xl">
            {comparisonTitle}
          </p>
        </div>
      </div>

      <div
        className="mt-5 rounded-2xl border border-white/8 bg-white/[0.04] p-4"
        role="group"
        aria-label="Faturamento por data"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
            <span className="lg:hidden">Revenue por data</span>
            <span className="hidden lg:inline">Faturamento por data</span>
          </p>
          <p className="text-xs font-medium text-white/55">
            Média {formatCurrency(comparison.compared_average.revenue)}
          </p>
        </div>

        {revenueChartItems.length > 0 ? (
          <div className="mt-3">
            <div
              className="flex min-h-[76px] items-center rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2"
              aria-live="polite"
            >
              {activeChartItem ? (
                <div className="w-full">
                  <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
                    {activeChartItem.label}
                  </p>
                  <dl className="mt-2 grid grid-cols-3 gap-2">
                    <div>
                      <dt className="text-[9px] uppercase tracking-wide text-white/35">Agendamentos</dt>
                      <dd className="mt-0.5 text-sm font-semibold text-white">
                        {formatNumber(activeChartItem.appointments)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[9px] uppercase tracking-wide text-white/35">Serviços</dt>
                      <dd className="mt-0.5 text-sm font-semibold text-white">
                        {formatNumber(activeChartItem.services)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[9px] uppercase tracking-wide text-white/35">Vendas</dt>
                      <dd className="mt-0.5 truncate text-sm font-semibold text-white">
                        {activeChartItem.salesLabel}
                      </dd>
                    </div>
                  </dl>
                </div>
              ) : (
                <p className="w-full text-center text-[11px] text-white/35">
                  <span className="sm:hidden">Toque em uma barra para ver os totais do período.</span>
                  <span className="hidden sm:inline">Passe o mouse sobre uma barra para ver os totais do período.</span>
                </p>
              )}
            </div>

            <div className="mt-3 flex h-40 items-end gap-3">
              {revenueChartItems.map((item) => {
                const barHeight = maxRevenue > 0 && !Number.isNaN(item.revenue)
                  ? Math.max((item.revenue / maxRevenue) * 100, 8)
                  : 8;
                const isActive = activeChartItemKey === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    aria-label={`${item.label}: ${formatNumber(item.appointments)} agendamentos, ${formatNumber(item.services)} serviços e ${item.salesLabel} em vendas`}
                    aria-pressed={isActive}
                    className="group flex min-w-0 flex-1 flex-col items-center rounded-[14px] outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/70"
                    onMouseEnter={() => setActiveChartItemKey(item.key)}
                    onMouseLeave={() => setActiveChartItemKey((current) => current === item.key ? null : current)}
                    onFocus={() => setActiveChartItemKey(item.key)}
                    onBlur={() => setActiveChartItemKey((current) => current === item.key ? null : current)}
                    onClick={() => setActiveChartItemKey(item.key)}
                  >
                    <div className="mb-2 min-h-[20px] text-center">
                      <span className={`rounded-md bg-black px-2 py-1 text-[10px] font-semibold text-white transition ${isActive ? "opacity-100" : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"}`}>
                        {item.revenueLabel}
                      </span>
                    </div>
                    <div className={`flex h-28 w-full items-end overflow-hidden rounded-[14px] border bg-black/25 px-1 transition ${isActive ? "border-emerald-200/50" : "border-transparent"}`}>
                      <div
                        className={`w-full rounded-t-[12px] transition-all duration-300 ${
                          item.isCurrent
                            ? "bg-emerald-300 shadow-[0_0_22px_rgba(110,231,183,0.22)] lg:bg-[#e5e7eb] lg:shadow-[0_0_22px_rgba(255,255,255,0.22)]"
                            : "bg-white shadow-[0_0_20px_rgba(255,255,255,0.14)]"
                        }`}
                        style={{ height: `${barHeight}%` }}
                      />
                    </div>
                    <span
                      className={`mt-3 text-center text-[10px] font-semibold uppercase tracking-[0.04em] ${
                        item.isCurrent ? "text-emerald-200 lg:text-[#f4f4f5]" : "text-white/45"
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-white/55">Sem períodos comparados.</p>
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
          <div className="flex items-center gap-2 text-white/45">
            <Package className="h-4 w-4" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Produtos</p>
          </div>
          <p className="mt-3 text-lg font-semibold text-white">
            {formatCurrency(sellVariation.current)}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
            <span className={`rounded-full border px-3 py-1 ${getToneClass(sellVariation)}`}>
              {formatPercentage(sellVariation.percentage)}
            </span>
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-white/60">
              {Number(sellVariation.difference) > 0 ? "+" : ""}
              {formatCurrency(sellVariation.difference)}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
          <div className="flex items-center gap-2 text-white/45">
            <Scissors className="h-4 w-4" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Serviços feitos</p>
          </div>
          <p className="mt-3 text-lg font-semibold text-white">
            {formatNumber(servicesVariation.current)}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
            <span className={`rounded-full border px-3 py-1 ${getToneClass(servicesVariation)}`}>
              {formatPercentage(servicesVariation.percentage)}
            </span>
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-white/60">
              {Number(servicesVariation.difference) > 0 ? "+" : ""}
              {formatNumber(servicesVariation.difference)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
