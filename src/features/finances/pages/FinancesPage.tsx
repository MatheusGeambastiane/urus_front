"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, FileText, Plus } from "lucide-react";
import { DashboardShell } from "@/src/features/dashboard/components/DashboardShell";
import { useAuth } from "@/src/features/shared/hooks/useAuth";
import { useFinanceSummary } from "@/src/features/finances/hooks/useFinanceSummary";
import { useBills } from "@/src/features/finances/hooks/useBills";
import { useRepasses } from "@/src/features/finances/hooks/useRepasses";
import { FinanceSummaryCards } from "@/src/features/finances/components/FinanceSummaryCards";
import { RepasseList } from "@/src/features/finances/components/RepasseList";
import { BillList } from "@/src/features/finances/components/BillList";
import { MonthSelectorModal } from "@/src/features/finances/components/MonthSelectorModal";
import { PaymentDistributionCard } from "@/src/features/finances/components/PaymentDistributionCard";
import { ResourceDistributionChart } from "@/src/features/finances/components/ResourceDistributionChart";
import { FabMenu } from "@/components/ui/FabMenu";
import { formatMonthParam, getMonthLabel, getPaymentTypeLabel, pieChartColors } from "@/src/features/finances/utils/finances";
import { FeedbackBanner } from "@/components/ui/FeedbackBanner";
import { getSellPaymentLabel } from "@/src/features/products/utils/products";
import { capitalizeFirstLetter } from "@/src/features/shared/utils/string";
import { formatCurrency } from "@/src/features/shared/utils/money";

type Props = { firstName: string };

