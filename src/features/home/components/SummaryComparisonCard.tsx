"use client";

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

export function SummaryComparisonCard({ comparison }: SummaryComparisonCardProps) {
  const sellVariation = comparison.variation.sell_value;
  const servicesVariation = comparison.variation.total_services_performed;
  const currentDate = comparison.current_period.start.slice(0, 10);
  const revenueChartItems = [
    ...comparison.compared_days.map((day) => ({
      date: day.date,
      label: formatShortDate(day.date),
      revenue: Number(day.metrics.revenue),
      revenueLabel: formatCurrency(day.metrics.revenue),
      isCurrent: false,
    })),
    {
      date: currentDate,
      label: "Hoje",
      revenue: Number(comparison.current_period.metrics.revenue),
      revenueLabel: formatCurrency(comparison.current_period.metrics.revenue),
      isCurrent: true,
    },
  ];
  const maxRevenue = revenueChartItems.reduce((current, item) => {
    if (Number.isNaN(item.revenue)) {
      return current;
    }
    return Math.max(current, item.revenue);
  }, 0);

  return (
    <section className="rounded-[28px] border border-white/8 bg-[#090909] p-5 shadow-card">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/40">
            Comparativo
          </p>
          <p className="mt-2 text-lg font-semibold tracking-tight text-white">
            Média de {comparison.weekday_name ?? "dias anteriores"}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.04] p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
            Revenue por data
          </p>
          <p className="text-xs font-medium text-white/55">
            Média {formatCurrency(comparison.compared_average.revenue)}
          </p>
        </div>

        {revenueChartItems.length > 0 ? (
          <div className="mt-4 flex h-40 items-end gap-3">
            {revenueChartItems.map((item) => {
              const barHeight = maxRevenue > 0 && !Number.isNaN(item.revenue)
                ? Math.max((item.revenue / maxRevenue) * 100, 8)
                : 8;

              return (
                <div
                  key={`${item.date}-${item.isCurrent ? "current" : "compared"}`}
                  className="group flex min-w-0 flex-1 flex-col items-center"
                >
                  <div className="mb-2 min-h-[20px] text-center">
                    <span className="rounded-md bg-black px-2 py-1 text-[10px] font-semibold text-white opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                      {item.revenueLabel}
                    </span>
                  </div>
                  <div className="flex h-28 w-full items-end overflow-hidden rounded-[14px] bg-black/25 px-1">
                    <div
                      className={`w-full rounded-t-[12px] transition-all duration-300 ${
                        item.isCurrent
                          ? "bg-emerald-300 shadow-[0_0_22px_rgba(110,231,183,0.22)]"
                          : "bg-white shadow-[0_0_20px_rgba(255,255,255,0.14)]"
                      }`}
                      style={{ height: `${barHeight}%` }}
                    />
                  </div>
                  <span
                    className={`mt-3 text-center text-[10px] font-semibold uppercase tracking-[0.04em] ${
                      item.isCurrent ? "text-emerald-200" : "text-white/45"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 text-sm text-white/55">Sem dias comparados.</p>
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
