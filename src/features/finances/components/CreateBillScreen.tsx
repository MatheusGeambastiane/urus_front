"use client";

import { Check } from "lucide-react";
import { billFrequencyOptions, billTypeOptions } from "@/src/features/finances/utils/finances";

type CreateBillScreenProps = {
  form: {
    name: string;
    value: string;
    type: string;
    bill_type: string;
    finish_month: string;
    date_of_payment: string;
  };
  error: string | null;
  onChange: (field: string, value: string) => void;
};

export function CreateBillScreen({
  form,
  error,
  onChange,
}: CreateBillScreenProps) {
  const selectedBillType = form.bill_type;
  const selectedFrequency = form.type;

  return (
    <div className="space-y-5">
      <section className="space-y-3 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
        <label className="block text-sm text-white/70">
          Descrição
          <input
            type="text"
            value={form.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Ex: Energia, aluguel..."
            className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-white/70">
            Valor (R$)
            <input
              type="text"
              value={form.value}
              onChange={(e) => onChange("value", e.target.value)}
              placeholder="0,00"
              className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
            />
          </label>
          <label className="text-sm text-white/70">
            Vencimento
            <input
              type="date"
              value={form.date_of_payment}
              onChange={(e) => onChange("date_of_payment", e.target.value)}
              className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
            />
          </label>
        </div>
        <label className="text-sm text-white/70">
          Mês final
          <input
            type="date"
            value={form.finish_month}
            onChange={(e) => onChange("finish_month", e.target.value)}
            placeholder="Deixe em branco se for despesa única"
            className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
          />
        </label>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
        <div>
          <p className="text-sm text-white/60">Categoria</p>
          <p className="text-lg font-semibold">Selecione a categoria da conta</p>
        </div>
        <div className="flex flex-col gap-2">
          {billTypeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = option.value === selectedBillType;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange("bill_type", option.value)}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                  isActive ? "border-white bg-white text-black" : "border-white/10 text-white/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  {option.label}
                </div>
                {isActive ? <Check className="h-4 w-4" /> : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
        <div>
          <p className="text-sm text-white/60">Tipo</p>
          <p className="text-lg font-semibold">Periodicidade</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {billFrequencyOptions.map((option) => {
            const Icon = option.icon;
            const isActive = option.value === selectedFrequency;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange("type", option.value)}
                className={`flex min-w-[120px] flex-1 items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                  isActive ? "border-white bg-white text-black" : "border-white/10 text-white/70"
                }`}
              >
                <Icon className="h-4 w-4" />
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      {error ? (
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </p>
      ) : null}
    </div>
  );
}
