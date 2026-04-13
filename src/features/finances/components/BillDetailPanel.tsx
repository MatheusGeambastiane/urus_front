"use client";

import { useMemo } from "react";
import { PenSquare } from "lucide-react";
import {
  billFrequencyOptions,
  billTypeOptions,
  getBillFrequencyLabel,
  getBillTypeDefinition,
} from "@/src/features/finances/utils/finances";
import type { BillDetail } from "@/src/features/bills/types";
import {
  formatCurrency,
  formatMoneyInputValue,
  parseCurrencyInput,
} from "@/src/features/shared/utils/money";

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
  canEdit: boolean;
  onChange: (field: string, value: string | boolean) => void;
  onSave: () => void;
  onOpenPayment: () => void;
  onToggleEdit: () => void;
};

export function BillDetailPanel({
  detail,
  editing,
  error,
  submitting,
  canEdit,
  onChange,
  onSave,
  onOpenPayment,
  onToggleEdit,
}: BillDetailPanelProps) {
  const billType = useMemo(() => getBillTypeDefinition(detail?.bill_type), [detail?.bill_type]);
  const billTypeLabel = detail?.bill_type_display?.trim() || billType.label;
  const frequencyLabel = detail?.type_display?.trim() || getBillFrequencyLabel(detail?.type);
  const paidAmount = useMemo(
    () =>
      detail?.transactions.reduce((accumulator, transaction) => {
        return accumulator + parseCurrencyInput(transaction.price ?? "0");
      }, 0) ?? 0,
    [detail],
  );
  const remainingAmount = Math.max(parseCurrencyInput(detail?.value ?? "0") - paidAmount, 0);

  if (!detail) {
    return <p className="rounded-3xl border border-white/10 px-4 py-6 text-center text-sm text-white/60">Detalhes indisponíveis.</p>;
  }

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-white/60">{frequencyLabel}</p>
            <h2 className="text-xl font-semibold">{detail.name}</h2>
            <p className="text-xs text-white/60">Categoria: {billTypeLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-semibold">{formatCurrency(detail.value)}</p>
            <p className="text-xs text-white/60">Falta para quitar: {formatCurrency(remainingAmount.toFixed(2))}</p>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Editar conta</h2>
            <p className="text-sm text-white/60">{canEdit ? "Edição habilitada" : "Visualização"}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleEdit}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/80"
            >
              <PenSquare className="h-4 w-4" />
              {canEdit ? "Cancelar edição" : "Editar conta"}
            </button>
            {canEdit ? (
              <button type="button" onClick={onSave} disabled={submitting} className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-60">
                {submitting ? "Salvando..." : "Salvar"}
              </button>
            ) : null}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={editing.name} onChange={(e) => onChange("name", e.target.value)} disabled={!canEdit} className={`h-11 rounded-2xl border border-white/10 bg-transparent px-4 text-sm outline-none focus:border-white/40 ${!canEdit ? "opacity-60" : ""}`} />
          <input value={editing.value} onChange={(e) => onChange("value", formatMoneyInputValue(e.target.value))} disabled={!canEdit} className={`h-11 rounded-2xl border border-white/10 bg-transparent px-4 text-sm outline-none focus:border-white/40 ${!canEdit ? "opacity-60" : ""}`} />
          <select value={editing.type} onChange={(e) => onChange("type", e.target.value)} disabled={!canEdit} className={`h-11 rounded-2xl border border-white/10 bg-[#050505] px-4 text-sm outline-none focus:border-white/40 ${!canEdit ? "opacity-60" : ""}`}>
            {billFrequencyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select value={editing.bill_type} onChange={(e) => onChange("bill_type", e.target.value)} disabled={!canEdit} className={`h-11 rounded-2xl border border-white/10 bg-[#050505] px-4 text-sm outline-none focus:border-white/40 ${!canEdit ? "opacity-60" : ""}`}>
            {billTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input type="date" value={editing.date_of_payment} onChange={(e) => onChange("date_of_payment", e.target.value)} disabled={!canEdit} className={`h-11 rounded-2xl border border-white/10 bg-transparent px-4 text-sm outline-none focus:border-white/40 ${!canEdit ? "opacity-60" : ""}`} />
          <input type="month" value={editing.finish_month} onChange={(e) => onChange("finish_month", e.target.value)} disabled={!canEdit} className={`h-11 rounded-2xl border border-white/10 bg-transparent px-4 text-sm outline-none focus:border-white/40 ${!canEdit ? "opacity-60" : ""}`} />
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-white/80">
          <input type="checkbox" checked={editing.is_paid} onChange={(e) => onChange("is_paid", e.target.checked)} disabled={!canEdit} />
          Conta paga
        </label>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <div className="flex justify-end">
          <button type="button" onClick={onOpenPayment} className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/80">Adicionar pagamento</button>
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
                    <p className="font-semibold text-white">{transaction.type === "payment" ? "Pagamento" : transaction.type}</p>
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
