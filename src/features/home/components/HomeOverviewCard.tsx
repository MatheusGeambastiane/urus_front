"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Filter, Loader2 } from "lucide-react";
import { formatCurrency } from "@/src/features/shared/utils/money";
import type { DailySummaryComparisonMetric } from "@/src/features/home/types";

type ChartItem = {
  key: string;
  label: string;
  totalValue: number;
  displayValue: string;
  isToday: boolean;
  barHeight: number;
};

type OverviewHighlight = {
  title: string;
  label: string;
  value: string;
};

type HomeOverviewCardProps = {
  title: string;
  totalValue: string;
  appointmentsValue: string;
  sellValue: string;
  totalServices: number;
  highlights?: OverviewHighlight[];
  revenueComparison?: DailySummaryComparisonMetric | null;
  chartItems: ChartItem[];
  loading: boolean;
  error: string | null;
  filterDescription: string | null;
  onOpenFilters: () => void;
  onClearFilters: () => void;
};

type OverviewHeaderProps = {
  title: string;
  totalValue: string;
  totalServices: number;
  revenueComparison?: DailySummaryComparisonMetric | null;
  onOpenFilters: () => void;
  compact?: boolean;
};

type FilterDescriptionProps = {
  description: string;
  onClear: () => void;
  compact?: boolean;
};

type PeriodChartBodyProps = {
  chartItems: ChartItem[];
  loading: boolean;
  error: string | null;
};

