"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { DashboardShell } from "@/src/features/dashboard/components/DashboardShell";
import { useAuth } from "@/src/features/shared/hooks/useAuth";
import { useBills } from "@/src/features/finances/hooks/useBills";
import { CreateBillScreen } from "@/src/features/finances/components/CreateBillScreen";
import { formatMonthParam } from "@/src/features/finances/utils/finances";
import { parseCurrencyInput } from "@/src/features/shared/utils/money";

export function CreateBillPage() {
  const router = useRouter();
  const { accessToken, fetchWithAuth, userRole } = useAuth();
  const bills = useBills({ accessToken, fetchWithAuth, month: formatMonthParam(new Date()) });
  const [form, setForm] = useState({
    name: "",
    value: "",
    type: "fixed",
    bill_type: "maintenance",
    finish_month: "",
    date_of_payment: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const created = await bills.createBill({
        name: form.name.trim(),
        value: parseCurrencyInput(form.value).toFixed(2),
        type: form.type,
        bill_type: form.bill_type,
        finish_month: form.finish_month ? `${form.finish_month}-01` : null,
        date_of_payment: form.date_of_payment,
      });
      router.push(`/dashboard/financeiro/contas/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell activeTab="finances" userRole={userRole}>
      <div className="space-y-5 pb-8">
        <header className="flex items-center justify-between">
          <button
            type="button"
            className="mr-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-white/40 hover:text-white"
            onClick={() => router.push("/dashboard/financeiro")}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 text-center">
            <p className="text-sm text-white/60">Financeiro</p>
            <p className="text-2xl font-semibold">Cadastrar conta</p>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitting ? "Salvando..." : "Salvar"}
          </button>
        </header>
        <CreateBillScreen
          form={form}
          error={error}
          onChange={(field, value) => setForm((previous) => ({ ...previous, [field]: value }))}
        />
      </div>
    </DashboardShell>
  );
}