export function FinancesPage({ firstName }: Props) {
  void firstName;
  const router = useRouter();
  const { accessToken, fetchWithAuth, profilePic, userRole } = useAuth();
  const [month, setMonth] = useState(formatMonthParam(new Date()));
  const [monthModalOpen, setMonthModalOpen] = useState(false);
  const [monthYearInput, setMonthYearInput] = useState(month.slice(0, 4));
  const [monthValueInput, setMonthValueInput] = useState(month.slice(5, 7));
  const [monthError, setMonthError] = useState<string | null>(null);
  const [showFabOptions, setShowFabOptions] = useState(false);
  const [showAllBills, setShowAllBills] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const finance = useFinanceSummary({ accessToken, fetchWithAuth, month });
  const bills = useBills({ accessToken, fetchWithAuth, month });
  const repasses = useRepasses({ accessToken, fetchWithAuth, month, userRole });
  const appointmentPaymentData =
    finance.summary?.appointments_by_payment_type?.map((entry) => ({
      name: getPaymentTypeLabel(entry.payment_type as never),
      raw: entry.payment_type,
      value: entry.total,
    })) ?? [];
  const sellPaymentData =
    finance.summary?.sell_by_payment_type?.map((entry) => ({
      name: getSellPaymentLabel(entry.transaction_payment),
      raw: entry.transaction_payment,
      value: entry.total,
    })) ?? [];
  const paymentResourceData =
    finance.summary?.payment_transactions_by_resource?.map((entry, index) => ({
      key: entry.money_resource ?? `resource-${index}`,
      label: entry.money_resource ? capitalizeFirstLetter(entry.money_resource) : "Sem origem",
      total: Number(entry.total ?? 0),
      count: Number(entry.count ?? 0),
      color: pieChartColors[index % pieChartColors.length],
    })) ?? [];
  const averageAppointmentsPerDayValue = Number(finance.summary?.appointments_average_per_day ?? 0);
  const averageAppointmentsPerDay = Number.isFinite(averageAppointmentsPerDayValue)
    ? averageAppointmentsPerDayValue
    : 0;
  const appointmentTicketAverage = finance.summary?.appointments_ticket_average ?? "0";
  const monthlyTicketAverage = finance.summary?.appointments_sell_ticket_average ?? "0";
  const expenseReferenceLabel = `${month.slice(5, 7)}-${month.slice(0, 4)}`;

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, index) => String(currentYear + 1 - index));
  }, []);

  const applyMonth = () => {
    if (!monthYearInput || monthYearInput.length !== 4) {
      setMonthError("Informe o ano no formato YYYY.");
      return;
    }
    if (!monthValueInput) {
      setMonthError("Selecione o mês.");
      return;
    }
    setMonth(`${monthYearInput}-${monthValueInput}`);
    setMonthModalOpen(false);
    setMonthError(null);
  };

  const handleGenerateReport = async () => {
    try {
      const url = await finance.generateMonthlyReport();
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Erro ao gerar relatório." });
    }
  };

  return (
    <DashboardShell activeTab="finances" profilePic={profilePic} userRole={userRole}>
      <div className="flex flex-col gap-5 pb-40">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-white/35">Financeiro</p>
            <p className="mt-2 text-[2rem] font-medium tracking-tight text-white">{getMonthLabel(month)}</p>
          </div>
          <button
            type="button"
            onClick={() => setMonthModalOpen(true)}
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 p-2 text-white/80"
            aria-label="Selecionar mês"
          >
            <Calendar className="h-5 w-5" />
          </button>
        </header>

        {feedback ? <FeedbackBanner message={feedback.message} type={feedback.type} /> : null}
        {finance.error ? <FeedbackBanner message={finance.error} type="error" /> : null}
        {bills.error ? <FeedbackBanner message={bills.error} type="error" /> : null}
        {repasses.error ? <FeedbackBanner message={repasses.error} type="error" /> : null}

        <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_32%),linear-gradient(180deg,#0b0b0b,#060606)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-white/[0.03] blur-3xl" />
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/45">Panorama do mês</p>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-lg font-medium text-white/35">R$</span>
                <span className="text-4xl font-medium tracking-tight text-emerald-300 sm:text-5xl">
                  {formatCurrency(finance.summary?.revenue ?? "0").replace(/^R\$\s?/, "")}
                </span>
              </div>
              <p className="mt-3 text-sm text-white/72">
                Despesa em {expenseReferenceLabel}:{" "}
                <span className="text-rose-300">
                  {formatCurrency(finance.summary?.expenses ?? "0")}
                </span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                type="button"
                onClick={handleGenerateReport}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/75 transition hover:border-white/25 hover:bg-white/[0.07]"
              >
                <FileText className="h-3.5 w-3.5" />
                {finance.reportLoading ? "Gerando..." : "Relatório"}
              </button>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-medium text-white/55">
                {finance.summary?.appointments_count ?? 0} serviços
              </span>
            </div>
          </div>
        </section>

        <FinanceSummaryCards summary={finance.summary} />

        <section className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 shadow-card text-white">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/40">Médias</p>
            <p className="mt-1 text-lg font-semibold">Indicadores do período</p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/15 p-3 sm:p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">Ticket médio</p>
              <p className="mt-2 text-base font-semibold text-white sm:text-lg">
                {formatCurrency(appointmentTicketAverage)}
              </p>
              <p className="mt-1 text-xs text-white/55">Somente atendimentos</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/15 p-3 sm:p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">Ticket total</p>
              <p className="mt-2 text-base font-semibold text-white sm:text-lg">
                {formatCurrency(monthlyTicketAverage)}
              </p>
              <p className="mt-1 text-xs text-white/55">Atendimentos e vendas</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/15 p-3 sm:p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">Média diária</p>
              <p className="mt-2 text-base font-semibold text-white sm:text-lg">
                {averageAppointmentsPerDay.toFixed(2).replace(".", ",")}
              </p>
              <p className="mt-1 text-xs text-white/55">Atendimentos por dia</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <PaymentDistributionCard
              title="Pagamentos dos serviços"
              subtitle="Distribuição por forma"
              data={appointmentPaymentData}
            />
            <PaymentDistributionCard
              title="Pagamentos das vendas"
              subtitle="Distribuição por forma"
              data={sellPaymentData}
            />
          </div>
        </section>

        <RepasseList
          repasses={repasses.repasses}
          recalculating={repasses.recalculating}
          onRecalculate={async () => {
            try {
              await repasses.recalculate();
              setFeedback({ type: "success", message: "Repasses atualizados com sucesso." });
            } catch (err) {
              setFeedback({ type: "error", message: err instanceof Error ? err.message : "Erro ao recalcular repasses." });
            }
          }}
          onRepasseClick={(id) => router.push(`/dashboard/financeiro/repasses/${id}`)}
        />

        <BillList
          bills={bills.bills}
          showAll={showAllBills}
          onToggleShowAll={() => setShowAllBills((previous) => !previous)}
          onBillClick={(id) => router.push(`/dashboard/financeiro/contas/${id}`)}
        />

        <ResourceDistributionChart items={paymentResourceData} />

        <FabMenu
          open={showFabOptions}
          onToggle={() => setShowFabOptions((previous) => !previous)}
          options={[
            { label: finance.reportLoading ? "Gerando..." : "Gerar relatório", icon: FileText, onClick: handleGenerateReport },
            { label: "Criar conta", icon: Plus, onClick: () => router.push("/dashboard/financeiro/contas/nova") },
          ]}
        />

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
      </div>
    </DashboardShell>
  );
}
