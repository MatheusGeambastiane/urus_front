"use client";

import { ArrowUpRight, Clock3 } from "lucide-react";

type ClientLastAppointmentCardProps = {
  dateLabel: string;
  onOpen: () => void;
};

export function ClientLastAppointmentCard({
  dateLabel,
  onOpen,
}: ClientLastAppointmentCardProps) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-amber-300/20 bg-[linear-gradient(135deg,rgba(255,214,102,0.18),rgba(12,12,12,0.98)_42%,rgba(12,12,12,1))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-amber-300/12 blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-amber-200/40 to-transparent" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100/85">
            <Clock3 className="h-3.5 w-3.5" />
            Jornada do cliente
          </div>

          <div>
            <p className="text-xl font-semibold text-white">Ver último atendimento do cliente</p>
            <p className="mt-1 text-sm text-white/60">
              Último atendimento concluído em{" "}
              <span className="font-medium text-amber-100">{dateLabel}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:scale-[1.02] hover:bg-amber-100"
        >
          Abrir
          <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>
    </section>
  );
}
