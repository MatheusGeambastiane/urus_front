"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { DashboardShell } from "@/src/features/dashboard/components/DashboardShell";
import { useAuth } from "@/src/features/shared/hooks/useAuth";
import { useRepasses, type RepassePaymentUpdateInput } from "@/src/features/finances/hooks/useRepasses";
import { RepasseDetailPanel } from "@/src/features/finances/components/RepasseDetailPanel";
import { RepassePaymentModal } from "@/src/features/finances/components/RepassePaymentModal";
import { RepassePaymentEditModal } from "@/src/features/finances/components/RepassePaymentEditModal";
import { RepasseInvoiceModal } from "@/src/features/finances/components/RepasseInvoiceModal";
import { calculateRepasseTotals, formatMonthParam } from "@/src/features/finances/utils/finances";
import { formatMoneyFromDecimalString, formatMoneyInputValue, parseCurrencyInput } from "@/src/features/shared/utils/money";
import type { RepasseDetail, RepasseTransaction } from "@/src/features/repasses/types";

const initialEditPaymentForm: RepassePaymentUpdateInput = {
  price: "",
  date_of_transaction: "",
  transaction_payment: "pix",
  money_resource: "barbearia",
};

export function RepasseDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { accessToken, fetchWithAuth, profilePic, userRole } = useAuth();
  const repasses = useRepasses({ accessToken, fetchWithAuth, month: formatMonthParam(new Date()), userRole });
  const { fetchDetail, updateAllowance, registerPayment, updatePayment, deletePayment, uploadInvoice } = repasses;
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
  const [editingPayment, setEditingPayment] = useState<RepasseTransaction | null>(null);
  const [editPaymentForm, setEditPaymentForm] = useState<RepassePaymentUpdateInput>(initialEditPaymentForm);
  const [editPaymentError, setEditPaymentError] = useState<string | null>(null);
  const [editPaymentSubmitting, setEditPaymentSubmitting] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<RepasseTransaction | null>(null);
  const [deletePaymentError, setDeletePaymentError] = useState<string | null>(null);
  const [deletePaymentSubmitting, setDeletePaymentSubmitting] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [invoiceSubmitting, setInvoiceSubmitting] = useState(false);

  const remainingAmount = useMemo(
    () => Math.max(calculateRepasseTotals(detail).remaining, 0),
    [detail],
  );

  const formatAllowanceField = (value: string | null | undefined) => {
    const parsed = parseCurrencyInput(value ?? "0");
    if (parsed <= 0) {
      return "";
    }
    return formatMoneyFromDecimalString(parsed.toFixed(2)).replace(/^R\$\s?/, "");
  };

  useEffect(() => {
    void fetchDetail(Number(id)).then((data) => {
      setDetail(data);
      setAllowanceInput(formatAllowanceField(data.allowence));
    }).catch((err) => setAllowanceError(err instanceof Error ? err.message : "Erro ao carregar repasse."));
  }, [fetchDetail, id]);

  const handleSaveAllowance = async () => {
    setAllowanceSaving(true);
    setAllowanceError(null);
    try {
      const updated = await updateAllowance(Number(id), parseCurrencyInput(allowanceInput).toFixed(2));
      setDetail(updated);
      setAllowanceInput(formatAllowanceField(updated.allowence));
    } catch (err) {
      setAllowanceError(err instanceof Error ? err.message : "Erro ao salvar ajuda de custo.");
    } finally {
      setAllowanceSaving(false);
    }
  };

  const handleAllowanceChange = (value: string) => {
    const formatted = formatMoneyInputValue(value).replace(/^R\$\s?/, "");
    setAllowanceInput(formatted);
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

  const handleOpenEditPayment = (transaction: RepasseTransaction) => {
    setEditPaymentError(null);
    setEditPaymentForm({
      price: formatMoneyFromDecimalString(transaction.price),
      date_of_transaction: transaction.date_of_transaction.slice(0, 10),
      transaction_payment: transaction.transaction_payment || "pix",
      money_resource: transaction.money_resource || "barbearia",
    });
    setEditingPayment(transaction);
  };

  const handleCloseEditPayment = () => {
    if (editPaymentSubmitting) return;
    setEditingPayment(null);
    setEditPaymentError(null);
    setEditPaymentForm(initialEditPaymentForm);
  };

  const handleUpdatePayment = async () => {
    if (!detail || !editingPayment) return;

    const price = parseCurrencyInput(editPaymentForm.price);
    if (price <= 0) {
      setEditPaymentError("Informe um valor maior que zero.");
      return;
    }
    if (!editPaymentForm.date_of_transaction) {
      setEditPaymentError("Informe a data do pagamento.");
      return;
    }

    setEditPaymentSubmitting(true);
    setEditPaymentError(null);
    try {
      const updated = await updatePayment(detail.id, editingPayment.id, {
        ...editPaymentForm,
        price: price.toFixed(2),
      });
      setDetail(updated);
      setEditingPayment(null);
      setEditPaymentForm(initialEditPaymentForm);
    } catch (error) {
      setEditPaymentError(error instanceof Error ? error.message : "Erro ao editar pagamento.");
    } finally {
      setEditPaymentSubmitting(false);
    }
  };

  const handleOpenDeletePayment = (transaction: RepasseTransaction) => {
    setDeletePaymentError(null);
    setPaymentToDelete(transaction);
  };

  const handleCloseDeletePayment = () => {
    if (deletePaymentSubmitting) return;
    setPaymentToDelete(null);
    setDeletePaymentError(null);
  };

  const handleDeletePayment = async () => {
    if (!detail || !paymentToDelete) return;

    setDeletePaymentSubmitting(true);
    setDeletePaymentError(null);
    try {
      const updated = await deletePayment(detail.id, paymentToDelete.id);
      setDetail(updated);
      setPaymentToDelete(null);
    } catch (error) {
      setDeletePaymentError(error instanceof Error ? error.message : "Erro ao excluir pagamento.");
    } finally {
      setDeletePaymentSubmitting(false);
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
          onAllowanceChange={handleAllowanceChange}
          onSaveAllowance={handleSaveAllowance}
          onOpenPayment={() => setPaymentOpen(true)}
          onOpenInvoice={() => setInvoiceOpen(true)}
          onOpenAnalytics={() => router.push(`/dashboard/desempenho/${id}`)}
          onEditPayment={handleOpenEditPayment}
          onDeletePayment={handleOpenDeletePayment}
        />
      </div>

      <RepassePaymentModal
        open={paymentOpen}
        form={paymentForm}
        remainingAmount={remainingAmount}
        error={paymentError}
        submitting={paymentSubmitting}
        onClose={() => setPaymentOpen(false)}
        onSubmit={handleRegisterPayment}
        onChange={(field, value) => setPaymentForm((previous) => ({ ...previous, [field]: value }))}
      />

      <RepassePaymentEditModal
        open={Boolean(editingPayment)}
        transactionId={editingPayment?.id ?? null}
        form={editPaymentForm}
        error={editPaymentError}
        submitting={editPaymentSubmitting}
        onClose={handleCloseEditPayment}
        onSubmit={handleUpdatePayment}
        onChange={(field, value) =>
          setEditPaymentForm((previous) => ({ ...previous, [field]: value }))
        }
      />

      <Modal
        open={Boolean(paymentToDelete)}
        onClose={handleCloseDeletePayment}
        title="Você deseja excluir este pagamento?"
        subtitle={paymentToDelete ? `Transação #${paymentToDelete.id}` : undefined}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-white/60">
            O pagamento será removido do repasse e os valores serão recalculados. Esta ação não pode ser desfeita.
          </p>
          {paymentToDelete ? (
            <div className="rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-white/40">Valor do pagamento</p>
              <p className="mt-1 text-lg font-semibold text-white">
                {formatMoneyFromDecimalString(paymentToDelete.price)}
              </p>
            </div>
          ) : null}
          {deletePaymentError ? (
            <p className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert">
              {deletePaymentError}
            </p>
          ) : null}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseDeletePayment}
              disabled={deletePaymentSubmitting}
              className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm text-white/70 transition hover:border-white/30 hover:text-white disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => void handleDeletePayment()}
              disabled={deletePaymentSubmitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deletePaymentSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {deletePaymentSubmitting ? "Excluindo..." : "Excluir pagamento"}
            </button>
          </div>
        </div>
      </Modal>

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
