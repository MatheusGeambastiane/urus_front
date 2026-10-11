"use client";

import type { SummaryProductSale } from "@/src/features/home/types";
import { formatCurrency } from "@/src/features/shared/utils/money";

type TopProductSalesTableProps = {
  items: SummaryProductSale[];
  loading: boolean;
  isPeriod: boolean;
};

export function TopProductSalesTable({ items, loading, isPeriod }: TopProductSalesTableProps) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-white/8 bg-[#090909] shadow-card lg:rounded-[20px] lg:border-white/[0.07] lg:bg-[#0a0a0a]">
      <div className="flex items-end justify-between gap-4 px-5 pb-4 pt-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/40 lg:text-[#e5e7eb]/70">
            Vendas de produtos
          </p>
          <p className="home-display mt-1 text-lg font-semibold text-white lg:text-2xl">
            Mais vendidos
          </p>
        </div>
        <span className="pb-1 text-xs text-white/35">{isPeriod ? "No período" : "No dia"}</span>
      </div>

      {loading ? (
        <p className="px-5 pb-6 pt-2 text-sm text-white/60">Carregando...</p>
      ) : items.length === 0 ? (
        <p className="px-5 pb-6 pt-2 text-sm text-white/60">
          Nenhum produto vendido {isPeriod ? "no período." : "no dia."}
        </p>
      ) : (
        <div className="max-h-[28rem] overflow-y-auto [scrollbar-color:rgba(255,255,255,0.2)_transparent] [scrollbar-width:thin]">
          <table className="w-full table-fixed border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-[#090909] text-[0.65rem] uppercase tracking-[0.16em] text-white/35 lg:bg-[#0a0a0a]">
              <tr className="border-y border-white/[0.07]">
                <th className="w-auto px-5 py-3 font-medium">Produto</th>
                <th className="w-16 px-2 py-3 text-right font-medium">Qtd.</th>
                <th className="w-28 px-5 py-3 text-right font-medium">Valor</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.product_id} className="border-b border-white/[0.06] last:border-b-0">
                  <td className="px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[0.65rem] font-semibold text-white/45">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="truncate text-sm font-semibold text-white" title={item.product_name}>
                        {item.product_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-4 text-right text-sm font-medium tabular-nums text-white/65">
                    {item.quantity}
                  </td>
                  <td className="px-5 py-4 text-right text-sm font-semibold tabular-nums text-white">
                    {formatCurrency(item.total_value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
