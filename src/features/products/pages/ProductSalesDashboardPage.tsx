"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeDollarSign,
  Boxes,
  CalendarDays,
  Coins,
  Crown,
  Medal,
  PackageCheck,
  ReceiptText,
  RefreshCw,
  TrendingUp,
  Trophy,
  UsersRound,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, Tooltip, XAxis, YAxis } from "recharts";

import { DashboardShell } from "@/src/features/dashboard/components/DashboardShell";
import { MonthSelectorModal } from "@/src/features/finances/components/MonthSelectorModal";
import { getMonthLabel } from "@/src/features/finances/utils/finances";
import { useProductSalesDashboard } from "@/src/features/products/hooks/useProductSalesDashboard";
import { ProductSalesHeatmap } from "@/src/features/products/components/ProductSalesHeatmap";
import { ChartResponsiveContainer } from "@/src/features/shared/components/ChartResponsiveContainer";
import { useAuth } from "@/src/features/shared/hooks/useAuth";
import { formatCurrency } from "@/src/features/shared/utils/money";
import { FeedbackBanner } from "@/components/ui/FeedbackBanner";

const chartColors = ["#38bdf8", "#34d399", "#fb7185", "#a78bfa", "#fbbf24", "#22d3ee", "#f472b6"];

const currentMonth = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
};

const todayIso = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

const firstDayIso = () => `${currentMonth()}-01`;

const dateLabel = (value: string) => new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));

const money = (value: string | number) => formatCurrency(String(value));

function EmptyBlock({ children }: { children: string }) {
  return <div className="flex min-h-52 items-center justify-center rounded-[22px] border border-dashed border-white/10 bg-black/10 px-5 text-center text-sm text-white/45">{children}</div>;
}

