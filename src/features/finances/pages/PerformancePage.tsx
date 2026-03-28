"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import { DashboardShell } from "@/src/features/dashboard/components/DashboardShell";
import { useAuth } from "@/src/features/shared/hooks/useAuth";
import { useRepasses } from "@/src/features/finances/hooks/useRepasses";
import { MonthSelectorModal } from "@/src/features/finances/components/MonthSelectorModal";
import { RepasseAnalyticsPanel } from "@/src/features/finances/components/RepasseAnalyticsPanel";
import { RepasseInvoiceModal } from "@/src/features/finances/components/RepasseInvoiceModal";
import { formatMonthParam, getMonthLabel } from "@/src/features/finances/utils/finances";
import type { ProfessionalServiceSummary, RepasseDetail } from "@/src/features/repasses/types";

type Props = { firstName: string };

export function PerformancePage({ firstName }: Props) {
  void firstName;
  const router = useRouter();
  const { accessToken, fetchWithAuth, userRole } = useAuth();
  const [month, setMonth] = useState(formatMonthParam(new Date()));
  const [monthModalOpen, setMonthModalOpen] = useState(false);
  const [monthYearInput, setMonthYearInput] = useState(month.slice(0, 4));
  const [monthValueInput, setMonthValueInput] = useState(month.slice(5, 7));
  const [monthError, setMonthError] = useState<string | null>(null);
  const [detail, setDetail] = useState<RepasseDetail | null>(null);
  const [analytics, setAnalytics] = useState<ProfessionalServiceSummary | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [invoiceSubmitting, setInvoiceSubmitting] = useState(false);

  const repasses = useRepasses({ accessToken, fetchWithAuth, month, userRole });
  const { repasses: repasseItems, fetchDetail, fetchAnalytics, uploadInvoice } = repasses;

  useEffect(() => {
    if (userRole === "admin") {
      router.replace("/dashboard/financeiro");
    }
  }, [router, userRole]);

  const loadFirstRepasseAnalytics = useCallback(async () => {
    const firstRepasse = repasseItems[0];
    if (!firstRepasse) {
      setDetail(null);
      setAnalytics(null);
      return;
    }

    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const data = await fetchDetail(firstRepasse.id);
      setDetail(data);
      const result = await fetchAnalytics(data);
      setAnalytics(result);
    } catch (err) {
      setAnalyticsError(err instanceof Error ? err.message : "Erro ao carregar análises.");
    } finally {
      setAnalyticsLoading(false);
    }
  }, [fetchAnalytics, fetchDetail, repasseItems]);

  useEffect(() => {
    void loadFirstRepasseAnalytics();
  }, [loadFirstRepasseAnalytics]);

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

  const handleUploadInvoice = async () => {
    if (!detail) {
      setInvoiceError("Repasse não encontrado.");
      return;
    }
    if (!invoiceFile) {
      setInvoiceError("Escolha um arquivo antes de enviar.");
      return;
    }

    setInvoiceSubmitting(true);
    setInvoiceError(null);
    try {
      const updated = await uploadInvoice(detail.id, invoiceFile);
      setDetail(updated);
      setInvoiceOpen(false);
      setInvoiceFile(null);
    } catch (err) {
      setInvoiceError(err instanceof Error ? err.message : "Erro ao enviar nota fiscal.");
    } finally {
      setInvoiceSubmitting(false);
    }
  };

  return (
    <DashboardShell activeTab="performance" userRole={userRole}>
      <div className="flex flex-col gap-5 pb-24">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60">Desempenho</p>
            <p className="text-2xl font-semibold">{getMonthLabel(month)}</p>
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

        {detail ? (
          <RepasseAnalyticsPanel
            detail={detail}
            analytics={analytics}
            loading={analyticsLoading}
            error={analyticsError}
            onOpenInvoice={() => setInvoiceOpen(true)}
          />
        ) : (
          <p className="rounded-2xl border border-white/10 px-4 py-6 text-center text-sm text-white/60">
            Nenhum repasse encontrado para o período.
          </p>
        )}

        <RepasseInvoiceModal
          open={invoiceOpen}
          file={invoiceFile}
          error={invoiceError}
          submitting={invoiceSubmitting}
          onClose={() => {
            setInvoiceOpen(false);
            setInvoiceError(null);
            setInvoiceFile(null);
          }}
          onSubmit={handleUploadInvoice}
          onFileChange={setInvoiceFile}
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
