"use client";

import { useState } from "react";
import { AlertTriangle, BadgeDollarSign, CalendarClock, Check, ChevronDown, ChevronLeft, ChevronRight, CircleCheckBig, CircleDollarSign, CircleOff, CircleX, ClipboardCheck, Clock3, Loader2, MessageSquareText, PenSquare, Percent, Play, Plus, Scissors, Search, ShoppingBag, Trash2, UserRound, UsersRound } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, parseCurrencyInput } from "@/src/features/shared/utils/money";
import { buildDateTimeISOString } from "@/src/features/shared/utils/date";
import { capitalizeFirstLetter } from "@/src/features/shared/utils/string";
import { getPaymentTypeLabel, paymentTypeOptions } from "@/src/features/finances/utils/finances";
import { useAppointmentForm } from "@/src/features/appointments/hooks/useAppointmentForm";
import {
  buildUnregisteredClientEmail,
  UNREGISTERED_CLIENT_PHONE_DISPLAY,
} from "@/src/features/users/utils/unregistered-client";
import type { PaymentType } from "@/src/shared/types/payment";

type AppointmentFormScreenProps = {
  form: ReturnType<typeof useAppointmentForm>;
  onBack: () => void;
};

const appointmentStatusOptions = [
  {
    value: "agendado",
    label: "Agendado",
    description: "Aguardando",
    icon: CalendarClock,
    iconClass: "text-white/65",
    activeClass: "border-white/25 bg-white/[0.08] text-white",
  },
  {
    value: "iniciado",
    label: "Iniciado",
    description: "Em andamento",
    icon: Play,
    iconClass: "text-sky-300/80",
    activeClass: "border-sky-300/30 bg-sky-300/[0.08] text-sky-50",
  },
  {
    value: "realizado",
    label: "Realizado",
    description: "Concluído",
    icon: CircleCheckBig,
    iconClass: "text-emerald-300/80",
    activeClass: "border-emerald-300/30 bg-emerald-300/[0.08] text-emerald-50",
  },
  {
    value: "cancelado",
    label: "Cancelado",
    description: "Encerrado",
    icon: CircleX,
    iconClass: "text-rose-300/75",
    activeClass: "border-rose-300/25 bg-rose-300/[0.07] text-rose-50",
  },
] as const;

const discountTypeOptions = [
  { value: "", label: "Sem desconto", icon: CircleOff },
  { value: "percentage", label: "Porcentagem", icon: Percent },
  { value: "fixed", label: "Valor fixo", icon: BadgeDollarSign },
] as const;