export function ProductSalesDashboardPage() {
  const router = useRouter();
  const { accessToken, fetchWithAuth, profilePic, userRole } = useAuth();
  const [mode, setMode] = useState<"month" | "range">("month");
  const [month, setMonth] = useState(currentMonth);
  const [monthModalOpen, setMonthModalOpen] = useState(false);
  const [monthYearInput, setMonthYearInput] = useState(() => currentMonth().slice(0, 4));
  const [monthValueInput, setMonthValueInput] = useState(() => currentMonth().slice(5, 7));
  const [monthError, setMonthError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(firstDayIso);
  const [endDate, setEndDate] = useState(todayIso);
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, index) => String(currentYear + 1 - index));
  }, []);
  const filter = useMemo(
    () => mode === "month" ? { mode, month } as const : { mode, startDate, endDate } as const,
    [mode, month, startDate, endDate],
  );
  const { data, loading, error, refresh } = useProductSalesDashboard({ accessToken, fetchWithAuth, filter });

  const openMonthSelector = () => {
    setMonthYearInput(month.slice(0, 4));
    setMonthValueInput(month.slice(5, 7));
    setMonthError(null);
    setMonthModalOpen(true);
  };

  const applyMonth = () => {
    if (!monthYearInput || monthYearInput.length !== 4 || !monthValueInput) {
      setMonthError("Selecione o mês e o ano.");
      return;
    }
    setMonth(`${monthYearInput}-${monthValueInput}`);
    setMonthModalOpen(false);
    setMonthError(null);
  };

  const periodLabel = data
    ? `${dateLabel(data.period.start_date)} — ${dateLabel(data.period.end_date)}`
    : mode === "month" ? "Mês selecionado" : "Período personalizado";
  const typeData = data?.sales_by_product_type.map((item) => ({ ...item, value: Number(item.revenue) })) ?? [];
  const sellerData = data?.top_sellers.map((item) => ({ ...item, value: Number(item.revenue) })) ?? [];
  const productComparisonData = useMemo(() => {
    const products = new Map<number | string, { name: string; revenue: number; profit: number }>();
    for (const product of [...(data?.top_products_by_revenue ?? []), ...(data?.top_products_by_profit ?? [])]) {
      products.set(product.product_id ?? product.name, {
        name: product.name,
        revenue: Number(product.revenue),
        profit: Number(product.profit),
      });
    }
    return Array.from(products.values()).slice(0, 8);
  }, [data]);
  const customerData = data?.top_customers ?? [];
  const maxCustomerSpend = Math.max(...customerData.map((customer) => Number(customer.amount_spent)), 1);
  const summary = data?.summary;

  const summaryCards = [
    { label: "Total vendido", value: money(summary?.total_revenue ?? 0), detail: `${summary?.items_sold ?? 0} itens vendidos`, icon: BadgeDollarSign, tone: "text-[#ead39e]" },
    { label: "Lucro líquido", value: money(summary?.total_profit ?? 0), detail: "Receita − custo − comissão", icon: TrendingUp, tone: "text-emerald-300" },
    { label: "Comissão paga", value: money(summary?.total_commission ?? 0), detail: "Somente vendas com comissão", icon: Coins, tone: "text-sky-200" },
    { label: "Custo dos produtos", value: money(summary?.total_cost ?? 0), detail: `${summary?.sales_count ?? 0} vendas registradas`, icon: ReceiptText, tone: "text-white" },
  ];

  return (
    <DashboardShell activeTab="products" profilePic={profilePic} userRole={userRole} desktopVariant="luxury">
      <div className="sales-dashboard flex flex-col gap-5 pb-36 [font-family:var(--font-dashboard-body)] lg:pb-8">
        <section className="rounded-[24px] border border-white/8 bg-white/[0.025] p-3 lg:p-4">
          <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/[0.06] px-1 pb-3">
            <button type="button" onClick={() => router.push("/dashboard/produtos/vendas")} className="inline-flex items-center gap-2 text-xs font-medium text-white/48 transition hover:text-white" aria-label="Voltar às vendas">
              <ArrowLeft className="h-4 w-4" /> Vendas registradas
            </button>
            <span className="inline-flex items-center gap-2 text-[11px] text-white/40">
              <CalendarDays className="h-3.5 w-3.5 text-[#d8b873]/75" /> {periodLabel}
            </span>
          </div>
          <div className="lg:flex lg:items-end lg:justify-between lg:gap-4">
            <div className="flex rounded-[16px] bg-black/25 p-1">
              {(["month", "range"] as const).map((item) => (
                <button key={item} type="button" onClick={() => setMode(item)} className={`flex-1 rounded-[12px] px-5 py-2 text-xs font-semibold transition lg:flex-none ${mode === item ? "bg-white text-black" : "text-white/50 hover:text-white"}`}>
                  {item === "month" ? "Por mês" : "Por período"}
                </button>
              ))}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto] lg:mt-0 lg:flex lg:items-end">
            {mode === "month" ? (
              <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">Mês
                <button type="button" onClick={openMonthSelector} className="mt-1 flex h-11 w-full items-center justify-between gap-3 rounded-[15px] border border-white/10 bg-[#0b0b0b] px-3 text-left text-sm font-medium normal-case tracking-normal text-white outline-none transition hover:border-white/20 focus:border-[#d8b873]/60 lg:w-48" aria-label="Selecionar mês e ano">
                  <span className="capitalize">{getMonthLabel(month)}</span>
                  <CalendarDays className="h-4 w-4 shrink-0 text-[#d8b873]/75" />
                </button>
              </label>
            ) : (
              <>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">Início
                  <input type="date" value={startDate} max={endDate} onChange={(event) => setStartDate(event.target.value)} className="mt-1 block h-11 w-full rounded-[15px] border border-white/10 bg-[#0b0b0b] px-3 text-sm text-white outline-none focus:border-[#d8b873]/60 lg:w-44" />
                </label>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">Fim
                  <input type="date" value={endDate} min={startDate} onChange={(event) => setEndDate(event.target.value)} className="mt-1 block h-11 w-full rounded-[15px] border border-white/10 bg-[#0b0b0b] px-3 text-sm text-white outline-none focus:border-[#d8b873]/60 lg:w-44" />
                </label>
              </>
            )}
            <button type="button" onClick={() => void refresh()} disabled={loading} className="flex h-11 items-center justify-center gap-2 self-end rounded-[15px] border border-white/10 px-4 text-xs font-semibold text-white/65 transition hover:border-white/25 hover:text-white disabled:opacity-50">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Atualizar
            </button>
            </div>
          </div>
        </section>

        {error ? <FeedbackBanner type="error" message={error} /> : null}

        <MonthSelectorModal
          open={monthModalOpen}
          yearValue={monthYearInput}
          monthValue={monthValueInput}
          years={years}
          error={monthError}
          onClose={() => setMonthModalOpen(false)}
          onApply={applyMonth}
          onYearChange={setMonthYearInput}
          onMonthChange={setMonthValueInput}
        />

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {summaryCards.map(({ label, value, detail, icon: Icon, tone }, index) => (
            <article key={label} className="relative overflow-hidden rounded-[26px] border border-white/8 bg-[linear-gradient(155deg,rgba(255,255,255,0.055),rgba(255,255,255,0.015))] p-4 shadow-card lg:p-5" style={{ animationDelay: `${index * 55}ms` }}>
              <div className="flex items-start justify-between gap-3"><p className="text-[10px] font-semibold uppercase tracking-[0.19em] text-white/38">{label}</p><Icon className="h-4 w-4 text-white/28" /></div>
              <p className={`mt-5 text-xl font-semibold tracking-tight sm:text-2xl xl:text-3xl ${tone}`}>{loading ? "—" : value}</p>
              <p className="mt-2 text-[11px] text-white/38">{detail}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-[30px] border border-white/8 bg-[linear-gradient(160deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] p-5 shadow-card lg:p-6">
            <div className="flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d8b873]/70">Composição</p><h2 className="mt-2 text-xl font-semibold">Vendas por tipo</h2></div><Boxes className="h-5 w-5 text-white/25" /></div>
            {typeData.length === 0 && !loading ? <div className="mt-5"><EmptyBlock>Nenhuma venda no período selecionado.</EmptyBlock></div> : (
              <div className="mt-3 grid items-center gap-3 sm:grid-cols-[minmax(0,1fr)_210px]">
                <div className="h-64"><ChartResponsiveContainer><PieChart><Pie data={typeData} dataKey="value" nameKey="label" innerRadius={58} outerRadius={90} paddingAngle={4}>{typeData.map((item, index) => <Cell key={item.type} fill={chartColors[index % chartColors.length]} />)}</Pie><Tooltip formatter={(value: number) => money(value)} contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 14, color: "#fff" }} labelStyle={{ color: "#fff" }} itemStyle={{ color: "#fff" }} /></PieChart></ChartResponsiveContainer></div>
                <div className="space-y-3">{typeData.map((item, index) => <div key={`legend-${item.type}`} className="flex items-center justify-between gap-3 text-xs"><span className="flex min-w-0 items-center gap-2 text-white/55"><i className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} /><span className="truncate">{item.label}</span></span><strong className="text-white/85">{money(item.revenue)}</strong></div>)}</div>
              </div>
            )}
          </article>

          <article className="rounded-[30px] border border-white/8 bg-[linear-gradient(160deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] p-5 shadow-card lg:p-6">
            <div className="flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d8b873]/70">Equipe</p><h2 className="mt-2 text-xl font-semibold">Quem mais vendeu</h2></div><UsersRound className="h-5 w-5 text-white/25" /></div>
            {sellerData.length === 0 && !loading ? <div className="mt-5"><EmptyBlock>Nenhum vendedor no período selecionado.</EmptyBlock></div> : (
              <div className="mt-6 h-72"><ChartResponsiveContainer><BarChart data={sellerData} layout="vertical" margin={{ left: 4, right: 12 }}><CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} /><XAxis type="number" hide /><YAxis type="category" dataKey="name" width={92} tick={{ fill: "rgba(255,255,255,.55)", fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip formatter={(value: number) => money(value)} cursor={{ fill: "rgba(255,255,255,.03)" }} contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 14, color: "#fff" }} labelStyle={{ color: "#fff" }} itemStyle={{ color: "#fff" }} /><Bar dataKey="value" radius={[0, 7, 7, 0]} barSize={15}>{sellerData.map((seller, index) => <Cell key={`seller-${seller.user_id ?? seller.name}`} fill={chartColors[index % chartColors.length]} />)}</Bar></BarChart></ChartResponsiveContainer></div>
            )}
          </article>
        </section>

        <section className="rounded-[30px] border border-white/8 bg-[linear-gradient(160deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))] p-5 shadow-card lg:p-6">
          <div className="flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-violet-200/55">Desempenho dos produtos</p><h2 className="mt-2 text-xl font-semibold text-white">Faturamento e lucro</h2></div><Trophy className="h-5 w-5 text-white/25" /></div>
          {productComparisonData.length === 0 && !loading ? <div className="mt-5"><EmptyBlock>Nenhum produto vendido no período.</EmptyBlock></div> : (
            <div className="mt-5 h-80"><ChartResponsiveContainer><BarChart data={productComparisonData} layout="vertical" margin={{ left: 8, right: 18 }}><CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} /><XAxis type="number" hide /><YAxis type="category" dataKey="name" width={110} tick={{ fill: "rgba(255,255,255,.58)", fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip formatter={(value: number, name: string) => [money(value), name === "revenue" ? "Faturamento" : "Lucro"]} cursor={{ fill: "rgba(255,255,255,.03)" }} contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 14 }} /><Legend formatter={(value) => value === "revenue" ? "Faturamento" : "Lucro"} wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,.6)" }} /><Bar dataKey="revenue" fill="#38bdf8" radius={[0, 6, 6, 0]} barSize={11} /><Bar dataKey="profit" fill="#34d399" radius={[0, 6, 6, 0]} barSize={11} /></BarChart></ChartResponsiveContainer></div>
          )}
        </section>

        <section className="rounded-[30px] border border-white/8 bg-[linear-gradient(160deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] p-5 shadow-card lg:p-6">
          <div className="flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-rose-200/55">Clientes</p><h2 className="mt-2 text-xl font-semibold">Quem mais comprou</h2><p className="mt-1 text-xs text-white/38">Quantidade de transações, itens e valor gasto.</p></div><Crown className="h-5 w-5 text-white/25" /></div>
          {customerData.length === 0 && !loading ? <div className="mt-5"><EmptyBlock>Nenhuma venda com cliente identificado no período.</EmptyBlock></div> : (
            <div className="mt-6 overflow-x-auto"><div className="min-w-[620px]"><div className="grid grid-cols-[minmax(180px,1fr)_90px_80px_130px] gap-4 border-b border-white/7 px-3 pb-3 text-[10px] font-medium uppercase tracking-[0.16em] text-white/30"><span>Cliente</span><span className="text-center">Transações</span><span className="text-center">Itens</span><span className="text-right">Valor gasto</span></div><ol>{customerData.map((customer, index) => <li key={customer.customer_id} className="relative grid grid-cols-[minmax(180px,1fr)_90px_80px_130px] items-center gap-4 border-b border-white/[0.045] px-3 py-4"><div className="relative z-10 flex min-w-0 items-center gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-black" style={{ backgroundColor: chartColors[index % chartColors.length] }}>{index + 1}</span><span className="truncate text-sm font-medium text-white/82">{customer.name}</span></div><span className="relative z-10 text-center text-sm tabular-nums text-white/62">{customer.transactions_count}</span><span className="relative z-10 text-center text-sm tabular-nums text-white/62">{customer.items_bought}</span><strong className="relative z-10 text-right text-sm text-white">{money(customer.amount_spent)}</strong><span className="absolute inset-y-2 left-0 rounded-r-lg opacity-[0.07]" style={{ width: `${Math.max((Number(customer.amount_spent) / maxCustomerSpend) * 100, 2)}%`, backgroundColor: chartColors[index % chartColors.length] }} /></li>)}</ol></div></div>
          )}
        </section>

        {data ? <ProductSalesHeatmap startDate={data.period.start_date} endDate={data.period.end_date} entries={data.sales_by_day_hour} /> : null}

        <section className="overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(160deg,rgba(255,255,255,0.045),rgba(255,255,255,0.012))] shadow-card">
          <div className="flex items-center justify-between border-b border-white/7 p-5 lg:p-6"><div><p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d8b873]/70">Detalhamento</p><h2 className="mt-2 text-xl font-semibold">Lucro por produto</h2></div><PackageCheck className="h-5 w-5 text-white/25" /></div>
          {!loading && (data?.products.length ?? 0) === 0 ? <div className="p-5"><EmptyBlock>Nenhum produto para detalhar.</EmptyBlock></div> : (
            <div className="overflow-x-auto [content-visibility:auto]"><table className="w-full min-w-[820px] text-left text-sm"><thead><tr className="border-b border-white/7 text-[10px] uppercase tracking-[0.16em] text-white/35"><th className="px-6 py-4 font-medium">Produto</th><th className="px-4 py-4 font-medium">Qtd.</th><th className="px-4 py-4 font-medium">Faturamento</th><th className="px-4 py-4 font-medium">Custo</th><th className="px-4 py-4 font-medium">Comissão</th><th className="px-6 py-4 text-right font-medium">Lucro</th></tr></thead><tbody>{data?.products.map((product) => <tr key={product.product_id ?? product.name} className="border-b border-white/[0.045] transition hover:bg-white/[0.025]"><td className="px-6 py-4"><p className="font-medium text-white/88">{product.name}</p><p className="mt-1 text-xs text-white/35">{product.type_label}</p></td><td className="px-4 py-4 text-white/55">{product.quantity}</td><td className="px-4 py-4 text-white/75">{money(product.revenue)}</td><td className="px-4 py-4 text-white/55">{money(product.cost)}</td><td className="px-4 py-4 text-white/55">{money(product.commission)}</td><td className="px-6 py-4 text-right font-semibold text-emerald-300">{money(product.profit)}</td></tr>)}</tbody></table></div>
          )}
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 px-1 text-[11px] text-white/30"><span className="inline-flex items-center gap-2"><Medal className="h-3.5 w-3.5" /> Lucro = faturamento − custo − comissão</span><span className="inline-flex items-center gap-2"><Trophy className="h-3.5 w-3.5" /> {summary?.sales_count ?? 0} vendas analisadas</span></footer>
      </div>
    </DashboardShell>
  );
}
