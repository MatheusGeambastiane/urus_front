"use client";

import { Check, X } from "lucide-react";
import type { BillItem } from "@/src/features/bills/types";
import { getBillTypeDefinition } from "@/src/features/finances/utils/finances";
import { formatCurrency } from "@/src/features/shared/utils/money";

type BillListProps = {
  bills: BillItem[];
  showAll: boolean;
  onToggleShowAll: () => void;
  onBillClick: (id: number) => void;
};

export function BillList({ bills, showAll, onToggleShowAll, onBillClick }: BillListProps) {
  return (
    <fieldset className="space-y-4 rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5">
      <legend className="px-2 text-xs uppercase tracking-wide text-white/50">Contas</legend>
      <ul className="space-y-3">
        {(showAll ? bills : bills.slice(0, 6)).map((bill) => {
          const dueDate = bill.date_of_payment
            ? new Date(bill.date_of_payment).toLocaleDateString("pt-BR")
            : "--/--/----";
          const { label, icon: BillTypeIcon } = getBillTypeDefinition(bill.bill_type);

          return (
            <li
              key={bill.id}
              role="button"
              tabIndex={0}
              onClick={() => onBillClick(bill.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onBillClick(bill.id);
                }
              }}
              className="rounded-[24px] border border-white/10 bg-black/15 px-4 py-4 text-sm text-white/80 transition hover:border-white/25 hover:bg-black/25"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/20">
                    <BillTypeIcon className="h-5 w-5 text-white/80" />
                  </span>
                  <div>
                    <p className="text-base font-semibold text-white">{bill.name}</p>
                    <p className="text-xs text-white/60">{label}</p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-white">{formatCurrency(bill.value ?? "0")}</p>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-white/60">
                <span className="inline-flex items-center gap-2 font-semibold">
                  {bill.is_paid ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <X className="h-4 w-4 text-rose-400" />
                  )}
                  {bill.is_paid ? "Pago" : "Pendente"}
                </span>
                <span>Vencimento: {dueDate}</span>
              </div>
            </li>
          );
        })}
      </ul>
      {bills.length > 6 ? (
        <button
          type="button"
          onClick={onToggleShowAll}
          className="w-full rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 hover:border-white/30"
        >
          {showAll ? "Ver menos" : "Ver todas"}
        </button>
      ) : null}
    </fieldset>
  );
}
