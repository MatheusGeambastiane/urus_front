"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Filter, Loader2 } from "lucide-react";

type ChartItem = {
  key: string;
  label: string;
  totalValue: number;
  displayValue: string;
  isToday: boolean;
  barHeight: number;
};

type HomeOverviewCardProps = {
  title: string;
  totalValue: string;
  appointmentsValue: string;
  sellValue: string;
  totalServices: number;
  chartItems: ChartItem[];
  loading: boolean;
  error: string | null;
  filterDescription: string | null;
  onOpenFilters: () => void;
  onClearFilters: () => void;
};

export function HomeOverviewCard({
  title,
  totalValue,
  appointmentsValue,
  sellValue,
  totalServices,
  chartItems,
  loading,
  error,
  filterDescription,
  onOpenFilters,
  onClearFilters,
}: HomeOverviewCardProps) {
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

  return (
    <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_32%),linear-gradient(180deg,#0b0b0b,#060606)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
      <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-white/[0.03] blur-3xl" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/45">
            {title}
          </p>
          <div className="mt-4 flex items-end gap-2">
            <span className="text-lg font-medium text-white/35">R$</span>
            <span className="text-4xl font-medium tracking-tight text-white sm:text-5xl">
              {totalValue.replace(/^R\$\s?/, "")}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={onOpenFilters}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/75 transition hover:border-white/25 hover:bg-white/[0.07]"
          >
            <Filter className="h-3.5 w-3.5" />
            Filtros
          </button>
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-medium text-white/55">
            {totalServices} serviços
          </span>
        </div>
      </div>

      {filterDescription ? (
        <div className="relative z-10 mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-xs text-white/65">
          <span>{filterDescription}</span>
          <button
            type="button"
            onClick={onClearFilters}
            className="font-medium text-white/80 underline-offset-4 hover:text-white hover:underline"
          >
            Limpar filtro
          </button>
        </div>
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

      {loading ? (
        <div className="relative z-10 flex h-44 items-center justify-center text-white/60">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : error ? (
        <div className="relative z-10 mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : chartItems.length === 0 ? (
        <div className="relative z-10 mt-6 rounded-2xl border border-white/10 bg-black/20 px-4 py-6 text-sm text-white/60">
          Nenhum dado disponível para o gráfico semanal.
        </div>
      ) : (
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
                            item.isToday ? "bg-white text-black" : "bg-black text-white"
                          }`}
                        >
                          {item.displayValue}
                        </span>
                      </div>
                      <div className="flex h-36 items-end overflow-hidden rounded-[14px] bg-white/[0.05] px-1">
                        <div
                          className={`block w-full rounded-t-[12px] transition-all duration-300 ${
                            item.isToday
                              ? "bg-white shadow-[0_0_24px_rgba(255,255,255,0.18)]"
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
                          item.isToday ? "text-white" : "text-white/35"
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
      )}
    </section>
  );
}
