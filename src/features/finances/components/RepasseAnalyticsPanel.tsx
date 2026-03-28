"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FileText } from "lucide-react";
import type { ProfessionalServiceSummary, RepasseDetail } from "@/src/features/repasses/types";
import {
  formatMonthReference,
  getPaymentTypeLabel,
  pieChartColors,
} from "@/src/features/finances/utils/finances";
import { parseCurrencyInput } from "@/src/features/shared/utils/money";
import { formatCurrency } from "@/src/features/shared/utils/money";
import { capitalizeFirstLetter } from "@/src/features/shared/utils/string";

type RepasseAnalyticsPanelProps = {
  detail: RepasseDetail;
  analytics: ProfessionalServiceSummary | null;
  loading: boolean;
  error: string | null;
  onOpenInvoice?: () => void;
};

export function RepasseAnalyticsPanel({
  detail,
  analytics,
  loading,
  error,
  onOpenInvoice,
}: RepasseAnalyticsPanelProps) {
  const formatIsoDateLabel = (value?: string | null) => {
    if (!value) {
      return "--";
    }
    const [year, month, day] = value.split("-");
    if (!year || !month || !day) {
      return value;
    }
    return `${day}/${month}/${year}`;
  };

  const formatCompactRange = (start?: string | null, end?: string | null) => {
    if (!start || !end) {
      return "--";
    }
    const [startYear, startMonth, startDay] = start.split("-");
    const [endYear, endMonth, endDay] = end.split("-");
    if (!startYear || !startMonth || !startDay || !endYear || !endMonth || !endDay) {
      return `${start} - ${end}`;
    }
    if (start === end) {
      return `${startDay}/${startMonth}`;
    }
    return `${startDay}/${startMonth} - ${endDay}/${endMonth}`;
  };

  const totals = analytics?.totals;
  const servicesBreakdown = analytics?.services_breakdown ?? [];
  const categoriesBreakdown = analytics?.categories_breakdown ?? [];
  const productsBreakdown = analytics?.sell_transactions_by_product ?? [];
  const weeklyRevenue = analytics?.weekly_revenue ?? [];
  const bestRevenueDay = analytics?.best_revenue_day ?? null;
  const monthLabel = analytics?.period.month ?? detail.month.slice(0, 7);
  const repassServiceValue = totals?.repass_value_service ?? detail.value_service ?? "0";
  const repassProductValue = totals?.repass_value_product ?? detail.value_product ?? "0";
  const repassTipsValue = totals?.repass_value_tips ?? detail.value_tips ?? "0";
  const repassAllowenceValue = totals?.repass_allowence ?? detail.allowence ?? "0";
  const repassTotalValue = (
    parseCurrencyInput(repassServiceValue) +
    parseCurrencyInput(repassProductValue) +
    parseCurrencyInput(repassTipsValue) +
    parseCurrencyInput(repassAllowenceValue)
  ).toFixed(2);
  const totalServicesFromBreakdown = servicesBreakdown.reduce(
    (accumulator, item) => accumulator + item.total,
    0,
  );
  const averageDailyRevenue = parseCurrencyInput(analytics?.average_daily_revenue ?? "0");
  const weeklyRevenueData = weeklyRevenue.map((item) => ({
    label: formatCompactRange(item.start_date, item.end_date),
    total: parseCurrencyInput(item.total_value ?? "0"),
    range: `${formatIsoDateLabel(item.start_date)} até ${formatIsoDateLabel(item.end_date)}`,
    weekLabel: `${formatCompactRange(item.start_date, item.end_date)}`,
  }));
  const productSalesData = productsBreakdown.map((item) => ({
    ...item,
    total: parseCurrencyInput(item.total_value ?? "0"),
  }));

  if (loading && !analytics) {
    return <p className="rounded-3xl border border-white/10 px-4 py-6 text-center text-sm text-white/60">Carregando análises...</p>;
  }

  if (error) {
    return <p className="rounded-3xl border border-red-500/30 bg-red-500/10 px-4 py-4 text-sm text-red-100">{error}</p>;
  }

  if (!analytics) {
    return <p className="rounded-3xl border border-white/10 px-4 py-6 text-center text-sm text-white/60">Nenhuma análise disponível para o período selecionado.</p>;
  }

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-[32px] border border-white/12 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl text-white">
        <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="relative space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/45">Visão do profissional</p>
              <p className="mt-2 text-2xl font-medium tracking-tight">{analytics.professional.name}</p>
              <p className="mt-1 text-sm text-white/60">Período: {monthLabel}</p>
            </div>
            <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-medium text-white/65">
              {analytics.professional.professional_type}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <article className="rounded-[24px] border border-white/10 bg-white/[0.05] p-4 backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Total a receber</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-emerald-300 sm:text-3xl">
                {formatCurrency(repassTotalValue)}
              </p>
              <p className="mt-2 text-xs text-white/58">
                Serviços {formatCurrency(repassServiceValue)} • Produtos {formatCurrency(repassProductValue)}
              </p>
            </article>

            <article className="rounded-[24px] border border-white/10 bg-white/[0.05] p-4 backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Atendimentos x serviços</p>
              <p className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
                {totals?.appointments_count ?? 0} / {totals?.services_performed ?? 0}
              </p>
              <p className="mt-2 text-xs text-white/58">Atendimentos realizados e serviços executados</p>
            </article>

            <article className="rounded-[24px] border border-white/10 bg-white/[0.05] p-4 backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Melhor dia</p>
              <p className="mt-3 text-2xl font-semibold text-emerald-300 sm:text-3xl">
                {bestRevenueDay ? formatCurrency(bestRevenueDay.total_value) : formatCurrency("0")}
              </p>
              <p className="mt-2 text-xs text-white/58">
                {bestRevenueDay ? formatIsoDateLabel(bestRevenueDay.date) : "Sem pico no período"}
              </p>
            </article>

            <article className="rounded-[24px] border border-white/10 bg-white/[0.05] p-4 backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Média diária</p>
              <p className="mt-3 text-2xl font-semibold text-cyan-200 sm:text-3xl">
                {formatCurrency(averageDailyRevenue.toFixed(2))}
              </p>
              <p className="mt-2 text-xs text-white/58">Faturamento médio por dia</p>
            </article>
          </div>

          <div className="grid gap-3">
            <div className="rounded-[28px] border border-white/10 bg-black/20 p-4 backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">Faturamento por semana</p>
                  <p className="mt-1 text-base font-semibold">Evolução do mês</p>
                </div>
              </div>
              {weeklyRevenueData.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-center text-sm text-white/60">
                  Nenhum faturamento semanal disponível.
                </p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyRevenueData} barCategoryGap={18}>
                      <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                      <XAxis
                        dataKey="weekLabel"
                        tick={{ fill: "#d4d4d8", fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#a1a1aa", fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value: number) => `R$${Math.round(value)}`}
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value.toFixed(2))}
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.range ?? ""}
                        contentStyle={{ backgroundColor: "#111", borderRadius: 16, border: "1px solid #333" }}
                      />
                      <Bar
                        dataKey="total"
                        fill="#99f6e4"
                        radius={[10, 10, 0, 0]}
                        minPointSize={weeklyRevenueData.some((item) => item.total > 0) ? 0 : 2}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <fieldset className="space-y-4 rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 shadow-card backdrop-blur-md">
        <legend className="px-2 text-xs uppercase tracking-wide text-white/50">Serviços realizados</legend>
        <div className="flex items-center justify-between text-sm text-white/70">
          <p>Total do período</p>
          <span className="font-semibold text-white">{totalServicesFromBreakdown} serviços</span>
        </div>
        {servicesBreakdown.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/10 px-4 py-4 text-center text-sm text-white/60">
            Nenhum serviço encontrado para o período.
          </p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={servicesBreakdown}>
                <XAxis dataKey="service_name" tick={{ fill: "#A1A1AA", fontSize: 12 }} />
                <YAxis tick={{ fill: "#A1A1AA", fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => `${value} serviços`}
                  contentStyle={{ backgroundColor: "#111", borderRadius: 12, border: "1px solid #333" }}
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                  {servicesBreakdown.map((item, index) => (
                    <Cell key={item.service_id} fill={pieChartColors[index % pieChartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </fieldset>

      <fieldset className="space-y-4 rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 shadow-card backdrop-blur-md">
        <legend className="px-2 text-xs uppercase tracking-wide text-white/50">Distribuição por categoria</legend>
        {categoriesBreakdown.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/10 px-4 py-4 text-center text-sm text-white/60">
            Nenhuma categoria encontrada.
          </p>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoriesBreakdown} dataKey="total" nameKey="category_name" innerRadius={60} outerRadius={90} paddingAngle={4}>
                    {categoriesBreakdown.map((item, index) => (
                      <Cell key={item.category_id} fill={pieChartColors[index % pieChartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, _name, payload) =>
                      `${payload?.payload?.category_name ?? ""}: ${value} serviços`
                    }
                    contentStyle={{ backgroundColor: "#111", borderRadius: 12, border: "1px solid #333" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full space-y-3 text-sm text-white/80">
              {categoriesBreakdown.map((item, index) => (
                <div
                  key={`category-legend-${item.category_id}`}
                  className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: pieChartColors[index % pieChartColors.length] }}
                    />
                    <div>
                      <p className="font-semibold text-white">{item.category_name}</p>
                      <p className="text-xs text-white/60">{item.total} serviços</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </fieldset>

      <fieldset className="space-y-4 rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 shadow-card backdrop-blur-md">
        <legend className="px-2 text-xs uppercase tracking-wide text-white/50">Vendas por produto</legend>
        {productSalesData.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/10 px-4 py-4 text-center text-sm text-white/60">
            Nenhuma venda por produto encontrada para o período.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-[0.18em] text-white/45">
                    <th className="px-4 py-3 font-medium">Produto</th>
                    <th className="w-24 px-4 py-3 font-medium text-center">Vendas</th>
                    <th className="w-28 px-4 py-3 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {productSalesData.map((item) => (
                    <tr key={`product-sale-${item.product_id}`} className="border-b border-white/5 last:border-b-0">
                      <td className="px-4 py-3 align-top">
                        <p className="line-clamp-2 text-sm font-semibold text-white">{item.product_name}</p>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-white/70">
                        {item.transactions_count}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-300">
                        {formatCurrency(item.total_value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </fieldset>

      <section className="space-y-4 rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 shadow-card backdrop-blur-md text-white">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs uppercase tracking-wide text-white/60">Mês de referência</p>
            <p className="mt-1 text-lg font-semibold">{formatMonthReference(detail.month)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs uppercase tracking-wide text-white/60">Nota fiscal</p>
            {detail.invoice ? (
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <a
                  href={detail.invoice}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white underline-offset-4 hover:underline"
                >
                  <FileText className="h-4 w-4" />
                  Ver nota fiscal
                </a>
                {onOpenInvoice ? (
                  <button
                    type="button"
                    onClick={onOpenInvoice}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
                  >
                    Atualizar
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="mt-2 space-y-3">
                <p className="text-sm text-white/60">Sem nota fiscal cadastrada para esse repasse.</p>
                {onOpenInvoice ? (
                  <button
                    type="button"
                    onClick={onOpenInvoice}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
                  >
                    Enviar nota fiscal
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>

        <fieldset className="space-y-3 rounded-2xl border border-white/10 bg-black/40 p-4">
          <legend className="px-2 text-xs uppercase tracking-wide text-white/50">Transações</legend>
          <p className="text-sm text-white/70">Pagamentos relacionados a este repasse.</p>
          {detail.transactions.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/10 px-4 py-4 text-center text-sm text-white/60">
              Nenhuma transação registrada para este repasse.
            </p>
          ) : (
            <ul className="space-y-3">
              {detail.transactions.map((transaction) => {
                const transactionDate = transaction.date_of_transaction
                  ? new Date(transaction.date_of_transaction).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "--/--/----";
                const paymentLabel =
                  getPaymentTypeLabel(transaction.transaction_payment as never) ||
                  capitalizeFirstLetter(transaction.transaction_payment);

                return (
                  <li
                    key={transaction.id}
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {transaction.type === "payment"
                            ? "Pagamento"
                            : capitalizeFirstLetter(transaction.type)}
                        </p>
                        <p className="text-xs text-white/60">{transactionDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-white">
                          {formatCurrency(transaction.price ?? "0")}
                        </p>
                        <p className="text-xs text-white/60">{paymentLabel}</p>
                        {transaction.money_resource ? (
                          <p className="text-xs text-white/60">
                            Origem: {capitalizeFirstLetter(transaction.money_resource)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    {transaction.payment_proof ? (
                      <a
                        href={transaction.payment_proof}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-white/80 underline-offset-2 hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        Ver comprovante
                      </a>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </fieldset>
      </section>
    </div>
  );
}
