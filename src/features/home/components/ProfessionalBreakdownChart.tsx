"use client";

import type { SummaryProfessionalBreakdown } from "@/src/features/home/types";

type ProfessionalBreakdownChartProps = {
  items: SummaryProfessionalBreakdown[];
  loading: boolean;
};

export function ProfessionalBreakdownChart({
  items,
  loading,
}: ProfessionalBreakdownChartProps) {
  const maxValue = items.reduce((current, item) => Math.max(current, item.total), 1);

  return (
    <section className="rounded-[28px] border border-white/8 bg-[#090909] p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/40">
            Atendimentos por profissional
          </p>
          <p className="mt-1 text-lg font-semibold text-white">Distribuição do dia</p>
        </div>
        <span className="text-[11px] uppercase tracking-[0.18em] text-white/30">Hoje</span>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-white/60">Carregando...</p>
      ) : items.length === 0 ? (
        <p className="mt-6 text-sm text-white/60">Nenhum atendimento registrado.</p>
      ) : (
        <div className="mt-8 flex items-end justify-between gap-3">
          {items.map((item, index) => {
            const heightPercent = Math.max((item.total / maxValue) * 100, 12);
            const isPrimary = index === 0;

            return (
              <div key={item.professional_id} className="flex flex-1 flex-col items-center">
                <div className="flex h-36 w-full items-end rounded-[20px] bg-white/[0.04] p-1.5">
                  <div
                    className={`w-full rounded-[16px] ${
                      isPrimary ? "bg-white" : "bg-gradient-to-t from-white/55 to-white/25"
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <p className="mt-3 text-center text-xs text-white/60">{item.professional_name}</p>
                <p className="mt-1 text-sm font-semibold text-white">{item.total}</p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
