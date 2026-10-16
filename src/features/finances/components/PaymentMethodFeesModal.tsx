"use client";

import { useState } from "react";

import { Modal } from "@/components/ui/Modal";
import type { PaymentMethodFee } from "@/src/features/finances/types";

type Props = {
  open: boolean;
  fees: PaymentMethodFee[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (fees: PaymentMethodFee[]) => Promise<void>;
};

export function PaymentMethodFeesModal({ open, fees, loading, saving, error, onClose, onSave }: Props) {
  const [values, setValues] = useState<PaymentMethodFee[]>(fees);

  return (
    <Modal open={open} onClose={onClose} title="Taxas de pagamento" subtitle="Financeiro">
      <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void onSave(values); }}>
        <p className="text-sm leading-relaxed text-white/48">Informe o percentual descontado em cada meio de pagamento.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {values.map((fee) => (
            <label key={fee.payment_method} className="rounded-2xl border border-white/8 bg-white/[0.025] p-3">
              <span className="text-xs font-medium text-white/62">{fee.label}</span>
              <span className="mt-2 flex h-11 items-center rounded-xl border border-white/10 bg-black/20 px-3 focus-within:border-[#d8b873]/55">
                <input type="number" min="0" max="100" step="0.01" required value={fee.rate} onChange={(event) => setValues((current) => current.map((item) => item.payment_method === fee.payment_method ? { ...item, rate: event.target.value } : item))} className="min-w-0 flex-1 bg-transparent text-base font-semibold text-white outline-none" />
                <span className="text-sm text-white/35">%</span>
              </span>
            </label>
          ))}
        </div>
        {loading ? <p className="text-sm text-white/45">Carregando taxas…</p> : null}
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <div className="flex justify-end gap-3 pt-1">
          <button type="button" onClick={onClose} className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/65">Cancelar</button>
          <button type="submit" disabled={saving || loading || values.length === 0} className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black transition disabled:opacity-45">{saving ? "Salvando…" : "Salvar taxas"}</button>
        </div>
      </form>
    </Modal>
  );
}
