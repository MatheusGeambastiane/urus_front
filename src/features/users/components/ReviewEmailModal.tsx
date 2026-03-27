"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

type ReviewEmailModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: () => Promise<{ success: boolean; error?: string }>;
  onSuccess: () => void;
};

export function ReviewEmailModal({
  open,
  onClose,
  onSubmit,
  onSuccess,
}: ReviewEmailModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    const result = await onSubmit();
    setSubmitting(false);
    if (!result.success) {
      setError(result.error ?? "Não foi possível enviar o email de avaliação.");
      return;
    }
    onSuccess();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Enviar email de avaliação" subtitle="Usuário">
      <div className="space-y-4 text-sm text-white/80">
        <p>Enviar email de avaliação para o usuário?</p>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
