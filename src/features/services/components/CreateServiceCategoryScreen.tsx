"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { ChevronLeft, Loader2 } from "lucide-react";
import type { useServices } from "@/src/features/services/hooks/useServices";

type CreateServiceCategoryScreenProps = {
  onCancel: () => void;
  createServiceCategory: ReturnType<typeof useServices>["createServiceCategory"];
  onSuccess: () => void;
};

export function CreateServiceCategoryScreen({
  onCancel,
  createServiceCategory,
  onSuccess,
}: CreateServiceCategoryScreenProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await createServiceCategory(name, icon);

    setSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Erro ao criar categoria.");
      return;
    }

    onSuccess();
  };

  const handleIconChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIcon(e.target.files?.[0] ?? null);
  };

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center gap-3">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-white/40 hover:text-white"
          onClick={onCancel}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="text-sm text-white/60">Serviços</p>
          <p className="text-2xl font-semibold">Nova categoria</p>
          <p className="text-xs text-white/50">Adicione uma categoria para serviços</p>
        </div>
      </header>

      <section className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="text-sm text-white/70">
            Nome da categoria
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
            />
          </label>

          <label className="text-sm text-white/70">
            Ícone
            <input
              type="file"
              accept="image/*"
              onChange={handleIconChange}
              className="mt-1 w-full rounded-2xl border border-dashed border-white/15 bg-transparent px-4 py-3 text-sm text-white/70 outline-none file:mr-4 file:rounded-2xl file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black"
            />
          </label>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-2 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Criar categoria"
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
