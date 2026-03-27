"use client";

import { Check, ChevronLeft, ChevronRight, Loader2, PenSquare, Plus, Search, Trash2, UserRound } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, parseCurrencyInput } from "@/src/features/shared/utils/money";
import { buildDateTimeISOString } from "@/src/features/shared/utils/date";
import { capitalizeFirstLetter } from "@/src/features/shared/utils/string";
import { getPaymentTypeLabel, paymentTypeOptions } from "@/src/features/finances/utils/finances";
import { useAppointmentForm } from "@/src/features/appointments/hooks/useAppointmentForm";
import type { PaymentType } from "@/src/shared/types/payment";

type AppointmentFormScreenProps = {
  form: ReturnType<typeof useAppointmentForm>;
  onBack: () => void;
};

const appointmentStatusOptions = [
  { value: "agendado", label: "Agendado" },
  { value: "cancelado", label: "Cancelado" },
  { value: "iniciado", label: "Iniciado" },
  { value: "realizado", label: "Realizado" },
] as const;

export function AppointmentFormScreen({ form, onBack }: AppointmentFormScreenProps) {
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
    const email = form.clientRegistrationForm.email.trim();
    const [local] = email.split("@");
    if (!form.showClientEmailSuggestions || !local || email.includes(" ")) {
      return [];
    }
    return ["gmail.com", "outlook.com", "hotmail.com"].map((domain) => `${local}@${domain}`);
  })();

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
      <div className="flex flex-col gap-5 pb-24">
        <header className="flex items-center justify-between">
          <button
            type="button"
            className="mr-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-white/40 hover:text-white"
            onClick={onBack}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 text-center">
            <p className="text-sm text-white/60">Agenda</p>
            <p className="text-2xl font-semibold">
              {form.isEditingExistingAppointment ? "Editar agendamento" : "Novo agendamento"}
            </p>
          </div>
        </header>

        <section className="space-y-3 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
          <p className="text-sm text-white/60">Data e hora</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-white/70">
              Data
              <input
                type="date"
                value={form.appointmentDateInput}
                onChange={(event) => form.setAppointmentDateInput(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
              />
            </label>
            <label className="text-sm text-white/70">
              Hora
              <input
                type="time"
                value={form.appointmentTimeInput}
                onChange={(event) => form.handleAppointmentTimeChange(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
              />
            </label>
          </div>
          {form.dayRestriction && !form.dayRestriction.is_all_day ? (
            <p className="text-xs text-amber-300">
              Horário bloqueado neste dia:{" "}
              {new Date(form.dayRestriction.start_datetime).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              às{" "}
              {new Date(form.dayRestriction.finish_datetime).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          ) : null}
          {form.dayRestriction?.is_all_day ? (
            <p className="text-xs text-amber-300">Existe uma restrição de dia inteiro para esta data.</p>
          ) : null}
        </section>

        <section className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
          <div>
            <p className="text-sm text-white/60">Status</p>
            <p className="text-lg font-semibold">Situação do atendimento</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {appointmentStatusOptions.map((option) => {
              const isActive = option.value === form.selectedAppointmentStatus;
              return (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => form.setSelectedAppointmentStatus(option.value)}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                    isActive ? "bg-white text-black" : "bg-white/10 text-white/70"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Serviços</p>
              <p className="text-lg font-semibold">Monte o combo ideal</p>
              <p className="text-xs text-white/60">Selecione um ou mais serviços.</p>
            </div>
            <button
              type="button"
              onClick={form.handleOpenServicesPickerModal}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80"
            >
              <Plus className="h-4 w-4" />
              Selecionar
            </button>
          </div>
          {form.selectedAppointmentServices.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-white/60">
              Nenhum serviço selecionado até o momento.
            </p>
          ) : (
            <ul className="space-y-3 text-sm text-white/80">
              {form.selectedAppointmentServices.map((service) => {
                const assignment = form.serviceAssignments[service.id];
                const currentProfessional = form.appointmentProfessionals.find(
                  (slot) => slot.id === assignment?.professionalSlotId,
                )?.professional;
                return (
                  <li key={service.id} className="rounded-2xl border border-white/10 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{service.name}</p>
                        <p className="text-xs text-white/60">
                          {formatCurrency(assignment?.price ?? service.price ?? "0")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => form.handleRemoveAppointmentService(service.id)}
                        className="rounded-full border border-white/10 p-2 text-white/60 hover:text-white"
                        aria-label="Remover serviço"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <label className="text-xs text-white/60">
                        Profissional responsável
                        <select
                          value={assignment?.professionalSlotId ?? ""}
                          onChange={(event) =>
                            form.handleServiceAssignmentProfessionalChange(service.id, event.target.value || null)
                          }
                          className="mt-1 w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-2 text-sm text-white outline-none focus:border-white/40"
                        >
                          <option value="">Selecione</option>
                          {form.appointmentProfessionals
                            .filter((slot) => slot.professional)
                            .map((slot) => (
                              <option key={slot.id} value={slot.id}>
                                {slot.professional?.name}
                              </option>
                            ))}
                        </select>
                      </label>
                      <label className="text-xs text-white/60">
                        Preço pago (R$)
                        <input
                          type="text"
                          inputMode="decimal"
                          value={assignment?.price ?? ""}
                          onChange={(event) => form.handleServiceAssignmentPriceChange(service.id, event)}
                          placeholder="0.00"
                          className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-white/40"
                        />
                      </label>
                      <label className="text-xs text-white/60">
                        Gorjeta (R$)
                        <input
                          type="text"
                          inputMode="decimal"
                          value={assignment?.tips ?? ""}
                          onChange={(event) => form.handleServiceAssignmentTipsChange(service.id, event)}
                          placeholder="0.00"
                          className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-white/40"
                        />
                      </label>
                    </div>
                    {currentProfessional ? (
                      <p className="mt-2 text-xs text-white/50">
                        Profissional selecionado: <span className="text-white">{currentProfessional.name}</span>
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
          <p className="text-right text-sm text-white/60">
            Subtotal dos serviços:{" "}
            <span className="font-semibold text-white">{formatCurrency(form.servicesGrossTotal.toFixed(2))}</span>
          </p>
        </section>

        <section className="space-y-3 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-white/60">Cliente</p>
            <button
              type="button"
              onClick={form.handleOpenClientRegistrationModal}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-3 py-1 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
            >
              <Plus className="h-3 w-3" />
              Registrar cliente
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => form.setShowClientPickerModal(true)}
              className="flex flex-1 items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{clientName}</p>
                  <p className="text-xs text-white/60">
                    {form.selectedClient?.email ?? "Buscar cliente pelo nome"}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-white/50" />
            </button>
            <button
              type="button"
              onClick={form.handleClearSelectedClient}
              disabled={!form.selectedClient}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 text-white/60 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Remover cliente"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </section>

        <section className="space-y-3 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-white/60">Profissionais</p>
            <button
              type="button"
              onClick={form.handleAddProfessionalSlot}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-3 py-1 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
            >
              <Plus className="h-3 w-3" />
              Adicionar outro profissional
            </button>
          </div>
          <div className="space-y-2">
            {form.appointmentProfessionals.map((slot, index) => {
              const slotLabel = slot.professional?.name ?? "Selecionar";
              return (
                <div key={slot.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => form.handleOpenProfessionalPicker(slot.id)}
                    className="flex flex-1 items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                        <UserRound className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{slotLabel}</p>
                        <p className="text-xs text-white/60">{`Profissional ${index + 1}`}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-white/50" />
                  </button>
                  <button
                    type="button"
                    onClick={() => form.handleClearProfessionalSelection(slot.id)}
                    disabled={!slot.professional}
                    className="rounded-full border border-white/10 p-2 text-white/60 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Limpar profissional"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {index > 0 ? (
                    <button
                      type="button"
                      onClick={() => form.handleRemoveProfessionalSlot(slot.id)}
                      className="rounded-full border border-white/10 p-2 text-white/60 transition hover:text-white"
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

        <section className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
          <div>
            <p className="text-sm text-white/60">Pagamento</p>
            <p className="text-lg font-semibold">Defina valores e condição</p>
          </div>
          <label className="block text-sm text-white/70">
            Preço (R$)
            <input
              type="text"
              value={form.priceInput}
              onChange={form.handlePriceInputChange}
              inputMode="decimal"
              placeholder="0.00"
              className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
            />
          </label>
          {form.selectedAppointmentServices.length > 0 ? (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={form.handleResetPriceFromServices}
                className="text-xs text-white/60 underline-offset-2 hover:text-white hover:underline"
              >
                Recalcular com base nos serviços
              </button>
            </div>
          ) : null}
          <label className="block text-sm text-white/70">
            Desconto (%)
            <input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={form.discountInput}
              onChange={form.handleDiscountInputChange}
              className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
            />
          </label>
          <label className="block text-sm text-white/70">
            Gorjeta (R$)
            <input
              type="text"
              value={form.tipsInput}
              onChange={form.handleTipsInputChange}
              inputMode="decimal"
              placeholder="0.00"
              className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
            />
          </label>
          <button
            type="button"
            onClick={() => form.setShowPaymentTypeModal(true)}
            className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-left"
          >
            <div>
              <p className="text-sm font-semibold">{paymentLabel}</p>
              <p className="text-xs text-white/60">Forma de pagamento</p>
            </div>
            <ChevronRight className="h-4 w-4 text-white/50" />
          </button>
        </section>

        <section className="space-y-2 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
          <label className="text-sm text-white/70">
            Observações
            <textarea
              value={form.appointmentObservations}
              onChange={(event) => form.setAppointmentObservations(event.target.value)}
              placeholder="Informe preferências, alergias ou detalhes importantes."
              rows={3}
              className="mt-1 w-full resize-none rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
            />
          </label>
        </section>

        <fieldset className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
          <legend className="px-2 text-xs uppercase tracking-wide text-white/50">Venda</legend>
          <p className="text-sm text-white/70">
            Registre a venda de produtos complementares e vincule ao agendamento.
          </p>
          <button
            type="button"
            onClick={form.handleOpenSaleModal}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80"
          >
            <Plus className="h-4 w-4" />
            Adicionar venda
          </button>
          {form.addedSales.length === 0 ? (
            <p className="text-xs text-white/60">Nenhuma venda adicionada ainda.</p>
          ) : (
            <ul className="space-y-2 text-sm text-white/80">
              {form.addedSales.map((sale, index) => (
                <li
                  key={`${sale.productId}-${index}`}
                  className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-2"
                >
                  <div>
                    <p className="font-semibold">{sale.productName}</p>
                    <p className="text-xs text-white/60">
                      {sale.quantity} un • {getPaymentTypeLabel(sale.paymentType)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-white">{formatCurrency(sale.price)}</p>
                    <button
                      type="button"
                      onClick={() => form.handleOpenSaleModalForEdit(sale, index)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-white/40 hover:text-white"
                      aria-label="Editar venda"
                    >
                      <PenSquare className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => form.handleDeleteAddedSale(sale, index)}
                      disabled={form.saleDeletingId !== null && form.saleDeletingId === sale.saleId}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
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

        <fieldset className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
          <legend className="px-2 text-xs uppercase tracking-wide text-white/50">Resumo</legend>
          <div className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/70">
            <p>
              Profissional: <span className="font-semibold text-white">{professionalName}</span>
            </p>
            <p>
              Data e hora: <span className="font-semibold text-white">{appointmentDateTimeLabel}</span>
            </p>
            <p>
              Status:{" "}
              <span className="font-semibold text-white">
                {capitalizeFirstLetter(form.selectedAppointmentStatus)}
              </span>
            </p>
            <p>
              Pagamento: <span className="font-semibold text-white">{paymentLabel}</span>
            </p>
          </div>
          <div className="space-y-2 text-sm text-white/80">
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
                  <div key={`summary-${service.id}`} className="space-y-1 rounded-2xl border border-white/10 px-4 py-2">
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
            <div className="space-y-2 rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/70">
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
          <div className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/80">
            <div className="flex items-center justify-between text-base font-semibold text-white">
              <span>Total a receber</span>
              <span>{formatCurrency(form.appointmentGrandTotal.toFixed(2))}</span>
            </div>
            <p className="mt-1 text-xs text-white/60">
              Desconto aplicado (serviços): {form.normalizedDiscount}% ({formatCurrency(form.servicesDiscountAmount.toFixed(2))})
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

        <div className="space-y-3">
          <button
            type="button"
            onClick={form.handleSubmitAppointment}
            disabled={form.isSavingAppointment}
            className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
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
          <button
            type="button"
            onClick={onBack}
            className="w-full rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/80 transition hover:border-white/40"
          >
            Cancelar agendamento
          </button>
        </div>
      </div>

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
        <div className="mt-4 max-h-80 overflow-y-auto rounded-2xl border border-white/10">
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
        <div className="mt-4 max-h-80 overflow-y-auto rounded-2xl border border-white/10">
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
        <div className="mt-4 max-h-80 overflow-y-auto rounded-2xl border border-white/10">
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

      <Modal open={form.showPaymentTypeModal} onClose={() => form.setShowPaymentTypeModal(false)} title="Escolha a forma" subtitle="Pagamento">
        <div className="space-y-3">
          {paymentTypeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = option.value === form.selectedPaymentType;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => form.handleSelectPaymentOption(option.value)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                  isActive ? "border-white bg-white text-black" : "border-white/10 text-white/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  {option.label}
                </div>
                {isActive ? <Check className="h-4 w-4" /> : null}
              </button>
            );
          })}
        </div>
      </Modal>

      <Modal open={form.saleModalOpen} onClose={form.handleCloseSaleModal} title="Adicionar produto" subtitle="Venda">
        <div className="space-y-3">
          <label className="block text-white/70">
            Buscar produto
            <div className="mt-1 flex items-center gap-2 rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm focus-within:border-white/40">
              <Search className="h-4 w-4 text-white/40" />
              <input
                type="text"
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
            <ul className="max-h-52 overflow-y-auto rounded-2xl border border-white/10">
              {form.saleProductsList.map((product) => (
                <li key={product.id}>
                  <label className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-white/5">
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-xs text-white/60">
                        Preço sugerido: {formatCurrency(product.price_to_sell)}
                      </p>
                    </div>
                    <input
                      type="radio"
                      name="saleProduct"
                      checked={form.selectedSaleProductId === product.id}
                      onChange={() => form.handleSelectSaleProduct(product.id)}
                      className="h-4 w-4 rounded-full border-white/30 bg-transparent text-black"
                    />
                  </label>
                </li>
              ))}
            </ul>
          )}

          {form.selectedSaleProductId ? (
            <div className="space-y-3 rounded-2xl border border-white/10 p-4 text-sm text-white/80">
              <label className="block text-white/70">
                Usuário que vendeu
                <select
                  value={form.saleProfessionalId ? String(form.saleProfessionalId) : ""}
                  onChange={(event) => form.setSaleProfessionalId(event.target.value ? Number(event.target.value) : null)}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-[#050505] px-4 py-3 text-sm outline-none focus:border-white/40"
                >
                  <option value="">Sem usuário</option>
                  {form.saleProfessionalsList.map((professional) => (
                    <option key={professional.userId} value={professional.userId}>
                      {professional.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-white/70">
                Forma de pagamento
                <select
                  value={form.salePaymentSelect}
                  onChange={(event) => form.setSalePaymentSelect(event.target.value as PaymentType)}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-[#050505] px-4 py-3 text-sm outline-none focus:border-white/40"
                >
                  <option value="">Selecione</option>
                  {paymentTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
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
                value={form.clientRegistrationForm.email}
                onChange={form.handleClientRegistrationInputChange}
                className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
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
              value={form.clientRegistrationForm.phone}
              onChange={form.handleClientRegistrationInputChange}
              className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
              placeholder="71988887777"
            />
          </label>
          <label className="block text-sm text-white/70">
            Data de nascimento
            <input
              type="date"
              name="dateOfBirth"
              value={form.clientRegistrationForm.dateOfBirth}
              onChange={form.handleClientRegistrationInputChange}
              className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
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