export function AppointmentFormScreen({ form, onBack }: AppointmentFormScreenProps) {
  const [collapsedSaleProductList, setCollapsedSaleProductList] = useState<{
    productId: number;
    searchInput: string;
  } | null>(null);
  const clientName = form.selectedClient
    ? [form.selectedClient.first_name, form.selectedClient.last_name].filter(Boolean).join(" ") ||
      form.selectedClient.email
    : "Selecionar";

  const professionalName = form.hasMultipleProfessionals
    ? "Múltiplos profissionais"
    : form.filledAppointmentProfessionals[0]?.professional?.name ?? "Selecionar";

  const paymentLabel = form.selectedPaymentType
    ? paymentTypeOptions.find((option) => option.value === form.selectedPaymentType)?.label ?? "Selecionar"
    : "Selecionar";
  const selectedStatusLabel = appointmentStatusOptions.find(
    (option) => option.value === form.selectedAppointmentStatus,
  )?.label;

  const appointmentDateTimeIso = buildDateTimeISOString(form.appointmentDateInput, form.appointmentTimeInput);
  const appointmentDateTimeLabel = appointmentDateTimeIso
    ? new Date(appointmentDateTimeIso).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Defina data e hora";

  const emailSuggestions = (() => {
    if (form.clientRegistrationForm.isUnregisteredClient) {
      return [];
    }
    const email = form.clientRegistrationForm.email.trim();
    const emailParts = email.split("@");
    const local = emailParts[0];
    const typedProvider = (emailParts[1] ?? "").toLowerCase();
    if (!form.showClientEmailSuggestions || !local || email.includes(" ") || emailParts.length > 2) {
      return [];
    }
    return ["gmail.com", "outlook.com", "hotmail.com"]
      .filter((domain) => domain.startsWith(typedProvider))
      .map((domain) => `${local}@${domain}`);
  })();

  const saleProductsListCollapsed = Boolean(
    form.saleModalOpen &&
    form.selectedSaleProductId &&
    collapsedSaleProductList?.productId === form.selectedSaleProductId &&
    collapsedSaleProductList.searchInput === form.saleProductsSearchInput,
  );
  const saleProductsListExpanded = !saleProductsListCollapsed;
  const visibleSaleProducts = form.selectedSaleProductId && saleProductsListCollapsed
    ? form.saleProductsList.filter((product) => product.id === form.selectedSaleProductId)
    : form.saleProductsList;

  const handleSaleProductListClick = (productId: number) => {
    if (form.selectedSaleProductId === productId && saleProductsListCollapsed) {
      setCollapsedSaleProductList(null);
      return;
    }

    form.handleSelectSaleProduct(productId);
    setCollapsedSaleProductList({
      productId,
      searchInput: form.saleProductsSearchInput,
    });
  };

  if (form.loadingExistingAppointment) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/10 bg-[#0b0b0b] px-8 py-10 text-white/70">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Carregando agendamento...</p>
        </div>
      </div>
    );
  }

  if (form.loadingExistingAppointmentError) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-white/40 hover:text-white"
          onClick={onBack}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-100">
          {form.loadingExistingAppointmentError}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 pb-24 sm:gap-5">
        <header className="grid grid-cols-[42px_1fr_42px] items-center rounded-[28px] border border-white/8 bg-[#0b0b0b]/80 p-3 shadow-[0_14px_45px_rgba(0,0,0,0.16)] backdrop-blur-xl">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.035] text-white/60 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            onClick={onBack}
            aria-label="Voltar para a agenda"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 px-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35">Agenda</p>
            <h1 className="mt-0.5 truncate text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {form.isEditingExistingAppointment ? "Editar agendamento" : "Novo agendamento"}
            </h1>
          </div>
          <div aria-hidden="true" />
        </header>

        <section className="rounded-[28px] border border-white/8 bg-[#0b0b0b] p-5 shadow-[0_16px_50px_rgba(0,0,0,0.18)]">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.045] text-white/60">
              <CalendarClock className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">Quando</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">Data e hora</h2>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="group rounded-[20px] border border-white/8 bg-white/[0.025] p-3 text-xs text-white/45 transition focus-within:border-white/25 focus-within:bg-white/[0.045]">
              <span className="mb-2 block">Data</span>
              <input
                type="date"
                value={form.appointmentDateInput}
                onChange={(event) => form.setAppointmentDateInput(event.target.value)}
                className="w-full bg-transparent py-1 text-sm font-semibold text-white outline-none [color-scheme:dark]"
              />
            </label>
            <label className="group rounded-[20px] border border-white/8 bg-white/[0.025] p-3 text-xs text-white/45 transition focus-within:border-white/25 focus-within:bg-white/[0.045]">
              <span className="mb-2 block">Hora</span>
              <input
                type="time"
                value={form.appointmentTimeInput}
                onChange={(event) => form.handleAppointmentTimeChange(event.target.value)}
                className="w-full bg-transparent py-1 text-sm font-semibold text-white outline-none [color-scheme:dark]"
              />
            </label>
          </div>
          {form.dayRestriction && !form.dayRestriction.is_all_day ? (
            <div className="mt-3 flex items-start gap-2 rounded-2xl border border-white/8 bg-white/[0.025] px-3 py-2.5 text-xs text-white/55">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/45" aria-hidden="true" />
              <p>
                Horário bloqueado neste dia: {new Date(form.dayRestriction.start_datetime).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })} às {new Date(form.dayRestriction.finish_datetime).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ) : null}
          {form.dayRestriction?.is_all_day ? (
            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.025] px-3 py-2.5 text-xs text-white/55">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-white/45" aria-hidden="true" />
              Existe uma restrição de dia inteiro para esta data.
            </div>
          ) : null}
        </section>

        <section className="rounded-[28px] border border-white/8 bg-[#0b0b0b] p-5 shadow-[0_16px_50px_rgba(0,0,0,0.18)]">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">Status</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">Situação do atendimento</h2>
              <p className="mt-1 text-xs text-white/40">Atualize conforme o atendimento avança.</p>
            </div>
            <span className="hidden rounded-full border border-white/8 bg-white/[0.035] px-3 py-1 text-[10px] font-medium text-white/40 sm:block">
              Atual: {selectedStatusLabel}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Status do atendimento">
            {appointmentStatusOptions.map((option) => {
              const isActive = option.value === form.selectedAppointmentStatus;
              const Icon = option.icon;
              return (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => form.setSelectedAppointmentStatus(option.value)}
                  aria-pressed={isActive}
                  className={`group relative min-h-24 rounded-[20px] border p-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
                    isActive
                      ? option.activeClass
                      : "border-white/7 bg-white/[0.025] text-white/55 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.045] hover:text-white motion-reduce:hover:transform-none"
                  }`}
                >
                  <span className={`flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.055] ${option.iconClass}`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="mt-3 block text-sm font-semibold leading-none">{option.label}</span>
                  <span className="mt-1.5 block text-[10px] text-current opacity-50">{option.description}</span>
                  <span
                    className={`absolute right-3 top-3 flex h-4.5 w-4.5 items-center justify-center rounded-full border transition ${
                      isActive
                        ? "border-current bg-current"
                        : "border-white/12 bg-transparent opacity-0 group-hover:opacity-50"
                    }`}
                    aria-hidden="true"
                  >
                    {isActive ? <Check className="h-3 w-3 text-black" /> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/8 bg-[#0b0b0b] p-5 shadow-[0_16px_50px_rgba(0,0,0,0.18)]">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.045] text-white/60">
                <Scissors className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">Serviços</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">Monte o combo ideal</h2>
              </div>
            </div>
            <button
              type="button"
              onClick={form.handleOpenServicesPickerModal}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-semibold text-white/70 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              <Plus className="h-4 w-4" />
              Selecionar
            </button>
          </div>
          {form.selectedAppointmentServices.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-white/10 bg-white/[0.015] px-4 py-7 text-center">
              <Scissors className="mx-auto h-5 w-5 text-white/20" aria-hidden="true" />
              <p className="mt-2 text-sm text-white/45">Nenhum serviço selecionado.</p>
            </div>
          ) : (
            <ul className="space-y-3 text-sm text-white/80">
              {form.selectedAppointmentServices.map((service) => {
                const assignment = form.serviceAssignments[service.id];
                const currentProfessional = form.appointmentProfessionals.find(
                  (slot) => slot.id === assignment?.professionalSlotId,
                )?.professional;
                return (
                  <li key={service.id} className="rounded-[22px] border border-white/8 bg-white/[0.025] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{service.name}</p>
                        <p className="mt-1 text-xs tabular-nums text-white/45">
                          {formatCurrency(assignment?.price ?? service.price ?? "0")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => form.handleRemoveAppointmentService(service.id)}
                        className="rounded-xl border border-white/8 p-2 text-white/35 transition hover:border-rose-300/20 hover:bg-rose-300/[0.05] hover:text-rose-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                        aria-label="Remover serviço"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <label className="rounded-2xl border border-white/7 bg-black/20 p-3 text-[10px] text-white/40 transition focus-within:border-white/20">
                        <span className="mb-1.5 block">Profissional responsável</span>
                        <select
                          value={assignment?.professionalSlotId ?? ""}
                          onChange={(event) =>
                            form.handleServiceAssignmentProfessionalChange(service.id, event.target.value || null)
                          }
                          className="w-full bg-transparent py-1 text-sm font-medium text-white outline-none"
                        >
                          <option value="" className="bg-[#111111]">Selecione</option>
                          {form.appointmentProfessionals
                            .filter((slot) => slot.professional)
                            .map((slot) => (
                              <option key={slot.id} value={slot.id} className="bg-[#111111]">
                                {slot.professional?.name}
                              </option>
                            ))}
                        </select>
                      </label>
                      <label className="rounded-2xl border border-white/7 bg-black/20 p-3 text-[10px] text-white/40 transition focus-within:border-white/20">
                        <span className="mb-1.5 block">Preço pago (R$)</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={assignment?.price ?? ""}
                          onChange={(event) => form.handleServiceAssignmentPriceChange(service.id, event)}
                          placeholder="0,00"
                          className="w-full bg-transparent py-1 text-sm font-semibold text-white tabular-nums outline-none placeholder:text-white/20"
                        />
                      </label>
                      <label className="rounded-2xl border border-white/7 bg-black/20 p-3 text-[10px] text-white/40 transition focus-within:border-white/20 sm:col-span-2">
                        <span className="mb-1.5 block">Gorjeta (R$)</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={assignment?.tips ?? ""}
                          onChange={(event) => form.handleServiceAssignmentTipsChange(service.id, event)}
                          placeholder="0,00"
                          className="w-full bg-transparent py-1 text-sm font-semibold text-white tabular-nums outline-none placeholder:text-white/20"
                        />
                      </label>
                    </div>
                    {currentProfessional ? (
                      <p className="mt-3 text-[11px] text-white/35">
                        Profissional selecionado: <span className="text-white">{currentProfessional.name}</span>
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-4 flex items-center justify-between border-t border-white/7 pt-4 text-xs text-white/40">
            <span>{form.selectedAppointmentServices.length} serviço(s)</span>
            <span>Subtotal <strong className="ml-2 text-sm font-semibold text-white">{formatCurrency(form.servicesGrossTotal.toFixed(2))}</strong></span>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/8 bg-[#0b0b0b] p-5 shadow-[0_16px_50px_rgba(0,0,0,0.18)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.045] text-white/60">
                <UserRound className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">Cliente</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">Quem será atendido</h2>
              </div>
            </div>
            <button
              type="button"
              onClick={form.handleOpenClientRegistrationModal}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-semibold text-white/65 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              <Plus className="h-3 w-3" />
              Registrar cliente
            </button>
          </div>
          <div className="flex items-stretch gap-2">
            <button
              type="button"
              onClick={() => form.setShowClientPickerModal(true)}
              className="group flex min-w-0 flex-1 items-center justify-between rounded-[22px] border border-white/8 bg-white/[0.025] p-3 text-left transition hover:border-white/18 hover:bg-white/[0.045] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.06] text-white/55 transition group-hover:bg-white/10 group-hover:text-white">
                  <UserRound className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="truncate text-sm font-semibold text-white">{clientName}</p>
                  <p className="mt-1 truncate text-xs text-white/40">
                    {form.selectedClient?.email ?? "Buscar cliente pelo nome"}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-white/30 transition group-hover:translate-x-0.5 group-hover:text-white/60 motion-reduce:transform-none" />
            </button>
            <button
              type="button"
              onClick={form.handleClearSelectedClient}
              disabled={!form.selectedClient}
              className="inline-flex w-12 items-center justify-center rounded-[20px] border border-white/8 bg-white/[0.025] text-white/35 transition hover:border-rose-300/20 hover:bg-rose-300/[0.05] hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Remover cliente"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/8 bg-[#0b0b0b] p-5 shadow-[0_16px_50px_rgba(0,0,0,0.18)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.045] text-white/60">
                <UsersRound className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">Equipe</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">Profissionais</h2>
              </div>
            </div>
            <button
              type="button"
              onClick={form.handleAddProfessionalSlot}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-semibold text-white/65 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              <Plus className="h-3 w-3" />
              Adicionar outro profissional
            </button>
          </div>
          <div className="space-y-2.5">
            {form.appointmentProfessionals.map((slot, index) => {
              const slotLabel = slot.professional?.name ?? "Selecionar";
              return (
                <div key={slot.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => form.handleOpenProfessionalPicker(slot.id)}
                    className="group flex min-w-0 flex-1 items-center justify-between rounded-[22px] border border-white/8 bg-white/[0.025] p-3 text-left transition hover:border-white/18 hover:bg-white/[0.045] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.06] text-white/55 transition group-hover:bg-white/10 group-hover:text-white">
                        <UserRound className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <p className="truncate text-sm font-semibold text-white">{slotLabel}</p>
                        <p className="mt-1 text-xs text-white/40">{`Profissional ${index + 1}`}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-white/30 transition group-hover:translate-x-0.5 group-hover:text-white/60 motion-reduce:transform-none" />
                  </button>
                  <button
                    type="button"
                    onClick={() => form.handleClearProfessionalSelection(slot.id)}
                    disabled={!slot.professional}
                    className="rounded-xl border border-white/8 bg-white/[0.025] p-2 text-white/35 transition hover:border-rose-300/20 hover:bg-rose-300/[0.05] hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Limpar profissional"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {index > 0 ? (
                    <button
                      type="button"
                      onClick={() => form.handleRemoveProfessionalSlot(slot.id)}
                      className="rounded-xl border border-white/8 bg-white/[0.025] p-2 text-white/35 transition hover:border-rose-300/20 hover:bg-rose-300/[0.05] hover:text-rose-200"
                      aria-label="Remover profissional"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        <section className="relative isolate overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(145deg,#111111_0%,#0b0b0b_48%,#080808_100%)] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.28)] sm:p-6">
          <div className="pointer-events-none absolute -right-20 -top-24 -z-10 h-52 w-52 rounded-full bg-white/[0.05] blur-3xl" />

          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <BadgeDollarSign className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/40">Pagamento</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">Defina valores e condição</h2>
              </div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.035] px-3 py-2 text-right">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">Total</p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums text-white">
                {formatCurrency(form.appointmentGrandTotal.toFixed(2))}
              </p>
            </div>
          </div>

          <label className="group block">
            <span className="mb-2 block text-xs font-medium text-white/55">Valor do atendimento</span>
            <span className="relative flex items-center overflow-hidden rounded-[24px] border border-white/10 bg-black/25 px-4 py-3 transition-all duration-300 ease-out focus-within:-translate-y-0.5 focus-within:border-white/35 focus-within:bg-white/[0.035] focus-within:shadow-[0_14px_35px_rgba(255,255,255,0.05)] motion-reduce:transform-none motion-reduce:transition-none">
              <span className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/[0.055] text-white/60 transition duration-300 group-focus-within:scale-105 group-focus-within:bg-white/10 group-focus-within:text-white motion-reduce:transform-none">
                <CircleDollarSign className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="mr-2 text-sm font-semibold text-white/35 transition-colors group-focus-within:text-white/70">R$</span>
              <input
                type="text"
                value={form.priceInput}
                onChange={form.handlePriceInputChange}
                inputMode="decimal"
                placeholder="0,00"
                aria-label="Valor do atendimento em reais"
                className="min-w-0 flex-1 bg-transparent text-2xl font-semibold tracking-tight text-white tabular-nums outline-none placeholder:text-white/18 sm:text-3xl"
              />
              <span className="absolute inset-x-4 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-transparent via-white to-transparent transition-transform duration-500 ease-out group-focus-within:scale-x-100 motion-reduce:transition-none" />
            </span>
          </label>
          {form.selectedAppointmentServices.length > 0 ? (
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={form.handleResetPriceFromServices}
                className="rounded-full px-2 py-1 text-[11px] font-medium text-white/45 transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                Recalcular com base nos serviços
              </button>
            </div>
          ) : null}

          <div className="mt-5 space-y-3">
            <fieldset>
              <legend className="mb-2 text-xs font-medium text-white/50">Tipo de desconto</legend>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Tipo de desconto">
                {discountTypeOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = option.value === form.discountType;
                  return (
                    <button
                      key={option.value || "none"}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      onClick={() => form.handleSelectDiscountType(option.value)}
                      className={`group relative flex min-h-20 flex-col items-start justify-between rounded-[18px] border p-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
                        isActive
                          ? "border-white/30 bg-white/[0.09] text-white"
                          : "border-white/7 bg-white/[0.025] text-white/45 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.045] hover:text-white motion-reduce:hover:transform-none"
                      }`}
                    >
                      <span className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${isActive ? "bg-white text-black" : "bg-white/[0.055] text-white/50 group-hover:text-white/75"}`}>
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <span className="mt-2 text-[11px] font-semibold leading-tight">{option.label}</span>
                      {isActive ? (
                        <span className="absolute right-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-black">
                          <Check className="h-2.5 w-2.5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <label className="block rounded-[22px] border border-white/8 bg-white/[0.025] p-3 text-xs text-white/50 transition focus-within:border-white/20">
              <span className="mb-2 block">
                Desconto {form.discountType === "fixed" ? "(R$)" : form.discountType === "percentage" ? "(%)" : ""}
              </span>
              <input
                type={form.discountType === "percentage" ? "number" : "text"}
                min={form.discountType === "percentage" ? 0 : undefined}
                max={form.discountType === "percentage" ? 100 : undefined}
                step={form.discountType === "percentage" ? 0.5 : undefined}
                inputMode="decimal"
                value={form.discountInput}
                onChange={form.handleDiscountInputChange}
                disabled={!form.discountType}
                placeholder={form.discountType === "fixed" ? "0,00" : "0"}
                className="w-full bg-transparent py-1 text-sm font-semibold text-white tabular-nums outline-none placeholder:text-white/20 disabled:cursor-not-allowed disabled:opacity-30"
              />
            </label>
          </div>

          <label className="mt-3 flex items-center gap-3 rounded-[22px] border border-white/8 bg-white/[0.025] px-4 py-3 transition focus-within:border-white/20">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white/45">
              <CircleDollarSign className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] text-white/45">Gorjeta</span>
              <span className="mt-0.5 flex items-center gap-1.5">
                <span className="text-xs text-white/30">R$</span>
                <input
                  type="text"
                  value={form.tipsInput}
                  onChange={form.handleTipsInputChange}
                  inputMode="decimal"
                  placeholder="0,00"
                  aria-label="Gorjeta em reais"
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white tabular-nums outline-none placeholder:text-white/20"
                />
              </span>
            </span>
          </label>

          <fieldset className="mt-5">
            <legend className="mb-2 text-xs font-medium text-white/55">Forma de pagamento</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Forma de pagamento">
              {paymentTypeOptions.map((option) => {
                const Icon = option.icon;
                const isActive = option.value === form.selectedPaymentType;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => form.handleSelectPaymentOption(option.value)}
                    className={`group/option relative flex min-h-24 flex-col items-start justify-between overflow-hidden rounded-[20px] border p-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                      isActive
                        ? "border-white/35 bg-white/[0.1] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                        : "border-white/8 bg-white/[0.025] text-white/55 hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.045] hover:text-white motion-reduce:hover:transform-none"
                    }`}
                  >
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${isActive ? "bg-white text-black" : "bg-white/[0.06] group-hover/option:bg-white/10"}`}>
                      <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                    </span>
                    <span className="mt-3 text-xs font-semibold leading-tight">{option.label}</span>
                    {isActive ? (
                      <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-black">
                        <Check className="h-3 w-3" aria-hidden="true" />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </section>

        <section className="rounded-[28px] border border-white/8 bg-[#0b0b0b] p-5 shadow-[0_16px_50px_rgba(0,0,0,0.18)]">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.045] text-white/60">
              <MessageSquareText className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">Notas</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">Observações</h2>
            </div>
          </div>
          <label className="block rounded-[22px] border border-white/8 bg-white/[0.025] p-4 text-xs text-white/40 transition focus-within:border-white/20 focus-within:bg-white/[0.04]">
            <span className="sr-only">Observações</span>
            <textarea
              value={form.appointmentObservations}
              onChange={(event) => form.setAppointmentObservations(event.target.value)}
              placeholder="Informe preferências, alergias ou detalhes importantes."
              rows={4}
              className="w-full resize-none bg-transparent text-sm leading-relaxed text-white/85 outline-none placeholder:text-white/25"
            />
          </label>
        </section>

        <fieldset className="rounded-[28px] border border-white/8 bg-[#0b0b0b] p-5 shadow-[0_16px_50px_rgba(0,0,0,0.18)]">
          <legend className="sr-only">Venda</legend>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.045] text-white/60">
                <ShoppingBag className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">Venda</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">Produtos adicionais</h2>
              </div>
            </div>
            <button
              type="button"
              onClick={form.handleOpenSaleModal}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-semibold text-white/65 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              <Plus className="h-4 w-4" />
              Adicionar venda
            </button>
          </div>
          {form.addedSales.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-white/10 bg-white/[0.015] px-4 py-6 text-center">
              <ShoppingBag className="mx-auto h-5 w-5 text-white/20" aria-hidden="true" />
              <p className="mt-2 text-sm text-white/40">Nenhum produto adicionado.</p>
              <p className="mt-1 text-[11px] text-white/25">Vincule produtos vendidos a este atendimento.</p>
            </div>
          ) : (
            <ul className="space-y-2.5 text-sm text-white/80">
              {form.addedSales.map((sale, index) => (
                <li
                  key={`${sale.productId}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-[20px] border border-white/8 bg-white/[0.025] p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{sale.productName}</p>
                    <p className="mt-1 text-xs text-white/40">
                      {sale.quantity} un • {getPaymentTypeLabel(sale.paymentType)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <p className="mr-1 text-sm font-semibold tabular-nums text-white">{formatCurrency(sale.price)}</p>
                    <button
                      type="button"
                      onClick={() => form.handleOpenSaleModalForEdit(sale, index)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/8 text-white/40 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
                      aria-label="Editar venda"
                    >
                      <PenSquare className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => form.handleDeleteAddedSale(sale, index)}
                      disabled={form.saleDeletingId !== null && form.saleDeletingId === sale.saleId}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/8 text-white/40 transition hover:border-rose-300/20 hover:bg-rose-300/[0.05] hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Excluir venda"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </fieldset>

        {form.createAppointmentError ? (
          <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {form.createAppointmentError}
          </p>
        ) : null}

        <fieldset className="rounded-[28px] border border-white/8 bg-[#0b0b0b] p-5 shadow-[0_16px_50px_rgba(0,0,0,0.18)]">
          <legend className="sr-only">Resumo</legend>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.045] text-white/60">
              <ClipboardCheck className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">Conferência</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">Resumo</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-2xl border border-white/7 bg-white/[0.025] p-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/30">Profissional</p>
              <p className="mt-1.5 truncate font-semibold text-white">{professionalName}</p>
            </div>
            <div className="rounded-2xl border border-white/7 bg-white/[0.025] p-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/30">Data e hora</p>
              <p className="mt-1.5 truncate font-semibold text-white">{appointmentDateTimeLabel}</p>
            </div>
            <div className="rounded-2xl border border-white/7 bg-white/[0.025] p-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/30">Status</p>
              <p className="mt-1.5 font-semibold text-white">{capitalizeFirstLetter(form.selectedAppointmentStatus)}</p>
            </div>
            <div className="rounded-2xl border border-white/7 bg-white/[0.025] p-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/30">Pagamento</p>
              <p className="mt-1.5 truncate font-semibold text-white">{paymentLabel}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm text-white/80">
            {form.selectedAppointmentServices.length === 0 ? (
              <p className="text-white/60">Nenhum serviço selecionado.</p>
            ) : (
              form.selectedAppointmentServices.map((service) => {
                const assignment = form.serviceAssignments[service.id];
                const slot = form.appointmentProfessionals.find((item) => item.id === assignment?.professionalSlotId);
                const professionalLabel = slot?.professional?.name ?? "Não definido";
                const paidValue = formatCurrency(parseCurrencyInput(assignment?.price ?? service.price ?? "0").toFixed(2));
                const tipsValue = parseCurrencyInput(assignment?.tips ?? "0");
                return (
                  <div key={`summary-${service.id}`} className="space-y-1 rounded-2xl border border-white/7 bg-white/[0.02] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{service.name}</p>
                      <span className="text-sm font-semibold text-white">{paidValue}</span>
                    </div>
                    <p className="text-xs text-white/60">
                      Profissional: <span className="font-medium text-white">{professionalLabel}</span>
                    </p>
                    {tipsValue > 0 ? (
                      <p className="text-xs text-white/60">
                        Gorjeta: <span className="font-medium text-white">{formatCurrency(tipsValue.toFixed(2))}</span>
                      </p>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
          {form.addedSales.length > 0 ? (
            <div className="mt-3 space-y-2 rounded-2xl border border-white/7 bg-white/[0.02] p-3 text-sm text-white/70">
              <p className="font-semibold text-white">Vendas adicionais</p>
              {form.addedSales.map((sale, index) => (
                <div key={`sale-summary-${sale.productId}-${index}`} className="flex items-center justify-between text-sm">
                  <div>
                    <p>{sale.productName}</p>
                    <p className="text-xs text-white/60">
                      {sale.quantity} un • {getPaymentTypeLabel(sale.paymentType)}
                    </p>
                  </div>
                  <span className="font-semibold text-white">{formatCurrency(sale.price)}</span>
                </div>
              ))}
            </div>
          ) : null}
          <div className="mt-4 rounded-[22px] border border-white/12 bg-white/[0.045] p-4 text-sm text-white/70">
            <div className="flex items-end justify-between gap-4 text-white">
              <span>Total a receber</span>
              <span className="text-xl font-semibold tracking-tight tabular-nums">{formatCurrency(form.appointmentGrandTotal.toFixed(2))}</span>
            </div>
            <p className="mt-1 text-xs text-white/60">
              Desconto aplicado: {form.normalizedDiscount.toFixed(2).replace(".00", "")}% ({formatCurrency(form.servicesDiscountAmount.toFixed(2))})
            </p>
            {form.appointmentTipsTotal > 0 ? (
              <p className="text-xs text-white/60">
                Gorjeta: <span className="font-semibold text-white">{formatCurrency(form.appointmentTipsTotal.toFixed(2))}</span>
              </p>
            ) : null}
            {form.addedSales.length > 0 ? (
              <p className="text-xs text-white/60">
                Vendas adicionais: <span className="font-semibold text-white">{formatCurrency(form.addedSalesTotal.toFixed(2))}</span>
              </p>
            ) : null}
          </div>
        </fieldset>

        <div className="grid gap-2 rounded-[24px] border border-white/8 bg-[#0b0b0b]/90 p-2 shadow-[0_18px_55px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:grid-cols-[1fr_2fr]">
          <button
            type="button"
            onClick={onBack}
            className="order-2 w-full rounded-[18px] border border-white/8 px-4 py-3 text-sm font-semibold text-white/55 transition hover:border-white/18 hover:bg-white/[0.035] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 sm:order-1"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={form.handleSubmitAppointment}
            disabled={form.isSavingAppointment}
            className="order-1 w-full rounded-[18px] bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-70 sm:order-2"
          >
            {form.isSavingAppointment ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </span>
            ) : (
              "Salvar agendamento"
            )}
          </button>
        </div>
      </div>

      <Modal
        open={form.appointmentConflicts.length > 0}
        onClose={form.handleCloseAppointmentConflict}
        title="Confirmar horário ocupado"
        subtitle="Conflito de agenda"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="flex gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-amber-100">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
            <div>
              <p className="text-sm font-semibold">Este profissional já possui atendimento no período.</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-100/70">
                Você ainda pode manter os dois agendamentos no mesmo horário. Confira o atendimento existente antes de confirmar.
              </p>
            </div>
          </div>

          <ul className="no-scrollbar max-h-72 space-y-3 overflow-y-auto pr-1">
            {form.appointmentConflicts.map((conflict) => {
              const start = new Date(conflict.start_datetime);
              const finish = new Date(conflict.finish_datetime);
              const intervalLabel = `${start.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}–${finish.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
              const servicesLabel = conflict.services.map((service) => service.name).join(", ");
              return (
                <li key={conflict.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{conflict.client_name ?? "Cliente não informado"}</p>
                      <p className="mt-1 text-sm text-white/60">{servicesLabel || "Serviço não informado"}</p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-200">
                      <Clock3 className="h-3.5 w-3.5" />
                      {intervalLabel}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={form.handleCloseAppointmentConflict}
              disabled={form.isSavingAppointment}
              className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/80 transition hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Voltar e ajustar
            </button>
            <button
              type="button"
              onClick={form.handleConfirmOverbooking}
              disabled={form.isSavingAppointment}
              className="rounded-2xl bg-amber-300 px-4 py-3 text-sm font-semibold text-black transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {form.isSavingAppointment ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Confirmando...
                </span>
              ) : (
                "Confirmar mesmo assim"
              )}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={form.showClientPickerModal} onClose={() => form.setShowClientPickerModal(false)} title="Selecionar cliente" subtitle="Clientes">
        <form onSubmit={form.handleClientPickerSearchSubmit} className="relative" role="search">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="search"
            value={form.clientSearchInput}
            onChange={(event) => form.setClientSearchInput(event.target.value)}
            placeholder="Buscar cliente por nome"
            className="h-12 w-full rounded-2xl border border-white/10 bg-transparent pl-11 pr-24 text-sm outline-none focus:border-white/40"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center rounded-2xl bg-white px-3 py-1 text-sm font-semibold text-black"
          >
            Buscar
          </button>
        </form>
        <div className="no-scrollbar mt-4 max-h-80 overflow-y-auto rounded-2xl border border-white/10">
          {form.clientPickerLoading ? (
            <div className="flex items-center justify-center py-6 text-white/70">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : form.clientPickerError ? (
            <p className="px-4 py-3 text-sm text-red-300">{form.clientPickerError}</p>
          ) : form.clientPickerResults.length === 0 ? (
            <p className="px-4 py-3 text-sm text-white/60">Nenhum cliente encontrado.</p>
          ) : (
            <ul className="divide-y divide-white/5 text-sm text-white/80">
              {form.clientPickerResults.map((client) => {
                const isSelected = client.id === form.selectedClient?.id;
                const name = [client.first_name, client.last_name].filter(Boolean).join(" ") || client.email;
                return (
                  <li key={client.id}>
                    <button
                      type="button"
                      onClick={() => form.handleSelectClient(client)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-white/5"
                    >
                      <div>
                        <p className="font-semibold">{name}</p>
                        <p className="text-xs text-white/60">{client.email}</p>
                      </div>
                      {isSelected ? <Check className="h-4 w-4 text-emerald-300" /> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Modal>

      <Modal open={form.showServicesPickerModal} onClose={form.handleCancelServicesPicker} title="Escolha os serviços" subtitle="Serviços">
        <form onSubmit={form.handleServicePickerSearchSubmit} className="relative" role="search">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="search"
            value={form.servicesPickerSearchInput}
            onChange={(event) => form.setServicesPickerSearchInput(event.target.value)}
            placeholder="Buscar serviço por nome"
            className="h-12 w-full rounded-2xl border border-white/10 bg-transparent pl-11 pr-24 text-sm outline-none focus:border-white/40"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center rounded-2xl bg-white px-3 py-1 text-sm font-semibold text-black"
          >
            Buscar
          </button>
        </form>
        <div className="no-scrollbar mt-4 max-h-80 overflow-y-auto rounded-2xl border border-white/10">
          {form.servicesPickerLoading ? (
            <div className="flex items-center justify-center py-6 text-white/70">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : form.servicesPickerError ? (
            <p className="px-4 py-3 text-sm text-red-300">{form.servicesPickerError}</p>
          ) : form.servicesPickerResults.length === 0 ? (
            <p className="px-4 py-3 text-sm text-white/60">Nenhum serviço encontrado.</p>
          ) : (
            <ul className="divide-y divide-white/5 text-sm text-white/80">
              {form.servicesPickerResults.map((service) => {
                const isSelected = form.servicesPickerTempSelection.some((item) => item.id === service.id);
                return (
                  <li key={service.id}>
                    <label className="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-white/5">
                      <div>
                        <p className="font-semibold">{service.name}</p>
                        <p className="text-xs text-white/60">{formatCurrency(service.price)}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => form.handleToggleServiceInModal(service)}
                        className="h-4 w-4 rounded border-white/20 bg-transparent text-black"
                      />
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={form.handleCancelServicesPicker}
            className="flex-1 rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={form.handleConfirmServicesPicker}
            className="flex-1 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black"
          >
            Adicionar serviços
          </button>
        </div>
      </Modal>

      <Modal open={form.showProfessionalPickerModal} onClose={form.handleCloseProfessionalPicker} title="Selecionar profissional" subtitle="Profissionais">
        <form onSubmit={form.handleProfessionalPickerSearchSubmit} className="relative" role="search">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="search"
            value={form.professionalSearchInput}
            onChange={(event) => form.setProfessionalSearchInput(event.target.value)}
            placeholder="Buscar profissional"
            className="h-12 w-full rounded-2xl border border-white/10 bg-transparent pl-11 pr-24 text-sm outline-none focus:border-white/40"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center rounded-2xl bg-white px-3 py-1 text-sm font-semibold text-black"
          >
            Buscar
          </button>
        </form>
        <div className="no-scrollbar mt-4 max-h-80 overflow-y-auto rounded-2xl border border-white/10">
          {form.professionalPickerLoading ? (
            <div className="flex items-center justify-center py-6 text-white/70">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : form.professionalPickerError ? (
            <p className="px-4 py-3 text-sm text-red-300">{form.professionalPickerError}</p>
          ) : form.professionalPickerResults.length === 0 ? (
            <p className="px-4 py-3 text-sm text-white/60">Nenhum profissional encontrado.</p>
          ) : (
            <ul className="divide-y divide-white/5 text-sm text-white/80">
              {form.professionalPickerResults.map((professional) => {
                const isSelected = form.currentProfessionalPickerSlot?.professional?.id === professional.id;
                return (
                  <li key={professional.id}>
                    <button
                      type="button"
                      onClick={() => form.handleSelectProfessionalForAppointment(professional)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-white/5"
                    >
                      <span className="font-semibold">{professional.name}</span>
                      {isSelected ? <Check className="h-4 w-4 text-emerald-300" /> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Modal>

      <Modal open={form.saleModalOpen} onClose={form.handleCloseSaleModal} title="Adicionar produto">
        <div className="space-y-3">
          <label className="block text-white/70">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm focus-within:border-white/40">
              <Search className="h-4 w-4 text-white/40" />
              <input
                type="text"
                aria-label="Buscar produto"
                value={form.saleProductsSearchInput}
                onChange={(event) => {
                  const value = event.target.value;
                  form.setSaleProductsSearchInput(value);
                  form.setSaleProductsSearchTerm(value.trim());
                }}
                placeholder="Digite para buscar"
                className="w-full bg-transparent text-sm text-white/90 outline-none placeholder:text-white/40"
              />
            </div>
          </label>
          {form.saleProductsLoading ? (
            <div className="flex items-center justify-center py-6 text-white/70">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : form.saleProductsError ? (
            <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {form.saleProductsError}
            </p>
          ) : form.saleProductsList.length === 0 ? (
            <p className="text-sm text-white/60">Nenhum produto disponível para venda.</p>
          ) : (
            <ul className={`${saleProductsListExpanded ? "no-scrollbar max-h-52 overflow-y-auto" : ""} rounded-2xl border border-white/10`}>
              {visibleSaleProducts.map((product) => {
                const isSelected = form.selectedSaleProductId === product.id;
                return (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => handleSaleProductListClick(product.id)}
                    className={`flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left text-sm transition hover:bg-white/5 ${
                      isSelected ? "bg-white/[0.04]" : ""
                    }`}
                    aria-pressed={isSelected}
                  >
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-xs text-white/60">
                        Preço sugerido: {formatCurrency(product.price_to_sell)}
                      </p>
                    </div>
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        isSelected ? "border-white bg-white text-black" : "border-white/30 text-transparent"
                      }`}
                      aria-hidden="true"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  </button>
                </li>
                );
              })}
            </ul>
          )}

          {form.selectedSaleProductId ? (
            <div className="space-y-3 rounded-2xl border border-white/10 p-4 text-sm text-white/80">
              <div className="grid grid-cols-2 gap-3">
                <label className="min-w-0 text-xs text-white/70">
                  Usuário que vendeu
                  <span className="relative mt-1 block">
                    <select
                      value={form.saleProfessionalId ? String(form.saleProfessionalId) : ""}
                      onChange={(event) => form.setSaleProfessionalId(event.target.value ? Number(event.target.value) : null)}
                      className="w-full appearance-none rounded-2xl border border-white/10 bg-[#050505] px-3 py-3 pr-8 text-sm outline-none focus:border-white/40"
                    >
                      <option value="">Sem usuário</option>
                      {form.saleProfessionalsList.map((professional) => (
                        <option key={professional.userId} value={professional.userId}>
                          {professional.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  </span>
                </label>
                <label className="min-w-0 text-xs text-white/70">
                  Forma de pagamento
                  <span className="relative mt-1 block">
                    <select
                      value={form.salePaymentSelect}
                      onChange={(event) => form.setSalePaymentSelect(event.target.value as PaymentType)}
                      className="w-full appearance-none rounded-2xl border border-white/10 bg-[#050505] px-3 py-3 pr-8 text-sm outline-none focus:border-white/40"
                    >
                      <option value="">Selecione</option>
                      {paymentTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  </span>
                </label>
              </div>
              <label className="block text-white/70">
                Quantidade
                <input
                  type="number"
                  min={1}
                  value={form.saleQuantityInput}
                  onChange={(event) => form.setSaleQuantityInput(event.target.value)}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
                />
              </label>
              <label className="block text-white/70">
                Preço (R$)
                <input
                  type="text"
                  value={form.salePriceInput}
                  onChange={(event) => form.setSalePriceInput(event.target.value)}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
                />
              </label>
            </div>
          ) : null}
        </div>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={form.handleCloseSaleModal}
            className="flex-1 rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={form.handleAddSaleProduct}
            disabled={form.isAddingSaleProduct || !form.selectedSaleProductId || !form.salePaymentSelect || form.saleProductsLoading}
            className="flex-1 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-70"
          >
            {form.isAddingSaleProduct ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Adicionando...
              </span>
            ) : (
              "Adicionar produto"
            )}
          </button>
        </div>
      </Modal>

      <Modal open={form.showClientRegistrationModal} onClose={() => form.setShowClientRegistrationModal(false)} title="Registrar cliente" subtitle="Cliente">
        <form onSubmit={form.handleSubmitClientRegistration} className="space-y-3">
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/80">
            <span>Contato genérico</span>
            <input
              type="checkbox"
              name="isUnregisteredClient"
              checked={form.clientRegistrationForm.isUnregisteredClient}
              onChange={form.handleClientRegistrationInputChange}
              className="peer sr-only"
            />
            <span className="relative h-6 w-11 shrink-0 rounded-full bg-white/15 transition peer-checked:bg-white peer-focus-visible:ring-2 peer-focus-visible:ring-white/60 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#050505] after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5 peer-checked:after:bg-black" />
          </label>
          <label className="block text-sm text-white/70">
            Nome
            <input
              type="text"
              name="firstName"
              value={form.clientRegistrationForm.firstName}
              onChange={form.handleClientRegistrationInputChange}
              className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
              placeholder="João"
            />
          </label>
          <label className="block text-sm text-white/70">
            Sobrenome
            <input
              type="text"
              name="lastName"
              value={form.clientRegistrationForm.lastName}
              onChange={form.handleClientRegistrationInputChange}
              className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
              placeholder="Silva"
            />
          </label>
          <label className="block text-sm text-white/70">
            Email
            <div className="relative mt-1">
              <input
                type="email"
                name="email"
                value={
                  form.clientRegistrationForm.isUnregisteredClient
                    ? buildUnregisteredClientEmail(
                        form.clientRegistrationForm.firstName,
                        form.clientRegistrationForm.lastName,
                      )
                    : form.clientRegistrationForm.email
                }
                onChange={form.handleClientRegistrationInputChange}
                disabled={form.clientRegistrationForm.isUnregisteredClient}
                className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 disabled:opacity-60"
                placeholder="joao.silva@example.com"
              />
              {emailSuggestions.length > 0 ? (
                <div className="absolute left-0 right-0 z-50 mt-2 rounded-2xl border border-white/10 bg-[#0b0b0b] p-1 shadow-card">
                  {emailSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        form.handleSelectClientEmailSuggestion(suggestion);
                      }}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm text-white/80 transition hover:bg-white/10"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </label>
          <label className="block text-sm text-white/70">
            CPF (opcional)
            <input
              type="text"
              name="cpf"
              value={form.clientRegistrationForm.cpf}
              onChange={form.handleClientRegistrationInputChange}
              className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
              placeholder="12345678910"
            />
          </label>
          <label className="block text-sm text-white/70">
            Telefone
            <input
              type="tel"
              name="phone"
              value={
                form.clientRegistrationForm.isUnregisteredClient
                  ? UNREGISTERED_CLIENT_PHONE_DISPLAY
                  : form.clientRegistrationForm.phone
              }
              onChange={form.handleClientRegistrationInputChange}
              disabled={form.clientRegistrationForm.isUnregisteredClient}
              className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 disabled:opacity-60"
              placeholder="71988887777"
            />
          </label>
          <label className="block text-sm text-white/70">
            Data de nascimento
            <input
              type="date"
              name="dateOfBirth"
              value={
                form.clientRegistrationForm.isUnregisteredClient
                  ? ""
                  : form.clientRegistrationForm.dateOfBirth
              }
              onChange={form.handleClientRegistrationInputChange}
              disabled={form.clientRegistrationForm.isUnregisteredClient}
              className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 disabled:opacity-60"
            />
          </label>
          {form.clientRegistrationError ? (
            <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs text-red-200">
              {form.clientRegistrationError}
            </p>
          ) : null}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => form.setShowClientRegistrationModal(false)}
              className="flex-1 rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={form.clientRegistrationSubmitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-70"
            >
              {form.clientRegistrationSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
