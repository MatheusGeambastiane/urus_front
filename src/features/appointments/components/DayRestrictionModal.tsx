"use client";

import { Modal } from "@/components/ui/Modal";

type DayRestrictionForm = {
  startDate: string;
  finishDate: string;
  startTime: string;
  finishTime: string;
  isAllDay: boolean;
};

type DayRestrictionModalProps = {
  open: boolean;
  form: DayRestrictionForm;
  error: string | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onChange: (updater: (current: DayRestrictionForm) => DayRestrictionForm) => void;
};

export function DayRestrictionModal({
  open,
  form,
  error,
  submitting,
  onClose,
  onSubmit,
  onChange,
}: DayRestrictionModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Nova restrição" subtitle="Agenda">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm text-white/70">
            Data inicial
            <input
              type="date"
              value={form.startDate}
              onChange={(event) =>
                onChange((current) => ({
                  ...current,
                  startDate: event.target.value,
                }))
              }
              className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
            />
          </label>
          <label className="block text-sm text-white/70">
            Data final
            <input
              type="date"
              value={form.finishDate}
              onChange={(event) =>
                onChange((current) => ({
                  ...current,
                  finishDate: event.target.value,
                }))
              }
              className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
            />
          </label>
        </div>

        <label className="flex items-center gap-3 text-sm text-white/70">
          <input
            type="checkbox"
            checked={form.isAllDay}
            onChange={(event) =>
              onChange((current) => ({
                ...current,
                isAllDay: event.target.checked,
              }))
            }
            className="h-4 w-4 rounded border border-white/20 bg-transparent text-black"
          />
          Bloquear o dia inteiro
        </label>

        {!form.isAllDay ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm text-white/70">
              Hora inicial
              <input
                type="time"
                value={form.startTime}
                onChange={(event) =>
                  onChange((current) => ({
                    ...current,
                    startTime: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
              />
            </label>
            <label className="block text-sm text-white/70">
              Hora final
              <input
                type="time"
                value={form.finishTime}
                onChange={(event) =>
                  onChange((current) => ({
                    ...current,
                    finishTime: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
              />
            </label>
          </div>
        ) : null}

        {error ? (
          <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
          >
            {submitting ? "Adicionando..." : "Adicionar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
