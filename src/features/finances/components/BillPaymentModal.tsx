"use client";

import { Modal } from "@/components/ui/Modal";
import { moneyResourceOptions, paymentTypeOptions } from "@/src/features/finances/utils/finances";
import { formatCurrency, formatMoneyInputValue } from "@/src/features/shared/utils/money";

type BillPaymentModalProps = {
  open: boolean;
  form: {
    price: string;
    transaction_payment: string;
    money_resource: string;
    payment_proof: File | null;
  };
  remainingAmount: number;
  error: string | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onChange: (field: "price" | "transaction_payment" | "money_resource" | "payment_proof", value: string | File | null) => void;
};

export function BillPaymentModal({
  open,
  form,
  remainingAmount,
  error,
  submitting,
  onClose,
  onSubmit,
  onChange,
}: BillPaymentModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Registrar pagamento" subtitle="Conta">
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm text-white/60">Valor</span>
          <input
            type="text"
            value={form.price}
            onChange={(event) => onChange("price", formatMoneyInputValue(event.target.value))}
            className="h-11 w-full rounded-2xl border border-white/10 bg-transparent px-4 text-sm outline-none focus:border-white/40"
            placeholder="R$ 0,00"
          />
          <p className="mt-1 text-xs text-white/60">Falta para quitar: {formatCurrency(remainingAmount.toFixed(2))}</p>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-white/60">Forma</span>
          <select
            value={form.transaction_payment}
            onChange={(event) => onChange("transaction_payment", event.target.value)}
            className="h-11 w-full rounded-2xl border border-white/10 bg-transparent px-4 text-sm outline-none focus:border-white/40"
          >
            {paymentTypeOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#050505]">
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-white/60">Origem</span>
          <select
            value={form.money_resource}
            onChange={(event) => onChange("money_resource", event.target.value)}
            className="h-11 w-full rounded-2xl border border-white/10 bg-transparent px-4 text-sm outline-none focus:border-white/40"
          >
            {moneyResourceOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#050505]">
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-white/60">Comprovante</span>
          <input
            type="file"
            onChange={(event) => onChange("payment_proof", event.target.files?.[0] ?? null)}
            className="block w-full text-sm text-white/70"
          />
        </label>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/70">Cancelar</button>
          <button type="button" onClick={onSubmit} disabled={submitting} className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-60">
            {submitting ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
