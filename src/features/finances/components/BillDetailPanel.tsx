"use client";

import { useMemo } from "react";
import { CalendarDays, ChevronRight, PenSquare, Repeat2, Trash2 } from "lucide-react";
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
import { formatIsoToDisplay } from "@/src/features/shared/utils/date";

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
  onDelete: () => void;
  onNavigateRecurrence: (id: number) => void;
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
  onDelete,
  onNavigateRecurrence,
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

      <section className="overflow-hidden rounded-3xl border border-white/5 bg-[#0b0b0b] shadow-card">
        <div className="flex items-start gap-4 border-b border-white/[0.07] p-5">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${detail.is_recurring ? "border-amber-300/20 bg-amber-300/10 text-amber-200" : "border-white/10 bg-white/[0.04] text-white/45"}`}>
            <Repeat2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-white">Recorrência</h2>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${detail.is_recurring ? "bg-amber-300/10 text-amber-200" : "bg-white/[0.06] text-white/45"}`}>
                {detail.is_recurring ? "Conta recorrente" : "Conta avulsa"}
              </span>
            </div>
            <p className="mt-1 text-sm text-white/55">
              {detail.is_recurring
                ? `${detail.recurrences.length + 1} ocorrências vinculadas a esta série.`
                : "Esta conta não está vinculada a uma série recorrente."}
            </p>
          </div>
        </div>

        {detail.is_recurring ? (
          <div className="p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                Outras recorrências
              </p>
              <p className="text-xs text-white/35">{detail.recurrences.length} contas</p>
            </div>
            {detail.recurrences.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/10 px-4 py-4 text-center text-sm text-white/55">
                Não há outras ocorrências nesta série.
              </p>
            ) : (
              <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
                {detail.recurrences.map((recurrence) => (
                  <li key={recurrence.id}>
                    <button
                      type="button"
                      onClick={() => onNavigateRecurrence(recurrence.id)}
                      className="group flex w-full items-center gap-3 rounded-2xl border border-white/[0.07] bg-black/25 px-4 py-3 text-left transition hover:border-white/20 hover:bg-white/[0.04]"
                    >
                      <CalendarDays className="h-4 w-4 shrink-0 text-white/35" aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-white/85">
                          {formatIsoToDisplay(recurrence.date_of_payment)}
                        </span>
                        <span className={`mt-0.5 block text-xs ${recurrence.is_paid ? "text-emerald-300/70" : "text-amber-200/60"}`}>
                          {recurrence.is_paid ? "Paga" : "Pendente"}
                        </span>
                      </span>
                      <span className="text-sm font-semibold text-white/75">
                        {formatCurrency(recurrence.value)}
                      </span>
                      <ChevronRight className="h-4 w-4 text-white/25 transition group-hover:translate-x-0.5 group-hover:text-white/60" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
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

      <section className="flex flex-col gap-4 rounded-3xl border border-red-400/15 bg-red-400/[0.035] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Excluir esta conta</h2>
          <p className="mt-1 text-sm text-white/45">
            {detail.is_recurring
              ? "Remove somente esta ocorrência; as demais continuam cadastradas."
              : "A exclusão é permanente e não poderá ser desfeita."}
          </p>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-red-400/30 px-4 py-2.5 text-sm font-semibold text-red-200 transition hover:border-red-300/50 hover:bg-red-400/10"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Excluir conta
        </button>
      </section>
    </div>
  );
}
