"use client";

import type { FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { moneyResourceOptions, paymentTypeOptions } from "@/src/features/finances/utils/finances";
import { formatMoneyInputValue } from "@/src/features/shared/utils/money";
import type { RepassePaymentUpdateInput } from "@/src/features/finances/hooks/useRepasses";

type RepassePaymentEditModalProps = {
  open: boolean;
  transactionId: number | null;
  form: RepassePaymentUpdateInput;
  error: string | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onChange: <Field extends keyof RepassePaymentUpdateInput>(
    field: Field,
    value: RepassePaymentUpdateInput[Field],
  ) => void;
};

export function RepassePaymentEditModal({
  open,
  transactionId,
  form,
  error,
  submitting,
  onClose,
  onSubmit,
  onChange,
}: RepassePaymentEditModalProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Editar pagamento"
      subtitle={transactionId ? `Transação #${transactionId}` : "Repasse"}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-white/60">Valor</span>
            <input
              type="text"
              inputMode="decimal"
              value={form.price}
              onChange={(event) => onChange("price", formatMoneyInputValue(event.target.value))}
              placeholder="R$ 0,00"
              className="h-11 w-full rounded-2xl border border-white/10 bg-transparent px-4 text-sm outline-none transition focus:border-white/40"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-white/60">Data</span>
            <input
              type="date"
              value={form.date_of_transaction}
              onChange={(event) => onChange("date_of_transaction", event.target.value)}
              className="h-11 w-full rounded-2xl border border-white/10 bg-transparent px-4 text-sm outline-none transition focus:border-white/40"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm text-white/60">Forma de pagamento</span>
          <select
            value={form.transaction_payment}
            onChange={(event) => onChange("transaction_payment", event.target.value)}
            className="h-11 w-full rounded-2xl border border-white/10 bg-transparent px-4 text-sm outline-none transition focus:border-white/40"
          >
            {paymentTypeOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#050505]">
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-white/60">Origem do recurso</span>
          <select
            value={form.money_resource}
            onChange={(event) => onChange("money_resource", event.target.value)}
            className="h-11 w-full rounded-2xl border border-white/10 bg-transparent px-4 text-sm outline-none transition focus:border-white/40"
          >
            {moneyResourceOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#050505]">
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {error ? (
          <p className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm text-white/70 transition hover:border-white/30 hover:text-white disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitting ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
