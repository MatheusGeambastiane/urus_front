"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Save,
  Scissors,
  ShoppingBag,
  Target,
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react";

import { DashboardShell } from "@/src/features/dashboard/components/DashboardShell";
import { MonthSelectorModal } from "@/src/features/finances/components/MonthSelectorModal";
import { getMonthLabel } from "@/src/features/finances/utils/finances";
import { useGoals } from "@/src/features/goals/hooks/useGoals";
import type {
  GoalPace,
  GoalPeriodType,
  RepassProjection,
  RevenueProjection,
} from "@/src/features/goals/types";
import { FeedbackBanner } from "@/components/ui/FeedbackBanner";
import { useAuth } from "@/src/features/shared/hooks/useAuth";
import { formatCurrency } from "@/src/features/shared/utils/money";


const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const money = (value: string | number) => formatCurrency(String(value));
const percent = (value: string | number) => `${Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

function Surface({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[28px] border border-white/8 bg-[linear-gradient(150deg,rgba(255,255,255,0.052),rgba(255,255,255,0.012))] shadow-card ${className}`}>
      {children}
    </section>
  );
}

function Progress({ value }: { value: string }) {
  const numericValue = Math.max(0, Number(value) || 0);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[11px] text-white/42">
        <span>Progresso</span>
        <strong className="font-semibold text-white/78">{percent(numericValue)}</strong>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.055]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#d8b873,#f3dfad)] shadow-[0_0_18px_rgba(216,184,115,0.28)] transition-all duration-500"
          style={{ width: `${Math.min(100, numericValue)}%` }}
        />
      </div>
    </div>
  );
}

function PaceGrid({ pace }: { pace: GoalPace }) {
  const entries = [
    { label: "Por dia útil", value: pace.daily_required },
    { label: "Por semana", value: pace.weekly_required },
    { label: "Por mês", value: pace.monthly_required },
  ];
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {entries.map((entry) => (
        <div key={entry.label} className="rounded-[18px] border border-white/[0.07] bg-black/20 p-3">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/35">{entry.label}</p>
          <p className="mt-2 text-sm font-semibold tracking-tight text-white sm:text-base">{money(entry.value)}</p>
        </div>
      ))}
    </div>
  );
}

function SourceSplit({ services, sales }: { services: string; sales: string }) {
  const serviceValue = Number(services);
  const salesValue = Number(sales);
  const total = serviceValue + salesValue;
  const serviceWidth = total > 0 ? (serviceValue / total) * 100 : 100;
  return (
    <div className="rounded-[20px] border border-white/[0.07] bg-black/15 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.19em] text-white/38">Composição necessária</p>
        <span className="text-[10px] text-white/32">Base: últimos 3 meses</span>
      </div>
      <div className="flex h-2 overflow-hidden rounded-full bg-white/5">
        <span className="bg-sky-400" style={{ width: `${serviceWidth}%` }} />
        <span className="flex-1 bg-emerald-400" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-400/10 text-sky-300"><Scissors className="h-3.5 w-3.5" /></span>
          <div><p className="text-white/35">Serviços</p><strong className="text-white/80">{money(services)}</strong></div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300"><ShoppingBag className="h-3.5 w-3.5" /></span>
          <div><p className="text-white/35">Vendas</p><strong className="text-white/80">{money(sales)}</strong></div>
        </div>
      </div>
    </div>
  );
}

type GoalEditorProps = {
  label: string;
  initialValue: string;
  saving: boolean;
  onSave: (value: string) => void;
};

