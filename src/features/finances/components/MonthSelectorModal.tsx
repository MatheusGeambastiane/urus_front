"use client";

import { Modal } from "@/components/ui/Modal";

type MonthSelectorModalProps = {
  open: boolean;
  yearValue: string;
  monthValue: string;
  years: string[];
  error: string | null;
  onClose: () => void;
  onApply: () => void;
  onYearChange: (value: string) => void;
  onMonthChange: (value: string) => void;
};

const monthOptions = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

export function MonthSelectorModal({
  open,
  yearValue,
  monthValue,
  years,
  error,
  onClose,
  onApply,
  onYearChange,
  onMonthChange,
}: MonthSelectorModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Selecionar mês" subtitle="Financeiro">
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm text-white/60">Ano</span>
          <select
            value={yearValue}
            onChange={(event) => onYearChange(event.target.value)}
            className="h-11 w-full rounded-2xl border border-white/10 bg-transparent px-4 text-sm text-white outline-none focus:border-white/40"
          >
            {years.map((year) => (
              <option key={year} value={year} className="bg-[#050505]">
                {year}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-white/60">Mês</span>
          <select
            value={monthValue}
            onChange={(event) => onMonthChange(event.target.value)}
            className="h-11 w-full rounded-2xl border border-white/10 bg-transparent px-4 text-sm text-white outline-none focus:border-white/40"
          >
            {monthOptions.map((month) => (
              <option key={month.value} value={month.value} className="bg-[#050505]">
                {month.label}
              </option>
            ))}
          </select>
        </label>

        {error ? <p className="text-sm text-red-300">{error}</p> : null}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/70"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onApply}
            className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black"
          >
            Aplicar
          </button>
        </div>
      </div>
    </Modal>
  );
}
