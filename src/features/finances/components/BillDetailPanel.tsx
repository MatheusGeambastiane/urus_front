"use client";

import { useMemo } from "react";
import { getBillFrequencyLabel, getBillTypeDefinition } from "@/src/features/finances/utils/finances";
import type { BillDetail } from "@/src/features/bills/types";
import { formatCurrency } from "@/src/features/shared/utils/money";

type BillDetailPanelProps = {
  detail: BillDetail | null;
  editing: {
    name: string;
    value: string;
    type: string;
    bill_type: string;
    finish_month: string;
    date_of_payment: string;
    is_paid: boolean;
  };
  error: string | null;
  submitting: boolean;
  onChange: (field: string, value: string | boolean) => void;
  onSave: () => void;
  onOpenPayment: () => void;
};

export function BillDetailPanel({
  detail,
  editing,
  error,
  submitting,
  onChange,
  onSave,
  onOpenPayment,
}: BillDetailPanelProps) {
  const billType = useMemo(() => getBillTypeDefinition(detail?.bill_type), [detail?.bill_type]);

  if (!detail) {
    return <p className="rounded-3xl border border-white/10 px-4 py-6 text-center text-sm text-white/60">Detalhes indisponíveis.</p>;
  }

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-white/60">{getBillFrequencyLabel(detail.type)}</p>
            <h2 className="text-xl font-semibold">{detail.name}</h2>
            <p className="text-xs text-white/60">Categoria: {billType.label}</p>
          </div>
          <p className="text-xl font-semibold">{formatCurrency(detail.value)}</p>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={editing.name} onChange={(e) => onChange("name", e.target.value)} className="h-11 rounded-2xl border border-white/10 bg-transparent px-4 text-sm outline-none focus:border-white/40" />
          <input value={editing.value} onChange={(e) => onChange("value", e.target.value)} className="h-11 rounded-2xl border border-white/10 bg-transparent px-4 text-sm outline-none focus:border-white/40" />
          <input value={editing.type} onChange={(e) => onChange("type", e.target.value)} className="h-11 rounded-2xl border border-white/10 bg-transparent px-4 text-sm outline-none focus:border-white/40" />
          <input value={editing.bill_type} onChange={(e) => onChange("bill_type", e.target.value)} className="h-11 rounded-2xl border border-white/10 bg-transparent px-4 text-sm outline-none focus:border-white/40" />
          <input type="date" value={editing.date_of_payment} onChange={(e) => onChange("date_of_payment", e.target.value)} className="h-11 rounded-2xl border border-white/10 bg-transparent px-4 text-sm outline-none focus:border-white/40" />
          <input type="month" value={editing.finish_month} onChange={(e) => onChange("finish_month", e.target.value)} className="h-11 rounded-2xl border border-white/10 bg-transparent px-4 text-sm outline-none focus:border-white/40" />
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-white/80">
          <input type="checkbox" checked={editing.is_paid} onChange={(e) => onChange("is_paid", e.target.checked)} />
          Conta paga
        </label>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onOpenPayment} className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/80">Adicionar pagamento</button>
          <button type="button" onClick={onSave} disabled={submitting} className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-60">
            {submitting ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </section>

      <fieldset className="space-y-3 rounded-2xl border border-white/10 bg-black/40 p-4">
        <legend className="px-2 text-xs uppercase tracking-wide text-white/50">Transações</legend>
        {detail.transactions.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/10 px-4 py-4 text-center text-sm text-white/60">Nenhuma transação registrada para esta conta.</p>
        ) : (
          <ul className="space-y-3">
            {detail.transactions.map((transaction) => (
              <li key={transaction.id} className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{transaction.type}</p>
                    <p className="text-xs text-white/60">{new Date(transaction.date_of_transaction).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <p className="text-lg font-semibold text-white">{formatCurrency(transaction.price)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </fieldset>
    </div>
  );
}