function GoalEditor({ label, initialValue, saving, onSave }: GoalEditorProps) {
  const [value, setValue] = useState(initialValue);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(value);
  };
  return (
    <form onSubmit={handleSubmit} className="rounded-[20px] border border-[#d8b873]/18 bg-[#d8b873]/[0.055] p-4">
      <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#e6ca8c]/65">{label}</label>
      <div className="mt-2 flex gap-2">
        <div className="flex h-11 min-w-0 flex-1 items-center rounded-[14px] border border-white/10 bg-[#090909] px-3 focus-within:border-[#d8b873]/55">
          <span className="mr-2 text-xs text-white/35">R$</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            required
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none"
            placeholder="0,00"
          />
        </div>
        <button type="submit" disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-[14px] bg-white px-4 text-xs font-semibold text-black transition hover:bg-[#ead39e] disabled:opacity-55">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar
        </button>
      </div>
    </form>
  );
}

function VisibilitySwitch({ checked, disabled, onChange }: { checked: boolean; disabled: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div className={`flex items-center justify-between rounded-[18px] border border-white/[0.07] bg-black/15 px-4 py-3 ${disabled ? "opacity-45" : ""}`}>
      <div>
        <p className="text-xs font-semibold text-white/75">Exibir na página inicial</p>
        <p className="mt-0.5 text-[10px] text-white/32">Mostra o ritmo de hoje e da semana.</p>
      </div>
      <button type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)} className={`relative h-6 w-11 rounded-full border transition ${checked ? "border-[#d8b873]/60 bg-[#d8b873]" : "border-white/15 bg-white/[0.06]"} disabled:cursor-not-allowed`}>
        <span className={`absolute top-0.5 h-4.5 w-4.5 rounded-full shadow-sm transition ${checked ? "left-[21px] bg-black" : "left-0.5 bg-white/65"}`} />
      </button>
    </div>
  );
}

function RevenueGoalPanel({ projection }: { projection: RevenueProjection | null }) {
  if (!projection) {
    return <div className="rounded-[20px] border border-dashed border-white/10 px-5 py-7 text-center text-sm text-white/38">Defina uma meta para visualizar o ritmo necessário.</div>;
  }
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><p className="text-[10px] uppercase tracking-[0.17em] text-white/35">Realizado</p><p className="mt-2 text-xl font-semibold text-white">{money(projection.actual)}</p></div>
        <div className="text-right"><p className="text-[10px] uppercase tracking-[0.17em] text-white/35">Falta faturar</p><p className="mt-2 text-xl font-semibold text-[#ead39e]">{money(projection.pace.remaining)}</p></div>
      </div>
      <Progress value={projection.progress_percent} />
      <PaceGrid pace={projection.pace} />
      <SourceSplit services={projection.required_by_source.services} sales={projection.required_by_source.sales} />
    </div>
  );
}

function RepassGoalPanel({ projection }: { projection: RepassProjection | null }) {
  if (!projection) {
    return <div className="rounded-[20px] border border-dashed border-white/10 px-5 py-7 text-center text-sm text-white/38">Defina o repasse desejado para calcular o faturamento necessário.</div>;
  }
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><p className="text-[10px] uppercase tracking-[0.17em] text-white/35">Repasse acumulado</p><p className="mt-2 text-xl font-semibold text-white">{money(projection.actual_repass)}</p></div>
        <div className="text-right"><p className="text-[10px] uppercase tracking-[0.17em] text-white/35">Repasse restante</p><p className="mt-2 text-xl font-semibold text-[#ead39e]">{money(projection.remaining_repass)}</p></div>
      </div>
      <Progress value={projection.progress_percent} />
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-[18px] border border-white/[0.07] bg-black/20 p-3"><p className="text-[9px] uppercase tracking-[0.16em] text-white/35">Faturamento adicional</p><p className="mt-2 text-base font-semibold text-white">{money(projection.additional_revenue_needed)}</p></div>
        <div className="rounded-[18px] border border-white/[0.07] bg-black/20 p-3"><p className="text-[9px] uppercase tracking-[0.16em] text-white/35">Taxa efetiva de repasse</p><p className="mt-2 text-base font-semibold text-emerald-300">{percent(projection.effective_repass_rate)}</p></div>
      </div>
      <PaceGrid pace={projection.pace} />
      <SourceSplit services={projection.required_by_source.services} sales={projection.required_by_source.sales} />
    </div>
  );
}