function OverviewHeader({
  title,
  totalValue,
  totalServices,
  revenueComparison,
  onOpenFilters,
  compact = false,
}: OverviewHeaderProps) {
  const comparisonPercentage = revenueComparison?.percentage
    ? Number(revenueComparison.percentage)
    : null;
  const hasRevenueComparison = Boolean(revenueComparison);
  const comparisonTone = (comparisonPercentage ?? Number(revenueComparison?.difference ?? 0)) >= 0
    ? "text-emerald-200 border-emerald-400/20 bg-emerald-400/10"
    : "text-rose-200 border-rose-400/20 bg-rose-400/10";
  const comparisonDifference = revenueComparison ? Number(revenueComparison.difference) : 0;
  const comparisonDirection = comparisonDifference >= 0 ? "acima" : "abaixo";
  const comparisonPercentageLabel = comparisonPercentage === null || Number.isNaN(comparisonPercentage)
    ? "Sem percentual"
    : `${Math.abs(comparisonPercentage).toLocaleString("pt-BR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })}%`;
  const comparisonDifferenceLabel = revenueComparison
    ? formatCurrency(String(Math.abs(comparisonDifference)))
    : "";
  const comparisonAverageLabel = revenueComparison
    ? formatCurrency(revenueComparison.compared)
    : "";

  return (
    <>
      <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-white/[0.03] blur-3xl" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/45 lg:text-[#e5e7eb]/75">
            {title}
          </p>
          <div className={`mt-4 flex items-end gap-2 ${compact ? "lg:mt-3" : ""}`}>
            <span className="text-lg font-medium text-white/35">R$</span>
            <span className={`font-medium tracking-tight text-white ${compact ? "text-3xl lg:text-[2.65rem] lg:leading-none" : "text-4xl sm:text-5xl"}`}>
              {totalValue.replace(/^R\$\s?/, "")}
            </span>
          </div>
          {hasRevenueComparison ? (
            <div className="mt-3 flex flex-wrap text-xs font-semibold">
              <span className={`rounded-full border px-3 py-1 ${comparisonTone}`}>
                {comparisonPercentageLabel} ({comparisonDifferenceLabel}) {comparisonDirection} da média de{" "}
                {comparisonAverageLabel}
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={onOpenFilters}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/75 transition hover:border-white/25 hover:bg-white/[0.07] lg:border-[#e5e7eb]/20 lg:text-[#f4f4f5] lg:hover:border-[#e5e7eb]/45 lg:hover:bg-[#e5e7eb]/10"
          >
            <Filter className="h-3.5 w-3.5" />
            Filtros
          </button>
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-medium text-white/55 lg:hidden">
            {totalServices} serviços
          </span>
        </div>
      </div>
    </>
  );
}

function FilterDescription({ description, onClear, compact = false }: FilterDescriptionProps) {
  return (
    <div className={`relative z-10 mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-xs text-white/65 ${compact ? "lg:rounded-xl lg:border-[#e5e7eb]/15 lg:bg-[#e5e7eb]/[0.045] lg:px-3 lg:py-2" : ""}`}>
      <span>{description}</span>
      <button
        type="button"
        onClick={onClear}
        className="font-medium text-white/80 underline-offset-4 hover:text-white hover:underline"
      >
        Limpar filtro
      </button>
    </div>
  );
}

function PeriodChartBody({ chartItems, loading, error }: PeriodChartBodyProps) {
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const pages = useMemo(() => {
    const chunks: ChartItem[][] = [];
    for (let index = 0; index < chartItems.length; index += 7) {
      chunks.push(chartItems.slice(index, index + 7));
    }
    return chunks;
  }, [chartItems]);
  const showPagination = pages.length > 1;

  const scrollToPage = (pageIndex: number) => {
    const container = sliderRef.current;
    if (!container) return;
    const nextPage = Math.max(0, Math.min(pageIndex, pages.length - 1));
    setCurrentPage(nextPage);
    container.scrollTo({
      left: container.clientWidth * nextPage,
      behavior: "smooth",
    });
  };

  if (loading) {
    return (
      <div className="relative z-10 flex h-44 items-center justify-center text-white/60">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative z-10 mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
        {error}
      </div>
    );
  }

  if (chartItems.length === 0) {
    return (
      <div className="relative z-10 mt-6 rounded-2xl border border-white/10 bg-black/20 px-4 py-6 text-sm text-white/60">
        Nenhum dado disponível para o gráfico semanal.
      </div>
    );
  }

  return (
    <div className="relative z-10 mt-7">
      {showPagination ? (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.18em] text-white/35">
            Página {currentPage + 1} de {pages.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollToPage(currentPage - 1)}
              disabled={currentPage === 0}
              className="rounded-full border border-white/10 p-2 text-white/70 disabled:opacity-35"
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollToPage(currentPage + 1)}
              disabled={currentPage === pages.length - 1}
              className="rounded-full border border-white/10 p-2 text-white/70 disabled:opacity-35"
              aria-label="Próxima página"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <div
        ref={sliderRef}
        className={`no-scrollbar flex gap-4 overflow-x-auto scroll-smooth ${showPagination ? "snap-x snap-mandatory" : ""}`}
        onScroll={(event) => {
          if (!showPagination) return;
          const container = event.currentTarget;
          const nextPage = Math.round(container.scrollLeft / Math.max(container.clientWidth, 1));
          if (nextPage !== currentPage) {
            setCurrentPage(nextPage);
          }
        }}
      >
        {pages.map((page, pageIndex) => (
          <div
            key={`chart-page-${pageIndex}`}
            className={`min-w-full ${showPagination ? "snap-start" : ""}`}
          >
            <div className="grid grid-cols-7 gap-2">
              {page.map((item) => (
                <div key={item.key} className="group min-w-0">
                  <div className="mb-2 min-h-[24px] text-center opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                    <span
                      className={`rounded-md px-2 py-1 text-[11px] font-medium ${
                        item.isToday ? "bg-white text-black lg:bg-[#e5e7eb]" : "bg-black text-white"
                      }`}
                    >
                      {item.displayValue}
                    </span>
                  </div>
                  <div className="flex h-36 items-end overflow-hidden rounded-[14px] bg-white/[0.05] px-1">
                    <div
                      className={`block w-full rounded-t-[12px] transition-all duration-300 ${
                        item.isToday
                          ? "bg-white shadow-[0_0_24px_rgba(255,255,255,0.18)] lg:bg-[#e5e7eb] lg:shadow-[0_0_28px_rgba(255,255,255,0.22)]"
                          : "bg-neutral-600 group-hover:bg-neutral-500"
                      }`}
                      style={{
                        height: `${Math.max(item.barHeight, 6)}%`,
                        minHeight: item.totalValue > 0 ? "10px" : "6px",
                      }}
                    />
                  </div>
                  <span
                    className={`mt-3 block text-center text-[10px] font-medium uppercase tracking-[0.04em] ${
                      item.isToday ? "text-white lg:text-[#f4f4f5]" : "text-white/35"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomeOverviewCard({
  title,
  totalValue,
  appointmentsValue,
  sellValue,
  totalServices,
  highlights = [],
  revenueComparison,
  chartItems,
  loading,
  error,
  filterDescription,
  onOpenFilters,
  onClearFilters,
}: HomeOverviewCardProps) {
  const summaryCards = [
    { title: "Serviços", value: appointmentsValue, label: "Valor em atendimentos" },
    { title: "Produtos", value: sellValue, label: "Valor em vendas" },
    { title: "Total serviços", value: String(totalServices), label: "Executados no período" },
    ...highlights.slice(0, 2),
  ];

  return (
    <>
      <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_32%),linear-gradient(180deg,#0b0b0b,#060606)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] lg:hidden">
        <OverviewHeader
          title={title}
          totalValue={totalValue}
          totalServices={totalServices}
          revenueComparison={revenueComparison}
          onOpenFilters={onOpenFilters}
        />

        {filterDescription ? (
          <FilterDescription description={filterDescription} onClear={onClearFilters} />
        ) : null}

        <div className="relative z-10 mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div className="p-1">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">Serviços</p>
            <p className="mt-2 text-sm font-semibold text-white">{appointmentsValue}</p>
          </div>
          <div className="p-1">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">Produtos</p>
            <p className="mt-2 text-sm font-semibold text-white">{sellValue}</p>
          </div>
          <div className="hidden rounded-2xl border border-white/8 bg-white/[0.04] p-3 sm:block">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">Período</p>
            <p className="mt-2 text-sm font-semibold text-white">Últimos 7 dias</p>
          </div>
        </div>

        <PeriodChartBody chartItems={chartItems} loading={loading} error={error} />
      </section>

      <div className="hidden lg:col-span-12 lg:grid lg:grid-cols-12 lg:gap-5">
        <article className="relative min-w-0 overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_32%),linear-gradient(180deg,#0b0b0b,#060606)] p-5 shadow-card lg:col-span-12 lg:rounded-[20px] lg:border-[#e5e7eb]/20 lg:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_38%),linear-gradient(145deg,#0a0a0a,#090909_68%)] lg:shadow-[0_28px_70px_rgba(0,0,0,0.34)] xl:col-span-4">
          <OverviewHeader
            title={title}
            totalValue={totalValue}
            totalServices={totalServices}
            revenueComparison={revenueComparison}
            onOpenFilters={onOpenFilters}
            compact
          />
          {filterDescription ? (
            <FilterDescription description={filterDescription} onClear={onClearFilters} compact />
          ) : null}
        </article>

        <div className="grid min-w-0 gap-5 lg:col-span-12 lg:grid-cols-3 xl:col-span-8 xl:grid-cols-2 2xl:grid-cols-3">
          {summaryCards.map((card) => (
            <article
              key={`${card.title}-${card.value}`}
              className="group flex min-w-0 flex-col justify-center rounded-[26px] border border-white/8 bg-[#090909] p-5 shadow-card lg:rounded-[20px] lg:bg-[#0a0a0a] lg:transition lg:duration-300 lg:hover:-translate-y-0.5 lg:hover:border-[#e5e7eb]/25 lg:hover:bg-[#0a0a0a]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
                {card.title}
              </p>
              <p className="home-display mt-4 break-words text-xl font-semibold tracking-tight text-white lg:text-[1.7rem] lg:leading-none 2xl:text-3xl">
                {card.value}
              </p>
              <p className="mt-2 break-words text-xs leading-relaxed text-white/45">{card.label}</p>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}

export function PeriodChartCard({ chartItems, loading, error }: PeriodChartBodyProps) {
  return (
    <section className="relative h-full overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_32%),linear-gradient(180deg,#0b0b0b,#060606)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] lg:rounded-[20px] lg:border-white/[0.07] lg:bg-[#0a0a0a]">
      <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-white/[0.03] blur-3xl" />
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#e5e7eb]/70">Período</p>
          <h2 className="home-display mt-1 text-2xl font-semibold tracking-tight text-white">Gráfico do período</h2>
        </div>
        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-medium text-white/55">
          Últimos 7 dias
        </span>
      </div>
      <PeriodChartBody chartItems={chartItems} loading={loading} error={error} />
    </section>
  );
}
