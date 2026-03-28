"use client";

import { Modal } from "@/components/ui/Modal";

type RepasseInvoiceModalProps = {
  open: boolean;
  file: File | null;
  error: string | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onFileChange: (file: File | null) => void;
};

export function RepasseInvoiceModal({
  open,
  file,
  error,
  submitting,
  onClose,
  onSubmit,
  onFileChange,
}: RepasseInvoiceModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Adicionar nota fiscal" subtitle="Repasse">
      <div className="space-y-4">
        <input
          type="file"
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
          className="block w-full text-sm text-white/70"
        />
        {file ? <p className="text-sm text-white/60">{file.name}</p> : null}
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/70">Cancelar</button>
          <button type="button" onClick={onSubmit} disabled={submitting} className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-60">
            {submitting ? "Enviando..." : "Salvar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
