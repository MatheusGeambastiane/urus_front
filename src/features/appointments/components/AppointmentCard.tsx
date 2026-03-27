"use client";

import { useRef, useState } from "react";
import { Loader2, UserRound } from "lucide-react";
import { formatCurrency } from "@/src/features/shared/utils/money";
import { getPaymentTypeLabel, priceStatusColor } from "@/src/features/finances/utils/finances";
import type { AppointmentItem } from "@/src/features/appointments/types";

type AppointmentCardProps = {
  appointment: AppointmentItem;
  onOpen: (appointmentId: number) => void;
  onComplete: (appointmentId: number) => Promise<void> | void;
  completing: boolean;
};

const getStatusDotColor = (status: string) => {
  const normalized = status?.toLowerCase();
  if (normalized === "realizado") return "bg-emerald-400";
  if (normalized === "iniciado") return "bg-sky-400";
  if (normalized === "cancelado") return "bg-rose-400";
  return "bg-amber-300";
};

const getTimelineColor = (status: string) => {
  const normalized = status?.toLowerCase();
  if (normalized === "realizado" || normalized === "cancelado") {
    return "border-neutral-900";
  }
  return "border-neutral-800";
};

const getStatusBorderColor = (status: string) => {
  const normalized = status?.toLowerCase();
  if (normalized === "realizado") return "border-emerald-400/60";
  if (normalized === "iniciado") return "border-sky-400/60";
  if (normalized === "cancelado") return "border-rose-400/60";
  return "border-amber-300/60";
};

export function AppointmentCard({ appointment, onOpen, onComplete, completing }: AppointmentCardProps) {
  const [dragX, setDragX] = useState(0);
  const [isPointerActive, setIsPointerActive] = useState(false);
  const startXRef = useRef(0);
  const didDragRef = useRef(false);
  const suppressClickRef = useRef(false);

  const isSwipeEnabled = appointment.status !== "realizado" && appointment.status !== "cancelado";

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (event) => {
    if (!isSwipeEnabled || completing) {
      return;
    }
    startXRef.current = event.clientX;
    didDragRef.current = false;
    setIsPointerActive(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = (event) => {
    if (!isPointerActive || !isSwipeEnabled || completing) {
      return;
    }
    const delta = Math.max(0, event.clientX - startXRef.current);
    if (delta > 4) {
      didDragRef.current = true;
    }
    setDragX(Math.min(delta, 132));
  };

  const handlePointerEnd: React.PointerEventHandler<HTMLDivElement> = async () => {
    if (!isSwipeEnabled || completing) {
      setDragX(0);
      setIsPointerActive(false);
      return;
    }

    const shouldComplete = dragX >= 96;
    suppressClickRef.current = didDragRef.current;
    setIsPointerActive(false);
    setDragX(0);

    if (shouldComplete) {
      suppressClickRef.current = true;
      await onComplete(appointment.id);
    }
  };

  const handleClick = () => {
    if (completing) {
      return;
    }

    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    onOpen(appointment.id);
  };

  const time = new Date(appointment.date_time).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const mainService = appointment.services[0];
  const paymentLabel = getPaymentTypeLabel(appointment.payment_type as never) || "Sem pagamento";
  const priceClass = priceStatusColor(appointment.status);
  const professionalName = appointment.professional_name ?? "Profissional";

  return (
    <div className={`relative pl-8 pb-8 ${getTimelineColor(appointment.status)} border-l`}>
      <div
        className={`absolute left-[-6px] top-1 h-3 w-3 rounded-full border-2 border-white bg-black`}
      />

      <div className="relative overflow-hidden rounded-[28px]">
        {isSwipeEnabled ? (
          <div className="absolute inset-y-0 left-0 flex w-[132px] items-center justify-center rounded-[28px] bg-emerald-500/20 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
            {completing ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando
              </span>
            ) : (
              "Arraste para concluir"
            )}
          </div>
        ) : null}

        <div
          className="relative z-10 cursor-pointer touch-pan-y transition-transform duration-200"
          style={{ transform: `translateX(${dragX}px)` }}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
        >
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="text-lg font-medium tracking-tight text-white">{time}</span>
            <span className={`rounded-full bg-neutral-900 px-2.5 py-1 text-xs font-medium ${priceClass}`}>
              {formatCurrency(appointment.price_paid)}
            </span>
          </div>

          <div className={`rounded-[28px] border bg-[#0f0f0f] p-5 transition-colors hover:bg-[#141414] ${getStatusBorderColor(appointment.status)}`}>
            <h3 className="text-base font-medium tracking-tight text-white">
              {appointment.client_name ?? "Cliente"}
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              {mainService?.name || "Serviço"} • {paymentLabel}
            </p>

            <div className="mt-5 flex items-center justify-between border-t border-neutral-900 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-neutral-800 text-neutral-400">
                  {appointment.professional_profile_pic ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={appointment.professional_profile_pic}
                      alt={professionalName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound className="h-3.5 w-3.5" />
                  )}
                </div>
                <span className="text-xs font-medium text-neutral-400">
                  {professionalName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${getStatusDotColor(appointment.status)}`} />
                <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
                  {appointment.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
