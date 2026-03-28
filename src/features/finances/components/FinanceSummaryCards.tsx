"use client";

import { DollarSign, Scissors } from "lucide-react";
import type { FinanceSummary } from "@/src/features/finances/types";

type FinanceSummaryCardsProps = {
  summary: FinanceSummary | null;
};

const cards = [
  // { key: "revenue", label: "Receitas", description: "Entradas do mês", icon: Coins, accent: "text-emerald-300" },
  // { key: "expenses", label: "Despesas", description: "Saídas do mês", icon: Wallet, accent: "text-rose-300" },
  { key: "appointments_count", label: "Serviços", description: "Total executados", icon: Scissors, accent: "text-white" },
  { key: "sell_transactions_count", label: "Vendas", description: "Produtos vendidos", icon: DollarSign, accent: "text-white" },
] as const;

export function FinanceSummaryCards({ summary }: FinanceSummaryCardsProps) {
  return (
    <section className="grid grid-cols-2 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const value =
          card.key === "appointments_count"
            ? summary?.appointments_count ?? 0
            : summary?.sell_transactions_count ?? 0;

        return (
          <article
            key={card.key}
            className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.22)]"
          >
            <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-white/[0.03] blur-2xl" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-white/80">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">{card.description}</p>
                <p className="mt-1 text-lg font-semibold text-white">{card.label}</p>
                <p className={`mt-1 text-2xl font-semibold ${card.accent}`}>{value}</p>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
