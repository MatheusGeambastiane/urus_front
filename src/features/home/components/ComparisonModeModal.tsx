"use client";

import { CalendarRange, Rows3 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import type { SummaryComparisonMode } from "@/src/features/home/types";
import { formatDateParam, formatIsoToDisplay } from "@/src/features/shared/utils/date";

type ComparisonModeModalProps = {
  open: boolean;
  rangeStart: Date | null;
  rangeEnd: Date | null;
  onSelect: (mode: SummaryComparisonMode) => void;
  onCancel: () => void;
};

const getOrdinalWeek = (date: Date | null) => {
  if (!date) return null;
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const daysUntilMonday = (8 - firstDay.getDay()) % 7;
  const firstMonday = new Date(date.getFullYear(), date.getMonth(), 1 + daysUntilMonday);
  return Math.floor((date.getDate() - firstMonday.getDate()) / 7) + 1;
};

export function ComparisonModeModal({
  open,
  rangeStart,
  rangeEnd,
  onSelect,
  onCancel,
}: ComparisonModeModalProps) {
  const ordinalWeek = getOrdinalWeek(rangeStart);
  const rangeLabel = rangeStart && rangeEnd
    ? `${formatIsoToDisplay(formatDateParam(rangeStart))} – ${formatIsoToDisplay(formatDateParam(rangeEnd))}`
    : "Semana selecionada";

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title="Como deseja comparar?"
      subtitle={rangeLabel}
    >
      <p className="text-sm leading-relaxed text-white/55">
        Este período forma uma semana completa de segunda a sábado. Escolha a referência para a média dos dois meses anteriores.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect("days")}
          className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-white/30 hover:bg-white/[0.07]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
            <CalendarRange className="h-4 w-4" />
          </span>
          <span className="mt-4 block text-sm font-semibold text-white">Comparar os dias</span>
          <span className="mt-1 block text-xs leading-relaxed text-white/40">
            Usa o mesmo intervalo deslocado para cada mês anterior.
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelect("weeks")}
          className="group rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] p-4 text-left transition hover:border-emerald-200/45 hover:bg-emerald-300/[0.1]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-200 text-emerald-950">
            <Rows3 className="h-4 w-4" />
          </span>
          <span className="mt-4 block text-sm font-semibold text-white">
            Comparar {ordinalWeek ? `${ordinalWeek}ª semana` : "as semanas"}
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-white/40">
            Usa a mesma posição semanal dentro de cada mês anterior.
          </span>
        </button>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-white/15 px-4 py-2 text-sm text-white/75 transition hover:border-white/30"
        >
          Cancelar
        </button>
      </div>
    </Modal>
  );
}
