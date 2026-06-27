"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ServiceSummaryItem } from "@/src/features/finances/types";

type ServicesSummaryTableProps = {
  items: ServiceSummaryItem[];
  loading: boolean;
};

export function ServicesSummaryTable({ items, loading }: ServicesSummaryTableProps) {
  const [collapsed, setCollapsed] = useState(false);
  const total = items.reduce((sum, item) => sum + Number(item.total ?? 0), 0);

  return (
    <section className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 text-white shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Serviços realizados</p>
          <p className="text-lg font-semibold text-white">Tabela de serviços</p>
          <p className="mt-1 text-xs text-white/50">{total} serviços no período</p>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((current) => !current)}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/75 transition hover:border-white/20 hover:bg-white/[0.07]"
        >
          {collapsed ? "Expandir" : "Retrair"}
          <ChevronDown className={`h-3.5 w-3.5 transition ${collapsed ? "" : "rotate-180"}`} />
        </button>
      </div>

      {!collapsed ? (
        <div className="mt-4 max-h-72 overflow-y-auto rounded-2xl border border-white/10">
          {loading ? (
            <p className="px-4 py-5 text-center text-sm text-white/60">Carregando...</p>
          ) : items.length === 0 ? (
            <p className="px-4 py-5 text-center text-sm text-white/60">Nenhum serviço encontrado.</p>
          ) : (
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead className="sticky top-0 bg-[#0b0b0b] text-[11px] uppercase tracking-[0.16em] text-white/40">
                <tr>
                  <th className="px-4 py-3 font-medium">Serviço</th>
                  <th className="w-24 px-4 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {items.map((item, index) => (
                  <tr key={`${item.service_name}-${index}`} className="text-white/78">
                    <td className="px-4 py-3">{item.service_name}</td>
                    <td className="px-4 py-3 text-right font-semibold text-white">{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : null}
    </section>
  );
}
