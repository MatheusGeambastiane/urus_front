"use client";

import { Clock3, Scissors, UserRound } from "lucide-react";
import type { AppointmentItem } from "@/src/features/appointments/types";
import type { ServiceOption } from "@/src/features/services/types";
import { formatDateParam } from "@/src/features/shared/utils/date";

type AppointmentScheduleGridProps = {
  appointments: AppointmentItem[];
  professionals: ServiceOption[];
  selectedDate: Date;
  professionalFilterId: string | null;
  onOpen: (appointmentId: number) => void;
};

type PositionedAppointment = {
  appointment: AppointmentItem;
  start: Date;
  finish: Date;
  lane: number;
  laneCount: number;
};

const MINUTES_PER_SLOT = 30;
const PIXELS_PER_MINUTE = 1.4;
const PROFESSIONAL_COLUMN_WIDTH = 190;
const TIME_COLUMN_WIDTH = 72;

const minutesFromStartOfDay = (date: Date) => date.getHours() * 60 + date.getMinutes();

const appointmentBounds = (appointment: AppointmentItem) => {
  const start = new Date(appointment.start_datetime ?? appointment.date_time);
  const rawFinish = appointment.finish_datetime ? new Date(appointment.finish_datetime) : null;
  const finish = rawFinish && rawFinish.getTime() > start.getTime()
    ? rawFinish
    : new Date(start.getTime() + 45 * 60_000);
  return { start, finish };
};

const positionOverlappingAppointments = (appointments: AppointmentItem[]): PositionedAppointment[] => {
  const sorted = appointments
    .map((appointment) => ({ appointment, ...appointmentBounds(appointment) }))
    .sort((left, right) => left.start.getTime() - right.start.getTime());
  const positioned: PositionedAppointment[] = [];

  let cluster: Array<Omit<PositionedAppointment, "laneCount">> = [];
  let clusterFinish = 0;

  const flushCluster = () => {
    if (cluster.length === 0) return;
    const laneCount = Math.max(...cluster.map((item) => item.lane)) + 1;
    positioned.push(...cluster.map((item) => ({ ...item, laneCount })));
    cluster = [];
    clusterFinish = 0;
  };

  sorted.forEach((item) => {
    if (cluster.length > 0 && item.start.getTime() >= clusterFinish) {
      flushCluster();
    }

    const laneFinishes: number[] = [];
    cluster.forEach((clusterItem) => {
      laneFinishes[clusterItem.lane] = Math.max(
        laneFinishes[clusterItem.lane] ?? 0,
        clusterItem.finish.getTime(),
      );
    });
    const availableLane = laneFinishes.findIndex((finish) => finish <= item.start.getTime());
    const lane = availableLane === -1 ? laneFinishes.length : availableLane;
    cluster.push({ ...item, lane });
    clusterFinish = Math.max(clusterFinish, item.finish.getTime());
  });

  flushCluster();
  return positioned;
};

const statusClasses = (status: string) => {
  if (status === "realizado") return "border-emerald-300/40 bg-emerald-400/15 text-emerald-50";
  if (status === "iniciado") return "border-sky-300/50 bg-sky-400/20 text-sky-50";
  if (status === "cancelado") return "border-rose-300/30 bg-rose-400/10 text-rose-100 opacity-60";
  return "border-amber-200/40 bg-amber-300/15 text-amber-50";
};

