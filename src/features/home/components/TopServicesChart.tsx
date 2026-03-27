"use client";

import type { SummaryServiceHighlight } from "@/src/features/home/types";

type TopServicesChartProps = {
  items: SummaryServiceHighlight[];
  loading: boolean;
};

export function TopServicesChart({ items, loading }: TopServicesChartProps) {
  const maxValue = items.reduce((current, item) => Math.max(current, item.total), 1);

  return (
    <section className="rounded-[28px] border border-white/8 bg-[#090909] p-5 shadow-card">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/40">
          Top serviços
        </p>
        <p className="mt-1 text-lg font-semibold text-white">Mais executados</p>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-white/60">Carregando...</p>
      ) : items.length === 0 ? (
        <p className="mt-6 text-sm text-white/60">Nenhum serviço destacado hoje.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {items.map((service, index) => {
            const widthPercent = Math.max((service.total / maxValue) * 100, 8);
            const isPrimary = index === 0;

            return (
              <article key={service.service_id} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{service.service_name}</p>
                    <p className="text-xs text-white/45">Serviços executados</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-black px-3 py-1 text-sm font-semibold text-white">
                    {service.total}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className={`h-full rounded-full ${isPrimary ? "bg-white" : "bg-white/45"}`}
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
