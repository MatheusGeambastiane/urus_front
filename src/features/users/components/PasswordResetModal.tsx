"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

type PasswordResetModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (password: string) => Promise<{ success: boolean; error?: string }>;
  onSuccess: () => void;
};

export function PasswordResetModal({
  open,
  onClose,
  onSubmit,
  onSuccess,
}: PasswordResetModalProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!password.trim()) {
      setError("Informe a nova senha.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    setSubmitting(true);
    setError(null);
    const result = await onSubmit(password);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Não foi possível redefinir a senha.");
      return;
    }

    onSuccess();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Redefinir senha" subtitle="Usuário">
      <div className="space-y-4">
        <label className="text-sm text-white/70">
          Digite a nova senha
          <div className="mt-1 flex items-center rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm focus-within:border-white/40">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full bg-transparent outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-white/70"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>
        <label className="text-sm text-white/70">
          Confirme a nova senha
          <div className="mt-1 flex items-center rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm focus-within:border-white/40">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full bg-transparent outline-none"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="text-white/70"
              aria-label={showConfirmPassword ? "Ocultar confirmação" : "Mostrar confirmação"}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>

        {error ? <p className="text-sm text-red-300">{error}</p> : null}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80"
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
                Salvando...
              </>
            ) : (
              "Salvar"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