const formatTime = (date: Date) => date.toLocaleTimeString("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

export function AppointmentScheduleGrid({
  appointments,
  professionals,
  selectedDate,
  professionalFilterId,
  onOpen,
}: AppointmentScheduleGridProps) {
  const selectedDateKey = formatDateParam(selectedDate);
  const dayAppointments = appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.start_datetime ?? appointment.date_time);
    return formatDateParam(appointmentDate) === selectedDateKey;
  });

  const appointmentProfessionals = dayAppointments.reduce<ServiceOption[]>((items, appointment) => {
    if (!appointment.professional || items.some((item) => item.id === appointment.professional)) return items;
    return [...items, { id: appointment.professional, name: appointment.professional_name ?? "Profissional" }];
  }, []);
  const allProfessionals = [...professionals];
  appointmentProfessionals.forEach((professional) => {
    if (!allProfessionals.some((item) => item.id === professional.id)) allProfessionals.push(professional);
  });
  const visibleProfessionals = allProfessionals
    .filter((professional) => !professionalFilterId || String(professional.id) === professionalFilterId)
    .sort((left, right) => left.name.localeCompare(right.name, "pt-BR"));

  if (visibleProfessionals.length === 0) {
    return (
      <div className="rounded-[28px] border border-white/8 bg-[#0b0b0b] px-5 py-10 text-center">
        <UserRound className="mx-auto h-6 w-6 text-white/35" />
        <p className="mt-3 text-sm text-white/60">Nenhum profissional disponível para montar a grade.</p>
      </div>
    );
  }

  const bounds = dayAppointments.map(appointmentBounds);
  const defaultFinish = selectedDate.getDay() === 6 ? 18 * 60 : 20 * 60;
  const scheduleStart = Math.min(9 * 60, ...bounds.map(({ start }) => Math.floor(minutesFromStartOfDay(start) / 60) * 60));
  const scheduleFinish = Math.max(
    defaultFinish,
    ...bounds.map(({ finish }) => Math.ceil(minutesFromStartOfDay(finish) / 60) * 60),
  );
  const durationMinutes = Math.max(scheduleFinish - scheduleStart, 60);
  const scheduleHeight = durationMinutes * PIXELS_PER_MINUTE;
  const timeMarkers = Array.from(
    { length: Math.floor(durationMinutes / MINUTES_PER_SLOT) + 1 },
    (_, index) => scheduleStart + index * MINUTES_PER_SLOT,
  );
  const minimumWidth = TIME_COLUMN_WIDTH + visibleProfessionals.length * PROFESSIONAL_COLUMN_WIDTH;
  const gridTemplateColumns = `${TIME_COLUMN_WIDTH}px repeat(${visibleProfessionals.length}, minmax(${PROFESSIONAL_COLUMN_WIDTH}px, 1fr))`;
  const now = new Date();
  const showNow = formatDateParam(now) === selectedDateKey
    && minutesFromStartOfDay(now) >= scheduleStart
    && minutesFromStartOfDay(now) <= scheduleFinish;

  return (
    <section className="overflow-hidden rounded-[30px] border border-white/10 bg-[#090909] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between gap-3 border-b border-white/8 px-5 py-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35">Visão diária</p>
          <p className="mt-1 text-sm font-medium text-white/80">
            {selectedDate.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/55">
          <Clock3 className="h-3.5 w-3.5" />
          Blocos de 30 min
        </span>
      </div>

      <div className="max-h-[72vh] overflow-auto overscroll-contain">
        <div style={{ minWidth: minimumWidth }}>
          <div
            className="sticky top-0 z-30 grid border-b border-white/10 bg-[#0d0d0d]/95 backdrop-blur-xl"
            style={{ gridTemplateColumns }}
          >
            <div className="sticky left-0 z-40 border-r border-white/8 bg-[#0d0d0d]" />
            {visibleProfessionals.map((professional) => (
              <div key={professional.id} className="flex min-h-16 items-center gap-2 border-r border-white/8 px-4 last:border-r-0">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/8 text-white/60">
                  <UserRound className="h-4 w-4" />
                </span>
                <span className="truncate text-sm font-semibold text-white">{professional.name}</span>
              </div>
            ))}
          </div>

          <div className="relative grid" style={{ gridTemplateColumns, height: scheduleHeight }}>
            <div className="sticky left-0 z-20 border-r border-white/10 bg-[#090909]">
              {timeMarkers.map((minute) => {
                const isFullHour = minute % 60 === 0;
                const hour = Math.floor(minute / 60);
                const minutePart = minute % 60;
                return (
                  <span
                    key={minute}
                    className={`absolute right-3 -translate-y-1/2 tabular-nums ${isFullHour ? "text-xs text-white/55" : "text-[10px] text-white/25"}`}
                    style={{ top: (minute - scheduleStart) * PIXELS_PER_MINUTE }}
                  >
                    {String(hour).padStart(2, "0")}:{String(minutePart).padStart(2, "0")}
                  </span>
                );
              })}
            </div>

            {visibleProfessionals.map((professional) => {
              const professionalAppointments = positionOverlappingAppointments(
                dayAppointments.filter((appointment) => appointment.professional === professional.id),
              );
              return (
                <div
                  key={professional.id}
                  className="relative border-r border-white/8 last:border-r-0"
                  style={{
                    backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${MINUTES_PER_SLOT * PIXELS_PER_MINUTE - 1}px, rgba(255,255,255,0.07) ${MINUTES_PER_SLOT * PIXELS_PER_MINUTE - 1}px, rgba(255,255,255,0.07) ${MINUTES_PER_SLOT * PIXELS_PER_MINUTE}px)`,
                  }}
                >
                  {professionalAppointments.map(({ appointment, start, finish, lane, laneCount }) => {
                    const top = Math.max(0, (minutesFromStartOfDay(start) - scheduleStart) * PIXELS_PER_MINUTE);
                    const height = Math.max(34, (finish.getTime() - start.getTime()) / 60_000 * PIXELS_PER_MINUTE - 3);
                    const width = 100 / laneCount;
                    const servicesLabel = appointment.services.map((service) => service.name).join(", ");
                    return (
                      <button
                        type="button"
                        key={appointment.id}
                        onClick={() => onOpen(appointment.id)}
                        className={`absolute overflow-hidden rounded-xl border px-2.5 py-2 text-left shadow-lg transition hover:z-20 hover:brightness-125 focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${statusClasses(appointment.status)}`}
                        style={{
                          top,
                          height,
                          left: `calc(${lane * width}% + 3px)`,
                          width: `calc(${width}% - 6px)`,
                        }}
                        title={`${formatTime(start)}–${formatTime(finish)} · ${appointment.client_name ?? "Cliente"} · ${servicesLabel}`}
                      >
                        <p className="truncate text-[11px] font-semibold tabular-nums opacity-75">
                          {formatTime(start)}–{formatTime(finish)}
                        </p>
                        <p className="mt-0.5 truncate text-xs font-semibold">{appointment.client_name ?? "Cliente"}</p>
                        {height >= 58 ? (
                          <p className="mt-1 flex items-center gap-1 truncate text-[10px] opacity-70">
                            <Scissors className="h-3 w-3 shrink-0" />
                            <span className="truncate">{servicesLabel || "Sem serviço"}</span>
                          </p>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              );
            })}

            {showNow ? (
              <div
                className="pointer-events-none absolute left-0 right-0 z-20 border-t border-rose-400"
                style={{ top: (minutesFromStartOfDay(now) - scheduleStart) * PIXELS_PER_MINUTE }}
              >
                <span className="absolute -left-1 -top-1.5 h-3 w-3 rounded-full bg-rose-400 shadow-[0_0_16px_rgba(251,113,133,0.8)]" />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
