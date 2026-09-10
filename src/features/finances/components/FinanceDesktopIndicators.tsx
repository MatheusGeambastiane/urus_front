"use client";

import { Activity, Package, Repeat2, Scissors, UserPlus } from "lucide-react";
import { formatCurrency } from "@/src/features/shared/utils/money";
import type { FinanceSummary } from "@/src/features/finances/types";

type FinanceDesktopIndicatorsProps = {
  summary: FinanceSummary | null;
  averageAppointmentsPerDay: number;
  appointmentTicketAverage: string;
  monthlyTicketAverage: string;
  onNewClientsClick: () => void;
  onReturningClientsClick: () => void;
};

export function FinanceDesktopIndicators({
  summary,
  averageAppointmentsPerDay,
  appointmentTicketAverage,
  monthlyTicketAverage,
  onNewClientsClick,
  onReturningClientsClick,
}: FinanceDesktopIndicatorsProps) {
  const cards = [
    {
      key: "period",
      title: "Indicadores de período",
      value: averageAppointmentsPerDay.toFixed(2).replace(".", ","),
      label: "Média diária de atendimentos",
      detail: `${formatCurrency(appointmentTicketAverage)} ticket médio`,
      icon: Activity,
      onClick: null,
    },
    {
      key: "products",
      title: "Produtos vendidos",
      value: String(summary?.sell_transactions_count ?? 0),
      label: "Vendas registradas no mês",
      detail: `${formatCurrency(monthlyTicketAverage)} ticket total`,
      icon: Package,
      onClick: null,
    },
    {
      key: "services",
      title: "Total de serviços executados",
      value: String(summary?.appointments_count ?? 0),
      label: "Serviços realizados no período",
      detail: "Atendimentos concluídos",
      icon: Scissors,
      onClick: null,
    },
    {
      key: "new-clients",
      title: "Novos clientes",
      value: String(summary?.new_clients_count ?? 0),
      label: "Primeiro atendimento no mês",
      detail: "Clientes conquistados no período",
      icon: UserPlus,
      onClick: onNewClientsClick,
    },
    {
      key: "returning-clients",
      title: "Clientes recorrentes",
      value: String(summary?.returning_clients_count ?? 0),
      label: "Voltaram no mesmo mês",
      detail: "Dois ou mais atendimentos",
      icon: Repeat2,
      onClick: onReturningClientsClick,
    },
  ];

  return (
    <section className="hidden rounded-[30px] border border-white/8 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] p-5 shadow-card lg:block">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-white/40">Indicadores</p>
          <p className="mt-1 text-lg font-semibold text-white">Resumo operacional do mês</p>
        </div>
        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-medium text-white/55">
          Mês selecionado
        </span>
      </div>
      <div className="grid grid-cols-3 gap-4 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;
          const content = (
            <>
              <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-white/[0.035] blur-2xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div className="min-w-0 text-left">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
                    {card.title}
                  </p>
                  <p className="mt-4 truncate text-3xl font-semibold tracking-tight text-white">
                    {card.value}
                  </p>
                  <p className="mt-2 text-sm text-white/58">{card.label}</p>
                  <p className="mt-1 text-xs text-white/38">{card.detail}</p>
                  {card.onClick ? (
                    <p className="mt-3 text-[11px] font-medium text-white/48">Ver atendimentos</p>
                  ) : null}
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/78">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </>
          );

          if (card.onClick) {
            return (
              <button
                key={card.key}
                type="button"
                onClick={card.onClick}
                className="relative overflow-hidden rounded-[26px] border border-white/8 bg-black/18 p-5 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.045] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
              >
                {content}
              </button>
            );
          }

          return (
            <article
              key={card.key}
              className="relative overflow-hidden rounded-[26px] border border-white/8 bg-black/18 p-5"
            >
              {content}
            </article>
          );
        })}
      </div>
    </section>
  );
}