export function GoalsPage() {
  const { accessToken, fetchWithAuth, profilePic, userRole } = useAuth();
  const [periodType, setPeriodType] = useState<GoalPeriodType>("monthly");
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(() => String(new Date().getFullYear()));
  const [monthModalOpen, setMonthModalOpen] = useState(false);
  const [monthYearInput, setMonthYearInput] = useState(() => currentMonth().slice(0, 4));
  const [monthValueInput, setMonthValueInput] = useState(() => currentMonth().slice(5, 7));
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const period = periodType === "monthly" ? month : year;
  const periodStart = periodType === "monthly" ? `${month}-01` : `${year}-01-01`;
  const { data, loading, saving, error, refresh, save } = useGoals({ accessToken, fetchWithAuth, periodType, period });
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 8 }, (_, index) => String(currentYear + 1 - index));
  }, []);
  const selectedProfessional = data?.professionals.find((item) => item.professional.id === selectedProfessionalId) ?? data?.professionals[0] ?? null;

  const persistGoal = async (goalType: "institution_revenue" | "professional_revenue" | "professional_repass", target: string, professional?: number, showOnHome?: boolean) => {
    setFeedback(null);
    try {
      await save({ goal_type: goalType, period_type: periodType, period_start: periodStart, target_amount: target, ...(professional ? { professional } : {}), ...(showOnHome !== undefined ? { show_on_home: showOnHome } : {}) });
      setFeedback({ type: "success", message: "Meta salva e projeções atualizadas." });
    } catch (saveError) {
      setFeedback({ type: "error", message: saveError instanceof Error ? saveError.message : "Não foi possível salvar a meta." });
    }
  };

  const applyMonth = () => {
    setMonth(`${monthYearInput}-${monthValueInput}`);
    setMonthModalOpen(false);
  };

  const openMonth = () => {
    setMonthYearInput(month.slice(0, 4));
    setMonthValueInput(month.slice(5, 7));
    setMonthModalOpen(true);
  };

  const periodLabel = periodType === "monthly" ? getMonthLabel(month) : `Ano de ${year}`;
  const isAdmin = userRole === "admin";

  return (
    <DashboardShell activeTab="goals" profilePic={profilePic} userRole={userRole} desktopVariant="luxury">
      <div className="flex flex-col gap-5 pb-32 [font-family:var(--font-dashboard-body)] lg:pb-8">
        <header className="rounded-[24px] border border-white/8 bg-white/[0.025] p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#d8b873]/10 text-[#e6ca8c]"><Target className="h-5 w-5" /></span>
              <div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">Objetivos</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">Metas</h1></div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex rounded-[15px] bg-black/25 p-1">
                {(["monthly", "annual"] as const).map((type) => (
                  <button key={type} type="button" onClick={() => setPeriodType(type)} className={`rounded-[11px] px-4 py-2 text-xs font-semibold transition ${periodType === type ? "bg-white text-black" : "text-white/45 hover:text-white"}`}>{type === "monthly" ? "Mensal" : "Anual"}</button>
                ))}
              </div>
              {periodType === "monthly" ? (
                <button type="button" onClick={openMonth} className="flex h-11 items-center justify-between gap-4 rounded-[15px] border border-white/10 bg-black/20 px-4 text-sm font-medium text-white transition hover:border-white/20"><span className="capitalize">{periodLabel}</span><CalendarDays className="h-4 w-4 text-[#d8b873]" /></button>
              ) : (
                <select value={year} onChange={(event) => setYear(event.target.value)} className="h-11 rounded-[15px] border border-white/10 bg-[#0b0b0b] px-4 text-sm font-medium text-white outline-none focus:border-[#d8b873]/60">{years.map((item) => <option key={item} value={item}>{item}</option>)}</select>
              )}
              <button type="button" onClick={() => void refresh()} disabled={loading} className="flex h-11 items-center justify-center rounded-[15px] border border-white/10 px-3 text-white/55 transition hover:text-white disabled:opacity-50" aria-label="Atualizar metas"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></button>
            </div>
          </div>
        </header>

        {feedback ? <FeedbackBanner type={feedback.type} message={feedback.message} /> : null}
        {error ? <FeedbackBanner type="error" message={error} /> : null}

        {loading && !data ? (
          <Surface className="flex min-h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#d8b873]" /></Surface>
        ) : null}

        {isAdmin && data?.institution ? (
          <Surface className="p-5 lg:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div><p className="text-[10px] font-semibold uppercase tracking-[0.21em] text-white/35">Instituição</p><h2 className="mt-2 text-xl font-semibold text-white">Meta geral de faturamento</h2></div>
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#d8b873]/10 text-[#e6ca8c]"><Building2 className="h-5 w-5" /></span>
            </div>
            <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
              <div className="space-y-3">
                <GoalEditor key={`institution-${periodType}-${period}-${data.institution.revenue_goal?.goal.id ?? "new"}`} label={`Meta ${periodType === "monthly" ? "do mês" : "do ano"}`} initialValue={data.institution.revenue_goal?.goal.target_amount ?? ""} saving={saving} onSave={(value) => void persistGoal("institution_revenue", value, undefined, data.institution?.revenue_goal?.goal.show_on_home)} />
                {periodType === "annual" ? <VisibilitySwitch checked={data.institution.revenue_goal?.goal.show_on_home ?? false} disabled={!data.institution.revenue_goal || saving} onChange={(checked) => void persistGoal("institution_revenue", data.institution?.revenue_goal?.goal.target_amount ?? "", undefined, checked)} /> : null}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-[18px] border border-white/[0.07] bg-black/20 p-3"><p className="text-[9px] uppercase tracking-[0.16em] text-white/35">Serviços realizados</p><p className="mt-2 font-semibold text-sky-300">{money(data.institution.actual.services)}</p></div>
                  <div className="rounded-[18px] border border-white/[0.07] bg-black/20 p-3"><p className="text-[9px] uppercase tracking-[0.16em] text-white/35">Vendas realizadas</p><p className="mt-2 font-semibold text-emerald-300">{money(data.institution.actual.sales)}</p></div>
                </div>
              </div>
              <RevenueGoalPanel projection={data.institution.revenue_goal} />
            </div>
          </Surface>
        ) : null}

        {data?.professionals.length ? (
          <Surface className="overflow-hidden">
            <div className="border-b border-white/[0.07] p-5 lg:flex lg:items-center lg:justify-between lg:px-6">
              <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-300">{isAdmin ? <UsersRound className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}</span><div><p className="text-[10px] uppercase tracking-[0.2em] text-white/35">{isAdmin ? "Equipe" : "Minha jornada"}</p><h2 className="mt-1 text-xl font-semibold">{isAdmin ? "Desempenho profissional" : "Meta de repasse"}</h2></div></div>
              {isAdmin ? <select value={selectedProfessional?.professional.id ?? ""} onChange={(event) => setSelectedProfessionalId(Number(event.target.value))} className="mt-4 h-11 w-full rounded-[15px] border border-white/10 bg-[#0b0b0b] px-4 text-sm text-white outline-none focus:border-[#d8b873]/60 lg:mt-0 lg:w-64">{data.professionals.map((item) => <option key={item.professional.id} value={item.professional.id}>{item.professional.name}</option>)}</select> : null}
            </div>
            {selectedProfessional ? (
              <div className="grid gap-5 p-5 lg:p-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                <div className="space-y-3">
                  <div className="rounded-[20px] border border-white/[0.07] bg-black/20 p-4">
                    <p className="text-lg font-semibold">{selectedProfessional.professional.name}</p>
                    <p className="mt-1 text-xs text-white/38">{selectedProfessional.professional.professional_type} · comissão de {selectedProfessional.professional.commission}%</p>
                    <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-4"><span className="text-xs text-white/38">Faturamento no período</span><strong>{money(selectedProfessional.actual.total_revenue)}</strong></div>
                  </div>
                  {isAdmin ? (
                    <GoalEditor key={`professional-${periodType}-${period}-${selectedProfessional.professional.id}-${selectedProfessional.revenue_goal?.goal.id ?? "new"}`} label="Meta de faturamento profissional" initialValue={selectedProfessional.revenue_goal?.goal.target_amount ?? ""} saving={saving} onSave={(value) => void persistGoal("professional_revenue", value, selectedProfessional.professional.id)} />
                  ) : (
                    <>
                      <GoalEditor key={`repass-${periodType}-${period}-${selectedProfessional.professional.id}-${selectedProfessional.repass_goal?.goal.id ?? "new"}`} label="Repasse que desejo alcançar" initialValue={selectedProfessional.repass_goal?.goal.target_amount ?? ""} saving={saving} onSave={(value) => void persistGoal("professional_repass", value, selectedProfessional.professional.id, selectedProfessional.repass_goal?.goal.show_on_home)} />
                      {periodType === "annual" ? <VisibilitySwitch checked={selectedProfessional.repass_goal?.goal.show_on_home ?? false} disabled={!selectedProfessional.repass_goal || saving} onChange={(checked) => void persistGoal("professional_repass", selectedProfessional.repass_goal?.goal.target_amount ?? "", selectedProfessional.professional.id, checked)} /> : null}
                    </>
                  )}
                  <div className="rounded-[18px] border border-white/[0.07] p-3 text-xs text-white/42"><div className="flex items-center gap-2"><ArrowUpRight className="h-4 w-4 text-[#d8b873]" /><span>Histórico: {percent(selectedProfessional.historical_mix.services_percent)} serviços e {percent(selectedProfessional.historical_mix.sales_percent)} vendas.</span></div></div>
                </div>
                <div>
                  {isAdmin ? <RevenueGoalPanel projection={selectedProfessional.revenue_goal} /> : <RepassGoalPanel projection={selectedProfessional.repass_goal} />}
                  {!isAdmin && selectedProfessional.revenue_goal ? (
                    <div className="mt-5 border-t border-white/[0.07] pt-5">
                      <div className="mb-4 flex items-center gap-2"><Target className="h-4 w-4 text-sky-300" /><h3 className="text-sm font-semibold text-white/80">Meta estabelecida pela gestão</h3></div>
                      <RevenueGoalPanel projection={selectedProfessional.revenue_goal} />
                    </div>
                  ) : null}
                  {isAdmin && selectedProfessional.repass_goal ? (
                    <div className="mt-4 rounded-[20px] border border-emerald-400/10 bg-emerald-400/[0.035] p-4">
                      <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-sm font-semibold"><WalletCards className="h-4 w-4 text-emerald-300" /> Meta pessoal de repasse</div><strong className="text-emerald-300">{money(selectedProfessional.repass_goal.goal.target_amount)}</strong></div>
                      <p className="mt-2 text-xs text-white/38">Faturamento adicional estimado: {money(selectedProfessional.repass_goal.additional_revenue_needed)}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </Surface>
        ) : null}

        {!loading && data && data.professionals.length === 0 && !isAdmin ? (
          <Surface className="p-8 text-center"><CheckCircle2 className="mx-auto h-7 w-7 text-white/30" /><p className="mt-3 text-sm text-white/45">Seu perfil profissional ainda não está disponível.</p></Surface>
        ) : null}

        <MonthSelectorModal open={monthModalOpen} yearValue={monthYearInput} monthValue={monthValueInput} years={years} error={null} onClose={() => setMonthModalOpen(false)} onApply={applyMonth} onYearChange={setMonthYearInput} onMonthChange={setMonthValueInput} />
      </div>
    </DashboardShell>
  );
}
