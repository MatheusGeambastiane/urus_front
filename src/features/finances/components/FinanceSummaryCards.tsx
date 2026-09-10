"use client";

import { DollarSign, Repeat2, Scissors, UserPlus } from "lucide-react";
import type { FinanceSummary } from "@/src/features/finances/types";

type FinanceSummaryCardsProps = {
  summary: FinanceSummary | null;
  onNewClientsClick: () => void;
  onReturningClientsClick: () => void;
};

const cards = [
  // { key: "revenue", label: "Receitas", description: "Entradas do mês", icon: Coins, accent: "text-emerald-300" },
  // { key: "expenses", label: "Despesas", description: "Saídas do mês", icon: Wallet, accent: "text-rose-300" },
  { key: "appointments_count", label: "Serviços", description: "Total executados", icon: Scissors, accent: "text-white" },
  { key: "sell_transactions_count", label: "Vendas", description: "Produtos vendidos", icon: DollarSign, accent: "text-white" },
  { key: "new_clients_count", label: "Novos clientes", description: "Primeiro atendimento", icon: UserPlus, accent: "text-white" },
  { key: "returning_clients_count", label: "Clientes recorrentes", description: "Voltaram no mês", icon: Repeat2, accent: "text-white" },
] as const;

export function FinanceSummaryCards({
  summary,
  onNewClientsClick,
  onReturningClientsClick,
}: FinanceSummaryCardsProps) {
  return (
    <section className="grid grid-cols-2 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = summary?.[card.key] ?? 0;
        const onClick =
          card.key === "new_clients_count"
            ? onNewClientsClick
            : card.key === "returning_clients_count"
              ? onReturningClientsClick
              : null;
        const content = (
          <>
            <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-white/[0.03] blur-2xl" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-white/80">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                  {card.description}
                </p>
                <p className="mt-1 text-lg font-semibold text-white">{card.label}</p>
                <p className={`mt-1 text-2xl font-semibold ${card.accent}`}>{value}</p>
                {onClick ? (
                  <p className="mt-2 text-[11px] font-medium text-white/38">Ver atendimentos</p>
                ) : null}
              </div>
            </div>
          </>
        );

        if (onClick) {
          return (
            <button
              key={card.key}
              type="button"
              onClick={onClick}
              className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.22)] transition hover:border-white/20 hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
            >
              {content}
            </button>
          );
        }

        return (
          <article
            key={card.key}
            className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.22)]"
          >
            {content}
          </article>
        );
      })}
    </section>
  );
}
