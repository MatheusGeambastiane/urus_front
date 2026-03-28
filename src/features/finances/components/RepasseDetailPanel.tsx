"use client";

import Image from "next/image";
import { FileText } from "lucide-react";
import type { RepasseDetail } from "@/src/features/repasses/types";
import { calculateRepasseTotals, formatMonthReference, getPaymentTypeLabel } from "@/src/features/finances/utils/finances";
import { formatCurrency } from "@/src/features/shared/utils/money";
import { capitalizeFirstLetter } from "@/src/features/shared/utils/string";

type RepasseDetailPanelProps = {
  detail: RepasseDetail | null;
  allowanceInput: string;
  allowanceError: string | null;
  allowanceSaving: boolean;
  onAllowanceChange: (value: string) => void;
  onSaveAllowance: () => void;
  onOpenPayment: () => void;
  onOpenInvoice: () => void;
  onOpenAnalytics: () => void;
};

export function RepasseDetailPanel({
  detail,
  allowanceInput,
  allowanceError,
  allowanceSaving,
  onAllowanceChange,
  onSaveAllowance,
  onOpenPayment,
  onOpenInvoice,
  onOpenAnalytics,
}: RepasseDetailPanelProps) {
  if (!detail) {
    return <p className="rounded-3xl border border-white/10 px-4 py-6 text-center text-sm text-white/60">Detalhes indisponíveis.</p>;
  }

  const totals = calculateRepasseTotals(detail);

  return (
    <div className="space-y-4">
      <section className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card text-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/50">Profissional</p>
            <p className="text-lg font-semibold">{detail.professional.name}</p>
            <p className="text-sm text-white/60">{detail.professional.professional_type || "Tipo não informado"}</p>
          </div>
          <p className="text-2xl font-semibold">{formatCurrency(totals.total.toFixed(2))}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <p className="text-xs uppercase tracking-wide text-white/60">Ajuda de custo</p>
          <div className="mt-2 flex items-center gap-3">
            <input value={allowanceInput} onChange={(e) => onAllowanceChange(e.target.value)} className="h-11 flex-1 rounded-2xl border border-white/10 bg-transparent px-4 text-sm outline-none focus:border-white/40" />
            <button type="button" onClick={onSaveAllowance} disabled={allowanceSaving} className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-60">
              {allowanceSaving ? "Salvando..." : "Salvar"}
            </button>
          </div>
          {allowanceError ? <p className="mt-2 text-xs text-red-300">{allowanceError}</p> : null}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={onOpenPayment} className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/80">
            Adicionar pagamento
          </button>
          <button type="button" onClick={onOpenInvoice} className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/80">
            {detail.invoice ? "Trocar nota fiscal" : "Adicionar nota fiscal"}
          </button>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card text-white">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs uppercase tracking-wide text-white/60">Mês de referência</p>
            <p className="mt-1 text-lg font-semibold">{formatMonthReference(detail.month)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs uppercase tracking-wide text-white/60">Nota fiscal</p>
            {detail.invoice ? (
              <a href={detail.invoice} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-white underline-offset-4 hover:underline">
                <FileText className="h-4 w-4" />
                Ver nota fiscal
              </a>
            ) : (
              <p className="mt-2 text-sm text-white/60">Sem nota fiscal cadastrada.</p>
            )}
          </div>
        </div>

        <fieldset className="space-y-3 rounded-2xl border border-white/10 bg-black/40 p-4">
          <legend className="px-2 text-xs uppercase tracking-wide text-white/50">Transações</legend>
          {detail.transactions.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/10 px-4 py-4 text-center text-sm text-white/60">Nenhuma transação registrada para este repasse.</p>
          ) : (
            <ul className="space-y-3">
              {detail.transactions.map((transaction) => (
                <li key={transaction.id} className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">
                        {transaction.type === "payment" ? "Pagamento" : capitalizeFirstLetter(transaction.type)}
                      </p>
                      <p className="text-xs text-white/60">{new Date(transaction.date_of_transaction).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-white">{formatCurrency(transaction.price)}</p>
                      <p className="text-xs text-white/60">{getPaymentTypeLabel(transaction.transaction_payment as never)}</p>
                      {transaction.money_resource ? (
                        <p className="text-xs text-white/60">
                          Origem: {capitalizeFirstLetter(transaction.money_resource)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  {transaction.payment_proof ? (
                    <a
                      href={transaction.payment_proof}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-white/80 underline-offset-2 hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      Ver comprovante
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </fieldset>
      </section>

      <section className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-1 shadow-card">
        <button
          type="button"
          onClick={onOpenAnalytics}
          className="flex w-full items-center overflow-hidden rounded-2xl bg-white text-left transition hover:shadow-lg"
        >
          <div className="flex flex-1 flex-col gap-2 px-4 py-4 text-black">
            <p className="text-lg font-semibold">
              Veja as análises de {detail.professional.name}
            </p>
            <span className="inline-flex w-max items-center gap-2 rounded-full bg-black px-4 py-1 text-xs font-medium text-white">
              Ver análises
            </span>
          </div>
          <div className="relative h-32 w-32 flex-shrink-0 bg-black/5">
            <Image
              src="/relogio_urus.png"
              alt="Relógio Urus"
              fill
              sizes="128px"
              className="object-cover"
            />
          </div>
        </button>
      </section>
    </div>
  );
}
