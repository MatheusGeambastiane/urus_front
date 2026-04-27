"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, Loader2, Scissors, UserRound } from "lucide-react";
import { formatCurrency, parseCurrencyInput } from "@/src/features/shared/utils/money";
import { getPaymentTypeLabel, paymentTypeOptions, priceStatusColor } from "@/src/features/finances/utils/finances";
import { normalizeApiPaymentTypeToUi } from "@/src/features/appointments/utils/appointments";
import type { AppointmentItem } from "@/src/features/appointments/types";
import type { ServiceSimpleOption } from "@/src/features/services/types";
import type { PaymentType } from "@/src/shared/types/payment";

type AppointmentCardProps = {
  appointment: AppointmentItem;
  servicesList: ServiceSimpleOption[];
  onOpen: (appointmentId: number) => void;
  onComplete: (appointmentId: number, paymentType: PaymentType, serviceIds: number[]) => Promise<void> | void;
  onReopen: (appointmentId: number) => Promise<void> | void;
  completing: boolean;
};

type SelectorMode = "payment" | "services" | null;

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

export function AppointmentCard({
  appointment,
  servicesList,
  onOpen,
  onComplete,
  onReopen,
  completing,
}: AppointmentCardProps) {
  const [dragX, setDragX] = useState(0);
  const [isPointerActive, setIsPointerActive] = useState(false);
  const [showCompleteActions, setShowCompleteActions] = useState(false);
  const [selectorMode, setSelectorMode] = useState<SelectorMode>(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType>(
    normalizeApiPaymentTypeToUi(appointment.payment_type) ?? "pix",
  );
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>(appointment.services.map((service) => service.id));
  const startXRef = useRef(0);
  const didDragRef = useRef(false);
  const suppressClickRef = useRef(false);

  const canSwipeRight = appointment.status !== "realizado" && appointment.status !== "cancelado";
  const canSwipeLeft = appointment.status === "realizado";
  const isSwipeEnabled = canSwipeRight || canSwipeLeft;

  useEffect(() => {
    setSelectedPaymentType(normalizeApiPaymentTypeToUi(appointment.payment_type) ?? "pix");
  }, [appointment.payment_type]);

  useEffect(() => {
    setSelectedServiceIds(appointment.services.map((service) => service.id));
  }, [appointment.services]);

  useEffect(() => {
    if (appointment.status === "realizado" || appointment.status === "cancelado") {
      setShowCompleteActions(false);
      setSelectorMode(null);
    }
  }, [appointment.status]);

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
    const rawDelta = event.clientX - startXRef.current;
    if (showCompleteActions) {
      const delta = Math.min(rawDelta, 0);
      if (Math.abs(delta) > 4) {
        didDragRef.current = true;
      }
      setDragX(Math.max(delta, -132));
      return;
    }
    const delta = canSwipeLeft && !canSwipeRight ? Math.min(rawDelta, 0) : Math.max(rawDelta, 0);
    if (Math.abs(delta) > 4) {
      didDragRef.current = true;
    }
    if (delta >= 0) {
      setDragX(Math.min(delta, 132));
      return;
    }
    setDragX(Math.max(delta, -132));
  };

  const handlePointerEnd: React.PointerEventHandler<HTMLDivElement> = async () => {
    if (!isSwipeEnabled || completing) {
      setDragX(0);
      setIsPointerActive(false);
      return;
    }

    if (showCompleteActions) {
      const shouldCloseActions = dragX <= -48;
      suppressClickRef.current = didDragRef.current;
      setIsPointerActive(false);
      setDragX(0);
      if (shouldCloseActions) {
        setShowCompleteActions(false);
        setSelectorMode(null);
      }
      return;
    }

    const shouldComplete = canSwipeRight && dragX >= 96;
    const shouldReopen = canSwipeLeft && dragX <= -96;
    suppressClickRef.current = didDragRef.current;
    setIsPointerActive(false);
    setDragX(0);

    if (shouldComplete) {
      suppressClickRef.current = true;
      setShowCompleteActions(true);
      setSelectorMode(null);
      return;
    }

    if (shouldReopen) {
      suppressClickRef.current = true;
      await onReopen(appointment.id);
    }
  };

  const handleClick = () => {
    if (completing || showCompleteActions) {
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
  const selectedPaymentOption = paymentTypeOptions.find((option) => option.value === selectedPaymentType);
  const SelectedPaymentIcon = selectedPaymentOption?.icon;
  const priceClass = priceStatusColor(appointment.status);
  const professionalName = appointment.professional_name ?? "Profissional";
  const shouldEnableSwipeHandlers = !showCompleteActions;
  const selectedServices = servicesList.filter((service) => selectedServiceIds.includes(service.id));
  const selectedServicesLabel = selectedServices.length > 0
    ? selectedServices.map((service) => service.name).join(", ")
    : "Selecionar serviço";
  const selectedServicesTotal = selectedServices.reduce(
    (total, service) => total + parseCurrencyInput(service.price ?? "0"),
    0,
  );
  const displayPrice = showCompleteActions && selectedServices.length > 0
    ? selectedServicesTotal.toFixed(2)
    : appointment.price_paid;

  return (
    <div className={`relative pl-8 pb-8 ${getTimelineColor(appointment.status)} border-l`}>
      <div
        className={`absolute left-[-6px] top-1 h-3 w-3 rounded-full border-2 border-white bg-black`}
      />

      <div className="relative overflow-hidden rounded-[28px]">
        {canSwipeRight ? (
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

        {canSwipeLeft ? (
          <div className="absolute inset-y-0 right-0 flex w-[132px] items-center justify-center rounded-[28px] bg-amber-400/20 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100">
            {completing ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando
              </span>
            ) : (
              "Arraste para reagendar"
            )}
          </div>
        ) : null}

        <div
          className={`relative z-10 transition-transform duration-200 ${showCompleteActions ? "" : "cursor-pointer touch-pan-y"}`}
          style={{ transform: `translateX(${dragX}px)` }}
          onClick={handleClick}
          onPointerDown={shouldEnableSwipeHandlers ? handlePointerDown : undefined}
          onPointerMove={shouldEnableSwipeHandlers ? handlePointerMove : undefined}
          onPointerUp={shouldEnableSwipeHandlers ? handlePointerEnd : undefined}
          onPointerCancel={shouldEnableSwipeHandlers ? handlePointerEnd : undefined}
        >
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="text-lg font-medium tracking-tight text-white">{time}</span>
            <span className={`rounded-full bg-neutral-900 px-2.5 py-1 text-xs font-medium ${priceClass}`}>
              {formatCurrency(displayPrice)}
            </span>
          </div>

          <div className={`rounded-[28px] border bg-[#0f0f0f] p-5 transition-colors hover:bg-[#141414] ${getStatusBorderColor(appointment.status)}`}>
            {showCompleteActions && canSwipeRight ? (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-medium tracking-tight text-white">
                      {appointment.client_name ?? "Cliente"}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-emerald-300/70">
                      Finalizar atendimento
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCompleteActions(false);
                      setSelectorMode(null);
                    }}
                    disabled={completing}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 text-white/70 transition hover:border-white/20 hover:text-white disabled:opacity-60"
                    aria-label="Fechar confirmação"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </div>

                <div
                  className={`grid overflow-hidden transition-all duration-300 ease-out ${
                    selectorMode !== null
                      ? "grid-rows-[0fr] opacity-0 -translate-y-2"
                      : "grid-rows-[1fr] opacity-100 translate-y-0"
                  }`}
                >
                  <div className="min-h-0">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectorMode("services")}
                        disabled={completing}
                        className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition hover:border-white/20 hover:bg-white/[0.05] disabled:opacity-60"
                      >
                        <Scissors className="h-4.5 w-4.5 text-white/70" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">
                            {selectedServicesLabel}
                          </p>
                          <p className="truncate text-xs text-neutral-500">
                            {selectedServices.length > 1 ? `${selectedServices.length} serviços selecionados` : "Serviço do agendamento"}
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => void onComplete(appointment.id, selectedPaymentType, selectedServiceIds)}
                        disabled={completing}
                        className="flex h-full min-h-[60px] w-[60px] items-center justify-center rounded-[22px] border border-emerald-400/60 bg-emerald-500/10 text-emerald-300 transition hover:bg-emerald-500/15 disabled:opacity-60"
                        aria-label="Confirmar atendimento realizado"
                      >
                        {completing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className={`grid overflow-hidden transition-all duration-300 ease-out ${
                    selectorMode === "services"
                      ? "grid-rows-[1fr] opacity-100 translate-y-0"
                      : "grid-rows-[0fr] opacity-0 translate-y-2"
                  }`}
                >
                  <div className="min-h-0">
                    <div className="space-y-3">
                      <div className="max-h-56 overflow-y-auto pr-1">
                        <div className="grid gap-2">
                          {servicesList.map((service) => {
                            const isActive = selectedServiceIds.includes(service.id);
                            return (
                              <button
                                type="button"
                                key={service.id}
                                onClick={() => {
                                  setSelectedServiceIds((current) => {
                                    if (current.includes(service.id)) {
                                      return current.filter((serviceId) => serviceId !== service.id);
                                    }
                                    return [...current, service.id];
                                  });
                                }}
                                className={`flex items-center justify-between gap-3 rounded-[22px] border px-4 py-3 text-left transition ${
                                  isActive
                                    ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-200"
                                    : "border-white/10 bg-white/[0.03] text-white/75 hover:border-white/20 hover:text-white"
                                }`}
                              >
                                <span className="min-w-0 truncate text-sm font-medium">{service.name}</span>
                                <span
                                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                    isActive ? "border-emerald-300 text-emerald-300" : "border-white/20 text-transparent"
                                  }`}
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectorMode(null)}
                        disabled={completing || selectedServiceIds.length === 0}
                        className="flex h-[52px] w-full items-center justify-center rounded-[22px] border border-emerald-400/60 bg-emerald-500/10 text-emerald-300 transition hover:bg-emerald-500/15 disabled:opacity-60"
                        aria-label="Confirmar seleção de serviços"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className={`grid overflow-hidden transition-all duration-300 ease-out ${
                    selectorMode === "payment"
                      ? "grid-rows-[1fr] opacity-100 translate-y-0"
                      : "grid-rows-[0fr] opacity-0 translate-y-2"
                  }`}
                >
                  <div className="min-h-0">
                    <div className="grid grid-cols-2 gap-2">
                      {paymentTypeOptions.map((option) => {
                        const Icon = option.icon;
                        const isActive = option.value === selectedPaymentType;
                        return (
                          <button
                            type="button"
                            key={option.value}
                            onClick={() => {
                              setSelectedPaymentType(option.value);
                              setSelectorMode(null);
                            }}
                            className={`flex items-center gap-3 rounded-[22px] border px-4 py-3 text-left transition ${
                              isActive
                                ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-200"
                                : "border-white/10 bg-white/[0.03] text-white/75 hover:border-white/20 hover:text-white"
                            }`}
                          >
                            <Icon className="h-4.5 w-4.5" />
                            <span className="text-sm font-medium">{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {selectorMode !== "payment" ? (
                  <button
                    type="button"
                    onClick={() => setSelectorMode("payment")}
                    disabled={completing}
                    className={`flex w-full items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition hover:border-white/20 hover:bg-white/[0.05] disabled:opacity-60 ${
                      selectorMode === "services" ? "pointer-events-none opacity-0" : ""
                    }`}
                  >
                    {SelectedPaymentIcon ? <SelectedPaymentIcon className="h-4.5 w-4.5 text-emerald-300" /> : null}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {selectedPaymentOption?.label ?? "Selecionar método"}
                      </p>
                      <p className="truncate text-xs text-neutral-500">
                        Forma de pagamento
                      </p>
                    </div>
                  </button>
                ) : null}
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
