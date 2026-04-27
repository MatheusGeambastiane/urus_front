"use client";

import { Check, FileText, RefreshCw, X } from "lucide-react";
import type { RepasseItem } from "@/src/features/repasses/types";
import { formatCurrency, parseCurrencyInput } from "@/src/features/shared/utils/money";

type RepasseListProps = {
  repasses: RepasseItem[];
  recalculating: boolean;
  onRecalculate: () => void;
  onRepasseClick: (id: number) => void;
};

export function RepasseList({
  repasses,
  recalculating,
  onRecalculate,
  onRepasseClick,
}: RepasseListProps) {
  return (
    <fieldset className="space-y-4 rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5">
      <legend className="px-2 text-xs uppercase tracking-wide text-white/50">Repasses</legend>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onRecalculate}
          disabled={recalculating || repasses.length === 0}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-white/40 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${recalculating ? "animate-spin" : ""}`} />
        </button>
      </div>
      <ul className="space-y-3">
        {repasses.map((repasse) => {
          const total =
            parseCurrencyInput(repasse.value_service ?? "0") +
            parseCurrencyInput(repasse.value_product ?? "0") +
            parseCurrencyInput(repasse.value_tips ?? "0") +
            parseCurrencyInput(repasse.allowence ?? "0");

          return (
            <li
              key={repasse.id}
              role="button"
              tabIndex={0}
              onClick={() => onRepasseClick(repasse.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onRepasseClick(repasse.id);
                }
              }}
              className="rounded-[24px] border border-white/10 bg-black/15 px-4 py-4 text-sm text-white/80 transition hover:border-white/25 hover:bg-black/25"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">Repasse</p>
                  <p className="mt-1 text-base font-semibold text-white">{repasse.professional.name}</p>
                  <p className="text-xs text-white/60">
                    Serviços: {formatCurrency((repasse.value_service ?? "0"))} • Produtos: {formatCurrency(repasse.value_product ?? "0")} • Ajuda de custo: {formatCurrency(repasse.allowence ?? "0")}
                  </p>
                </div>
                <p className="text-lg font-semibold text-white">{formatCurrency(total.toFixed(2))}</p>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-white/60">
                <span className="inline-flex items-center gap-2 font-semibold">
                  {repasse.is_paid ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <X className="h-4 w-4 text-rose-400" />
                  )}
                  {repasse.is_paid ? "Pago" : "Pendente"}
                </span>
                {repasse.invoice ? (
                  <span className="inline-flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    NF
                  </span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
