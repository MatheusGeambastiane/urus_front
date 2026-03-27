"use client";

import { Modal } from "@/components/ui/Modal";

type DeleteDayRestrictionModalProps = {
  open: boolean;
  error: string | null;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteDayRestrictionModal({
  open,
  error,
  submitting,
  onClose,
  onConfirm,
}: DeleteDayRestrictionModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Excluir restrição" subtitle="Agenda">
      <p className="text-sm text-white/80">Você deseja realmente excluir esta restrição?</p>

      {error ? (
        <p className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80"
        >
          Não
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={submitting}
          className="flex-1 rounded-2xl bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
        >
          {submitting ? "Excluindo..." : "Sim"}
        </button>
      </div>
    </Modal>
  );
}
