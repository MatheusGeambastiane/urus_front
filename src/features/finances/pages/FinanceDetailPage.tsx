"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/src/features/dashboard/components/DashboardShell";
import { useAuth } from "@/src/features/shared/hooks/useAuth";
import { useBills } from "@/src/features/finances/hooks/useBills";
import { BillDetailPanel } from "@/src/features/finances/components/BillDetailPanel";
import { BillPaymentModal } from "@/src/features/finances/components/BillPaymentModal";
import { formatMonthParam } from "@/src/features/finances/utils/finances";
import { formatMoneyFromDecimalString, parseCurrencyInput } from "@/src/features/shared/utils/money";
import type { BillDetail } from "@/src/features/bills/types";

export function FinanceDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { accessToken, fetchWithAuth, profilePic, userRole } = useAuth();
  const bills = useBills({ accessToken, fetchWithAuth, month: formatMonthParam(new Date()) });
  const { fetchDetail, updateBill, registerPayment } = bills;
  const [detail, setDetail] = useState<BillDetail | null>(null);
  const [editing, setEditing] = useState({
    name: "",
    value: "",
    type: "",
    bill_type: "",
    finish_month: "",
    date_of_payment: "",
    is_paid: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    price: "",
    transaction_payment: "pix",
    money_resource: "barbearia",
    payment_proof: null as File | null,
  });

  useEffect(() => {
    void fetchDetail(Number(id))
      .then((data) => {
        setDetail(data);
        setEditing({
          name: data.name,
          value: formatMoneyFromDecimalString(data.value ?? "0"),
          type: data.type,
          bill_type: data.bill_type,
          finish_month: data.finish_month ? data.finish_month.slice(0, 7) : "",
          date_of_payment: data.date_of_payment,
          is_paid: data.is_paid,
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar conta."));
  }, [fetchDetail, id]);

  const remainingAmount = useMemo(() => {
    if (!detail) {
      return 0;
    }

    const total = parseCurrencyInput(detail.value ?? "0");
    const paid = detail.transactions.reduce((accumulator, transaction) => {
      return accumulator + parseCurrencyInput(transaction.price ?? "0");
    }, 0);

    return Math.max(total - paid, 0);
  }, [detail]);

  const handleSave = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const updated = await updateBill(Number(id), {
        name: editing.name.trim(),
        value: parseCurrencyInput(editing.value).toFixed(2),
        type: editing.type,
        bill_type: editing.bill_type,
        finish_month: editing.finish_month ? `${editing.finish_month}-01` : null,
        date_of_payment: editing.date_of_payment,
        is_paid: editing.is_paid,
      });
      setDetail(updated);
      setEditing({
        name: updated.name,
        value: formatMoneyFromDecimalString(updated.value ?? "0"),
        type: updated.type,
        bill_type: updated.bill_type,
        finish_month: updated.finish_month ? updated.finish_month.slice(0, 7) : "",
        date_of_payment: updated.date_of_payment,
        is_paid: updated.is_paid,
      });
      setCanEdit(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar conta.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleEdit = () => {
    if (canEdit && detail) {
      setEditing({
        name: detail.name,
        value: formatMoneyFromDecimalString(detail.value ?? "0"),
        type: detail.type,
        bill_type: detail.bill_type,
        finish_month: detail.finish_month ? detail.finish_month.slice(0, 7) : "",
        date_of_payment: detail.date_of_payment,
        is_paid: detail.is_paid,
      });
      setError(null);
    }

    setCanEdit((previous) => !previous);
  };

  const handleOpenPayment = () => {
    if (!detail) {
      setPaymentError("Selecione uma conta para adicionar um pagamento.");
      return;
    }

    setPaymentForm({
      price: "",
      transaction_payment: "pix",
      money_resource: "barbearia",
      payment_proof: null,
    });
    setPaymentError(null);
    setPaymentOpen(true);
  };

  const handleClosePayment = () => {
    setPaymentOpen(false);
    setPaymentError(null);
  };

  const handleRegisterPayment = async () => {
    setPaymentSubmitting(true);
    setPaymentError(null);
    try {
      const updated = await registerPayment(Number(id), {
        ...paymentForm,
        price: parseCurrencyInput(paymentForm.price).toFixed(2),
      });
      setDetail(updated);
      setPaymentForm({
        price: "",
        transaction_payment: "pix",
        money_resource: "barbearia",
        payment_proof: null,
      });
      handleClosePayment();
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Erro ao registrar pagamento.");
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/dashboard/financeiro");
  };

  return (
    <DashboardShell activeTab="finances" profilePic={profilePic} userRole={userRole}>
      <div className="space-y-5 pb-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60">Financeiro</p>
            <p className="text-2xl font-semibold">Detalhe da conta</p>
          </div>
          <button
            type="button"
            onClick={handleBack}
            className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80"
          >
            Voltar
          </button>
        </header>

        <BillDetailPanel
          detail={detail}
          editing={editing}
          error={error}
          submitting={submitting}
          canEdit={canEdit}
          onChange={(field, value) => setEditing((previous) => ({ ...previous, [field]: value }))}
          onSave={handleSave}
          onOpenPayment={handleOpenPayment}
          onToggleEdit={handleToggleEdit}
        />
      </div>

      <BillPaymentModal
        open={paymentOpen}
        form={paymentForm}
        remainingAmount={remainingAmount}
        error={paymentError}
        submitting={paymentSubmitting}
        onClose={handleClosePayment}
        onSubmit={handleRegisterPayment}
        onChange={(field, value) =>
          setPaymentForm((previous) => ({ ...previous, [field]: value }))
        }
      />
    </DashboardShell>
  );
}
