"use client";

import { CalendarClock, ChevronLeft, ChevronRight, Loader2, Scissors } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ClientHistorySummary, UserDetail } from "@/src/features/users/types";
import { formatCurrency } from "@/src/features/shared/utils/money";

type ClientHistoryScreenProps = {
  userDetail: UserDetail | null;
  clientHistoryData: ClientHistorySummary | null;
  clientHistoryLoading: boolean;
  clientHistoryError: string | null;
  onBack: () => void;
};

const appointmentStatusClasses: Record<string, string> = {
  agendado: "border-sky-300/20 bg-sky-300/10 text-sky-100",
  iniciado: "border-amber-300/20 bg-amber-300/10 text-amber-100",
  realizado: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
  cancelado: "border-red-300/20 bg-red-300/10 text-red-100",
};

const formatAppointmentDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data não informada";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function ClientHistoryScreen({
  userDetail,
  clientHistoryData,
  clientHistoryLoading,
  clientHistoryError,
  onBack,
}: ClientHistoryScreenProps) {
  const router = useRouter();
  const appointments = userDetail?.appointments ?? [];

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center justify-between">
        <button
          type="button"
          className="mr-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-white/40 hover:text-white"
          onClick={onBack}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 text-center">
          <p className="text-sm text-white/60">Cliente</p>
          <p className="text-xl font-semibold">
            Histórico de {userDetail?.first_name} {userDetail?.last_name}
          </p>
        </div>
      </header>

      {clientHistoryLoading ? (
        <div className="flex min-h-[200px] flex-1 items-center justify-center rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 text-white/70">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="ml-2 text-sm">Carregando histórico...</p>
        </div>
      ) : clientHistoryError ? (
        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
          {clientHistoryError}
        </div>
      ) : clientHistoryData ? (
        <>
          <section className="grid gap-4 min-[320px]:grid-cols-2">
            <article className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
              <p className="text-sm text-white/60">Total de serviços</p>
              <p className="mt-2 text-xl font-semibold">{clientHistoryData.total_appointments}</p>
            </article>
            <article className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
              <p className="text-sm text-white/60">Total gasto</p>
              <p className="mt-2 text-xl font-semibold">
                R$ {Number(clientHistoryData.total_paid_completed).toFixed(2)}
              </p>
            </article>
          </section>

          <section className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
            <h3 className="text-lg font-semibold">Atendimentos por profissional</h3>
            <ul className="mt-4 space-y-2">
              {clientHistoryData.appointments_by_professional.length === 0 ? (
                <li className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/60">
                  Nenhum atendimento encontrado.
                </li>
              ) : (
                clientHistoryData.appointments_by_professional.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3"
                  >
                    <span className="text-sm text-white/80">{item.name}</span>
                    <span className="text-sm font-semibold text-white">{item.count}</span>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
            <h3 className="text-lg font-semibold">Atendimentos por serviço</h3>
            <ul className="mt-4 space-y-2">
              {clientHistoryData.appointments_by_service.length === 0 ? (
                <li className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/60">
                  Nenhum serviço encontrado.
                </li>
              ) : (
                clientHistoryData.appointments_by_service.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3"
                  >
                    <span className="text-sm text-white/80">{item.name}</span>
                    <span className="text-sm font-semibold text-white">{item.count}</span>
                  </li>
                ))
              )}
            </ul>
          </section>
        </>
      ) : null}

      <section className="overflow-hidden rounded-3xl border border-white/5 bg-[#0b0b0b]">
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-4">
          <div>
            <p className="text-sm text-white/55">Linha do tempo completa</p>
            <h3 className="text-lg font-semibold text-white">Todos os agendamentos</h3>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-white/65">
            {appointments.length} registro{appointments.length === 1 ? "" : "s"}
          </span>
        </div>

        {appointments.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-10 text-center text-white/45">
            <CalendarClock className="h-6 w-6" />
            <p className="mt-3 text-sm">Nenhum agendamento encontrado para este cliente.</p>
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {appointments.map((appointment) => {
              const servicesLabel = appointment.services.map((service) => service.name).join(" · ");
              return (
                <li key={appointment.id} className="[content-visibility:auto] [contain-intrinsic-size:96px]">
                  <button
                    type="button"
                    onClick={() => router.push(`/dashboard/agenda/${appointment.id}`)}
                    className="group grid w-full gap-3 px-5 py-4 text-left transition hover:bg-white/[0.045] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          {formatAppointmentDate(appointment.date_time)}
                        </span>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                            appointmentStatusClasses[appointment.status] ??
                            "border-white/10 bg-white/[0.06] text-white/60"
                          }`}
                        >
                          {appointment.status_display}
                        </span>
                      </div>
                      <p className="mt-2 flex items-center gap-2 truncate text-sm text-white/65">
                        <Scissors className="h-3.5 w-3.5 shrink-0 text-white/35" />
                        {servicesLabel || "Serviço não informado"}
                      </p>
                      <p className="mt-1 text-xs text-white/40">
                        {appointment.professional_name ?? "Profissional não informado"}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <span className="text-sm font-semibold text-white/80">
                        {formatCurrency(appointment.price_paid)}
                      </span>
                      <ChevronRight className="h-4 w-4 text-white/25 transition group-hover:translate-x-0.5 group-hover:text-white/70" />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
