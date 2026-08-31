"use client";

import { CalendarClock } from "lucide-react";
import type { SummaryNextAppointment } from "@/src/features/home/types";

type NextAppointmentCardProps = {
  nextAppointment: SummaryNextAppointment | null;
  loading: boolean;
  dateLabel: string;
  timeLabel: string;
};

export function NextAppointmentCard({
  nextAppointment,
  loading,
  dateLabel,
  timeLabel,
}: NextAppointmentCardProps) {
  return (
    <section className="rounded-[28px] border border-white/8 bg-[#090909] p-5 shadow-card lg:h-full lg:rounded-[20px] lg:border-[#e5e7eb]/15 lg:bg-[linear-gradient(145deg,#0a0a0a,#0a0a0a)]">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black lg:rounded-xl lg:bg-[#e5e7eb] lg:text-[#0a0a0a] lg:shadow-[0_12px_30px_rgba(255,255,255,0.16)]">
          <CalendarClock className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/40 lg:text-[#e5e7eb]/70">
            Próximo atendimento
          </p>
          {loading ? (
            <p className="mt-3 text-sm text-white/60">Carregando...</p>
          ) : nextAppointment ? (
            <>
              <p className="home-display mt-2 text-xl font-semibold tracking-tight text-white lg:break-words lg:text-2xl lg:leading-tight">
                {timeLabel} • {nextAppointment.client_name}
              </p>
              <p className="mt-1 text-sm text-white/55 lg:break-words lg:leading-relaxed">
                {dateLabel} • com {nextAppointment.professional_name}
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-white/60">Nenhum agendamento encontrado.</p>
          )}
        </div>
      </div>
    </section>
  );
}
