"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/src/features/dashboard/components/DashboardShell";
import { useAuth } from "@/src/features/shared/hooks/useAuth";
import { useBills } from "@/src/features/finances/hooks/useBills";
import { BillDetailPanel } from "@/src/features/finances/components/BillDetailPanel";
import { BillPaymentModal } from "@/src/features/finances/components/BillPaymentModal";
import { formatMonthParam } from "@/src/features/finances/utils/finances";
import { parseCurrencyInput } from "@/src/features/shared/utils/money";
import type { BillDetail } from "@/src/features/bills/types";

export function FinanceDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { accessToken, fetchWithAuth, profilePic, userRole } = useAuth();
  const bills = useBills({ accessToken, fetchWithAuth, month: formatMonthParam(new Date()) });
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
    void bills
      .fetchDetail(Number(id))
      .then((data) => {
        setDetail(data);
        setEditing({
          name: data.name,
          value: data.value,
          type: data.type,
          bill_type: data.bill_type,
          finish_month: data.finish_month ? data.finish_month.slice(0, 7) : "",
          date_of_payment: data.date_of_payment,
          is_paid: data.is_paid,
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar conta."));
  }, [bills, id]);

  const handleSave = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const updated = await bills.updateBill(Number(id), {
        name: editing.name.trim(),
        value: parseCurrencyInput(editing.value).toFixed(2),
        type: editing.type,
        bill_type: editing.bill_type,
        finish_month: editing.finish_month ? `${editing.finish_month}-01` : null,
        date_of_payment: editing.date_of_payment,
        is_paid: editing.is_paid,
      });
      setDetail(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar conta.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterPayment = async () => {
    setPaymentSubmitting(true);
    setPaymentError(null);
    try {
      const updated = await bills.registerPayment(Number(id), {
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
          onChange={(field, value) => setEditing((previous) => ({ ...previous, [field]: value }))}
          onSave={handleSave}
          onOpenPayment={() => setPaymentOpen(true)}
        />
      </div>

      <BillPaymentModal
        open={paymentOpen}
        form={paymentForm}
        error={paymentError}
        submitting={paymentSubmitting}
        onClose={() => setPaymentOpen(false)}
        onSubmit={handleRegisterPayment}
        onChange={(field, value) =>
          setPaymentForm((previous) => ({ ...previous, [field]: value }))
        }
      />
    </DashboardShell>
  );
}
