"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

type DeleteBillModalProps = {
  open: boolean;
  billName: string;
  isRecurring: boolean;
  error: string | null;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteBillModal({
  open,
  billName,
  isRecurring,
  error,
  submitting,
  onClose,
  onConfirm,
}: DeleteBillModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Excluir conta" subtitle="Ação permanente">
      <div className="flex gap-3 rounded-2xl border border-red-400/20 bg-red-400/[0.07] p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-white">Excluir “{billName}”?</p>
          <p className="mt-1 text-sm leading-6 text-white/60">
            Esta ação não pode ser desfeita.
            {isRecurring ? " As demais contas desta recorrência não serão excluídas." : ""}
          </p>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="flex-1 rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/75 transition hover:border-white/25 hover:text-white disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={submitting}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {submitting ? "Excluindo..." : "Excluir conta"}
        </button>
      </div>
    </Modal>
  );
}
