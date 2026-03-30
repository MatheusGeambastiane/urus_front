"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/src/features/dashboard/components/DashboardShell";
import { useAuth } from "@/src/features/shared/hooks/useAuth";
import { useRepasses } from "@/src/features/finances/hooks/useRepasses";
import { RepasseDetailPanel } from "@/src/features/finances/components/RepasseDetailPanel";
import { RepassePaymentModal } from "@/src/features/finances/components/RepassePaymentModal";
import { RepasseInvoiceModal } from "@/src/features/finances/components/RepasseInvoiceModal";
import { formatMonthParam } from "@/src/features/finances/utils/finances";
import { formatMoneyFromDecimalString, parseCurrencyInput } from "@/src/features/shared/utils/money";
import type { RepasseDetail } from "@/src/features/repasses/types";

export function RepasseDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { accessToken, fetchWithAuth, profilePic, userRole } = useAuth();
  const repasses = useRepasses({ accessToken, fetchWithAuth, month: formatMonthParam(new Date()), userRole });
  const { fetchDetail, updateAllowance, registerPayment, uploadInvoice } = repasses;
  const [detail, setDetail] = useState<RepasseDetail | null>(null);
  const [allowanceInput, setAllowanceInput] = useState("");
  const [allowanceError, setAllowanceError] = useState<string | null>(null);
  const [allowanceSaving, setAllowanceSaving] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    price: "",
    transaction_payment: "pix",
    money_resource: "barbearia",
    payment_proof: null as File | null,
  });
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [invoiceSubmitting, setInvoiceSubmitting] = useState(false);

  useEffect(() => {
    void fetchDetail(Number(id)).then((data) => {
      setDetail(data);
      setAllowanceInput(formatMoneyFromDecimalString(data.allowence ?? "0"));
    }).catch((err) => setAllowanceError(err instanceof Error ? err.message : "Erro ao carregar repasse."));
  }, [fetchDetail, id]);

  const handleSaveAllowance = async () => {
    setAllowanceSaving(true);
    setAllowanceError(null);
    try {
      const updated = await updateAllowance(Number(id), parseCurrencyInput(allowanceInput).toFixed(2));
      setDetail(updated);
      setAllowanceInput(formatMoneyFromDecimalString(updated.allowence ?? "0"));
    } catch (err) {
      setAllowanceError(err instanceof Error ? err.message : "Erro ao salvar ajuda de custo.");
    } finally {
      setAllowanceSaving(false);
    }
  };

  const handleRegisterPayment = async () => {
    if (!detail) return;
    setPaymentSubmitting(true);
    setPaymentError(null);
    try {
      const updated = await registerPayment(detail, {
        ...paymentForm,
        price: parseCurrencyInput(paymentForm.price).toFixed(2),
      });
      setDetail(updated);
      setPaymentOpen(false);
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Erro ao registrar pagamento.");
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const handleUploadInvoice = async () => {
    if (!invoiceFile) {
      setInvoiceError("Escolha um arquivo antes de enviar.");
      return;
    }
    setInvoiceSubmitting(true);
    setInvoiceError(null);
    try {
      const updated = await uploadInvoice(Number(id), invoiceFile);
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
    <DashboardShell activeTab="finances" profilePic={profilePic} userRole={userRole}>
      <div className="space-y-5 pb-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60">Financeiro</p>
            <p className="text-2xl font-semibold">Detalhe do repasse</p>
          </div>
          <button type="button" onClick={() => router.push("/dashboard/financeiro")} className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80">
            Voltar
          </button>
        </header>

        <RepasseDetailPanel
          detail={detail}
          allowanceInput={allowanceInput}
          allowanceError={allowanceError}
          allowanceSaving={allowanceSaving}
          onAllowanceChange={setAllowanceInput}
          onSaveAllowance={handleSaveAllowance}
          onOpenPayment={() => setPaymentOpen(true)}
          onOpenInvoice={() => setInvoiceOpen(true)}
          onOpenAnalytics={() => router.push(`/dashboard/desempenho/${id}`)}
        />
      </div>

      <RepassePaymentModal
        open={paymentOpen}
        form={paymentForm}
        error={paymentError}
        submitting={paymentSubmitting}
        onClose={() => setPaymentOpen(false)}
        onSubmit={handleRegisterPayment}
        onChange={(field, value) => setPaymentForm((previous) => ({ ...previous, [field]: value }))}
      />

      <RepasseInvoiceModal
        open={invoiceOpen}
        file={invoiceFile}
        error={invoiceError}
        submitting={invoiceSubmitting}
        onClose={() => setInvoiceOpen(false)}
        onSubmit={handleUploadInvoice}
        onFileChange={setInvoiceFile}
      />
    </DashboardShell>
  );
}
