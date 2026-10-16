"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Landmark,
  PackageCheck,
  ReceiptText,
  RefreshCw,
  Scissors,
  TrendingUp,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";

import { FeedbackBanner } from "@/components/ui/FeedbackBanner";
import { DashboardShell } from "@/src/features/dashboard/components/DashboardShell";
import { MonthSelectorModal } from "@/src/features/finances/components/MonthSelectorModal";
import { useFinancialDashboard } from "@/src/features/finances/hooks/useFinancialDashboard";
import { formatMonthParam, getMonthLabel } from "@/src/features/finances/utils/finances";
import { ChartResponsiveContainer } from "@/src/features/shared/components/ChartResponsiveContainer";
import { useAuth } from "@/src/features/shared/hooks/useAuth";
import { formatCurrency } from "@/src/features/shared/utils/money";

const money = (value: string | number) => formatCurrency(String(value));

export function FinancialDashboardPage() {
  const router = useRouter();
  const { accessToken, fetchWithAuth, profilePic, userRole } = useAuth();
  const [month, setMonth] = useState(() => formatMonthParam(new Date()));
  const [monthModalOpen, setMonthModalOpen] = useState(false);
  const [yearInput, setYearInput] = useState(() => month.slice(0, 4));
  const [monthInput, setMonthInput] = useState(() => month.slice(5, 7));
  const [monthError, setMonthError] = useState<string | null>(null);
  const { data, loading, error, refresh } = useFinancialDashboard({
    accessToken,
    fetchWithAuth,
    month,
    enabled: userRole === "admin",
  });

  useEffect(() => {
    if (userRole && userRole !== "admin") router.replace("/dashboard");
  }, [router, userRole]);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 8 }, (_, index) => String(currentYear + 1 - index));
  }, []);

  const openMonthSelector = () => {
    setYearInput(month.slice(0, 4));
    setMonthInput(month.slice(5, 7));
    setMonthError(null);
    setMonthModalOpen(true);
  };

  const applyMonth = () => {
    if (yearInput.length !== 4 || !monthInput) {
      setMonthError("Selecione o mês e o ano.");
      return;
    }
    setMonth(`${yearInput}-${monthInput}`);
    setMonthModalOpen(false);
  };

  const summary = data?.summary;
  const headlineCards = [
    { label: "Faturamento geral", value: summary?.total_revenue ?? "0", detail: "Serviços + produtos", icon: Landmark, tone: "text-[#ead39e]" },
    { label: "Custos operacionais", value: summary?.operating_cost ?? "0", detail: "Contas, repasses e ajuda", icon: ReceiptText, tone: "text-rose-200" },
    { label: "Lucro geral", value: summary?.total_profit ?? "0", detail: `${Number(summary?.profit_margin ?? 0).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% de margem`, icon: TrendingUp, tone: Number(summary?.total_profit ?? 0) >= 0 ? "text-emerald-300" : "text-rose-300" },
    { label: "Custo dos produtos", value: summary?.product_cost ?? "0", detail: "Aquisição do estoque vendido", icon: WalletCards, tone: "text-sky-200" },
  ];
  const profitCards = [
    { label: "Serviços", revenue: summary?.service_revenue ?? "0", profit: summary?.service_profit ?? "0", icon: Scissors, note: "Após repasse de serviços" },
    { label: "Produtos", revenue: summary?.product_revenue ?? "0", profit: summary?.product_profit ?? "0", icon: PackageCheck, note: "Após estoque e repasse" },
  ];
  const costs = data?.costs;
  const costItems = [
    { label: "Contas", value: costs?.bills ?? "0", color: "#fb7185" },
    { label: "Repasses de serviços", value: costs?.service_repasses ?? "0", color: "#38bdf8" },
    { label: "Repasses de produtos", value: costs?.product_repasses ?? "0", color: "#a78bfa" },
    { label: "Ajuda de custo", value: costs?.allowances ?? "0", color: "#fbbf24" },
    { label: "Gorjetas", value: costs?.tips ?? "0", color: "#f472b6" },
    { label: "Custo dos produtos", value: costs?.product_cost ?? "0", color: "#34d399" },
  ];
  const maxCost = Math.max(...costItems.map((item) => Number(item.value)), 1);
  const professionalChart = data?.professionals.map((item) => ({
    ...item,
    services: Number(item.service_revenue),
    products: Number(item.product_revenue),
  })) ?? [];

  if (userRole && userRole !== "admin") return null;

  return (
    <DashboardShell activeTab="finances" profilePic={profilePic} userRole={userRole} desktopVariant="luxury">
      <div className="flex flex-col gap-5 pb-24">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => router.push("/dashboard/financeiro")} className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 text-white/65 transition hover:border-white/25 hover:text-white" aria-label="Voltar ao financeiro">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">Financeiro</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">Dashboard financeiro</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={openMonthSelector} className="flex h-10 items-center gap-2 rounded-2xl border border-white/10 px-3 text-sm text-white/70 transition hover:border-white/25 hover:text-white">
              <CalendarDays className="h-4 w-4 text-[#d8b873]" />
              <span className="capitalize">{getMonthLabel(month)}</span>
            </button>
            <button type="button" onClick={() => void refresh()} disabled={loading} className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 text-white/60 transition hover:border-white/25 hover:text-white disabled:opacity-40" aria-label="Atualizar dashboard">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </header>

        {error ? <FeedbackBanner type="error" message={error} /> : null}

        <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {headlineCards.map(({ label, value, detail, icon: Icon, tone }) => (
            <article key={label} className="rounded-[24px] border border-white/8 bg-[linear-gradient(155deg,rgba(255,255,255,0.052),rgba(255,255,255,0.014))] p-4 shadow-card lg:p-5">
              <div className="flex items-center justify-between gap-3"><p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-white/38">{label}</p><Icon className="h-4 w-4 text-white/25" /></div>
              <p className={`mt-5 text-xl font-semibold tracking-tight lg:text-2xl ${tone}`}>{loading ? "—" : money(value)}</p>
              <p className="mt-2 text-[11px] text-white/38">{detail}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          {profitCards.map(({ label, revenue, profit, icon: Icon, note }) => (
            <article key={label} className="rounded-[28px] border border-white/8 bg-white/[0.025] p-5">
              <div className="flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">Resultado por origem</p><h2 className="mt-2 text-lg font-semibold">{label}</h2></div><Icon className="h-5 w-5 text-white/25" /></div>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div><p className="text-xs text-white/38">Faturamento</p><p className="mt-1 text-xl font-semibold text-white">{loading ? "—" : money(revenue)}</p></div>
                <div className="border-l border-white/8 pl-4"><p className="text-xs text-white/38">Lucro</p><p className={`mt-1 text-xl font-semibold ${Number(profit) >= 0 ? "text-emerald-300" : "text-rose-300"}`}>{loading ? "—" : money(profit)}</p></div>
              </div>
              <p className="mt-4 text-[11px] text-white/32">{note}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
          <article className="rounded-[28px] border border-white/8 bg-[linear-gradient(160deg,rgba(255,255,255,0.045),rgba(255,255,255,0.012))] p-5 lg:p-6">
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-200/55">Custos</p><h2 className="mt-2 text-lg font-semibold">Composição do período</h2></div>
            <div className="mt-6 space-y-4">
              {costItems.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between gap-3 text-xs"><span className="text-white/55">{item.label}</span><strong className="text-white/85">{loading ? "—" : money(item.value)}</strong></div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.05]"><div className="h-full rounded-full" style={{ width: `${Math.max(Number(item.value) / maxCost * 100, Number(item.value) ? 2 : 0)}%`, backgroundColor: item.color }} /></div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[28px] border border-white/8 bg-[linear-gradient(160deg,rgba(255,255,255,0.045),rgba(255,255,255,0.012))] p-5 lg:p-6">
            <div className="flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-200/55">Equipe</p><h2 className="mt-2 text-lg font-semibold">Faturamento por barbeiro</h2></div><UsersRound className="h-5 w-5 text-white/25" /></div>
            {!loading && professionalChart.length === 0 ? <div className="mt-6 flex h-64 items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-white/40">Nenhum faturamento no período.</div> : (
              <div className="mt-4 h-72"><ChartResponsiveContainer><BarChart data={professionalChart} layout="vertical" margin={{ left: 10, right: 12 }}><CartesianGrid stroke="rgba(255,255,255,.05)" horizontal={false} /><XAxis type="number" hide /><YAxis type="category" dataKey="name" width={105} tick={{ fill: "rgba(255,255,255,.58)", fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip formatter={(value: number, name: string) => [money(value), name === "services" ? "Serviços" : "Produtos"]} contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 14, color: "#fff" }} labelStyle={{ color: "#fff" }} itemStyle={{ color: "#fff" }} cursor={{ fill: "rgba(255,255,255,.025)" }} /><Legend formatter={(value) => value === "services" ? "Serviços" : "Produtos"} wrapperStyle={{ color: "rgba(255,255,255,.65)", fontSize: 12 }} /><Bar dataKey="services" stackId="revenue" fill="#38bdf8" radius={[6, 0, 0, 6]} barSize={18} /><Bar dataKey="products" stackId="revenue" fill="#a78bfa" radius={[0, 6, 6, 0]} barSize={18} /></BarChart></ChartResponsiveContainer></div>
            )}
          </article>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-white/8 bg-white/[0.02]">
          <div className="border-b border-white/7 px-5 py-4"><h2 className="text-lg font-semibold">Resultado por barbeiro</h2><p className="mt-1 text-xs text-white/38">Lucro de contribuição sem rateio das contas gerais.</p></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead><tr className="border-b border-white/7 text-[10px] uppercase tracking-[0.14em] text-white/32"><th className="px-5 py-3 font-medium">Profissional</th><th className="px-4 py-3 font-medium">Serviços</th><th className="px-4 py-3 font-medium">Produtos</th><th className="px-4 py-3 font-medium">Custo prod.</th><th className="px-4 py-3 font-medium">Repasses + gorjetas</th><th className="px-4 py-3 font-medium">Ajuda</th><th className="px-5 py-3 text-right font-medium">Contribuição</th></tr></thead><tbody>{data?.professionals.map((professional) => <tr key={professional.professional_id} className="border-b border-white/[0.045] transition hover:bg-white/[0.025]"><td className="px-5 py-4 font-medium text-white/85">{professional.name}</td><td className="px-4 py-4 text-white/62">{money(professional.service_revenue)}</td><td className="px-4 py-4 text-white/62">{money(professional.product_revenue)}</td><td className="px-4 py-4 text-white/62">{money(professional.product_cost)}</td><td className="px-4 py-4 text-white/62">{money(professional.repasses)}</td><td className="px-4 py-4 text-white/62">{money(professional.allowance)}</td><td className={`px-5 py-4 text-right font-semibold ${Number(professional.contribution_profit) >= 0 ? "text-emerald-300" : "text-rose-300"}`}>{money(professional.contribution_profit)}</td></tr>)}</tbody></table></div>
        </section>

        <p className="px-1 text-[11px] leading-relaxed text-white/30">Lucro geral = faturamento de serviços e produtos − contas − repasses − ajuda de custo − gorjetas − custo dos produtos vendidos.</p>

        <MonthSelectorModal open={monthModalOpen} yearValue={yearInput} monthValue={monthInput} years={years} error={monthError} onClose={() => setMonthModalOpen(false)} onApply={applyMonth} onYearChange={setYearInput} onMonthChange={setMonthInput} />
      </div>
    </DashboardShell>
  );
}
