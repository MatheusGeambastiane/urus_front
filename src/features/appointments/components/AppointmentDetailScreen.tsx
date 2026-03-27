"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, PenSquare, RefreshCw } from "lucide-react";
import { ProfileMenu } from "@/components/ui/ProfileMenu";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency } from "@/src/features/shared/utils/money";
import { capitalizeFirstLetter } from "@/src/features/shared/utils/string";
import { getPaymentTypeLabel } from "@/src/features/finances/utils/finances";
import type { PaymentType } from "@/src/shared/types/payment";
import type { AppointmentStatus } from "@/src/features/appointments/types";
import { useAppointmentDetail } from "@/src/features/appointments/hooks/useAppointmentDetail";
import { ClientLastAppointmentCard } from "./ClientLastAppointmentCard";

type AppointmentDetailScreenProps = {
  appointmentId: number | null;
  detailState: ReturnType<typeof useAppointmentDetail>;
  profilePic: string | null;
  onLogout: () => void;
  onBack: () => void;
  onEdit?: () => void;
};

const appointmentStatusOptions: { value: AppointmentStatus; label: string }[] = [
  { value: "agendado", label: "Agendado" },
  { value: "iniciado", label: "Iniciado" },
  { value: "realizado", label: "Realizado" },
  { value: "cancelado", label: "Cancelado" },
];

const formatDateTime = (value?: string | null, fallback = "Não informado") => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function AppointmentDetailScreen({
  appointmentId,
  detailState,
  profilePic,
  onLogout,
  onBack,
  onEdit,
}: AppointmentDetailScreenProps) {
  const router = useRouter();
  const {
    appointmentDetail,
    appointmentDetailLoading,
    appointmentDetailError,
    appointmentStatusUpdating,
    showAppointmentCancelModal,
    refreshAppointmentDetail,
    updateAppointmentStatus,
    openAppointmentCancelModal,
    closeAppointmentCancelModal,
    confirmAppointmentCancel,
  } = detailState;

  const detailProfessionalServiceMap = useMemo(
    () => new Map((appointmentDetail?.professional_services ?? []).map((item) => [item.service, item])),
    [appointmentDetail?.professional_services],
  );

  const detail = appointmentDetail;
  const clientName = detail?.client_name ?? "Cliente não informado";
  const professionalName = detail?.professional_name ?? "Profissional não informado";
  const appointmentOriginLabel = detail?.appointment_origin
    ? detail.appointment_origin === "schedule_system"
      ? "Sistema cliente"
      : detail.appointment_origin === "presencial"
        ? "Presencial"
        : capitalizeFirstLetter(detail.appointment_origin)
    : "Não informado";
  const paymentLabel = getPaymentTypeLabel(detail?.payment_type as PaymentType);
  const statusValue = detail?.status as AppointmentStatus | undefined;
  const appointmentTipsLabel = formatCurrency(detail?.tips ?? "0");
  const completedAppointmentsTotal = detail?.client_completed_appointments_total ?? 0;
  const completedAppointmentsCurrentMonth =
    detail?.client_completed_appointments_current_month_total ?? 0;
  const lastCompletedAppointmentId = detail?.client_last_completed_appointment_id ?? null;
  const lastCompletedAppointmentDateLabel = formatDateTime(
    detail?.client_last_completed_appointment_date,
  );

  return (
    <div className="flex flex-col gap-5 pb-24">
      <header className="flex items-center justify-between gap-3">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-white/40 hover:text-white"
          onClick={onBack}
          aria-label="Voltar para agenda"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 text-center">
          <p className="text-sm text-white/60">Agendamento #{appointmentId ?? "-"}</p>
          <p className="text-2xl font-semibold">{clientName}</p>
          <p className="mt-1 text-xs font-medium tracking-[0.14em] text-amber-100/70 uppercase">
            {completedAppointmentsTotal} atendimento{completedAppointmentsTotal === 1 ? "" : "s"},{" "}
            {completedAppointmentsCurrentMonth} nesse m{"ê"}s
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onEdit ? (
            <button
              type="button"
              onClick={onEdit}
              disabled={!detail || appointmentDetailLoading}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <PenSquare className="h-4 w-4" />
              Editar atendimento
            </button>
          ) : null}
          <ProfileMenu profilePicUrl={profilePic} onLogout={onLogout} />
        </div>
      </header>

      {appointmentDetailLoading && !detail ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-white/5 bg-[#0b0b0b] p-10 text-white/70">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="mt-3 text-sm">Carregando agendamento...</p>
        </div>
      ) : null}

      {appointmentDetailError && !detail ? (
        <div className="space-y-3 rounded-3xl border border-red-500/40 bg-red-500/10 p-5 text-sm text-red-100">
          <p>{appointmentDetailError}</p>
          <button
            type="button"
            onClick={refreshAppointmentDetail}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-4 py-2 text-xs font-semibold text-white/80"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </button>
        </div>
      ) : null}

      {appointmentDetailError && detail ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {appointmentDetailError}
        </div>
      ) : null}

      {detail ? (
        <>
          <section className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
            <div>
              <p className="text-sm text-white/60">Status</p>
              <p className="text-lg font-semibold">Atualize a situação do atendimento</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {appointmentStatusOptions.map((option) => {
                const isActive = option.value === statusValue;
                return (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => {
                      if (option.value === "cancelado") {
                        if (statusValue === "cancelado") {
                          return;
                        }
                        openAppointmentCancelModal();
                        return;
                      }
                      void updateAppointmentStatus(option.value);
                    }}
                    disabled={appointmentStatusUpdating || appointmentDetailLoading}
                    className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                      isActive ? "bg-white text-black" : "bg-white/10 text-white/70"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/50">Cliente</p>
                <p className="text-base font-semibold text-white">{clientName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-white/50">Profissional</p>
                <p className="text-base font-semibold text-white">{professionalName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-white/50">Data e hora</p>
                <p className="text-base font-semibold text-white">{formatDateTime(detail.date_time, "--/--/----")}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-white/50">Pagamento</p>
                <p className="text-base font-semibold text-white">{paymentLabel}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-white/50">Valor pago</p>
                <p className="text-base font-semibold text-white">{formatCurrency(detail.price_paid ?? "0")}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-white/50">Desconto</p>
                <p className="text-base font-semibold text-white">
                  {detail.discount ? `${detail.discount}%` : "Sem desconto"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-white/50">Gorjeta</p>
                <p className="text-base font-semibold text-white">{appointmentTipsLabel}</p>
              </div>
            </div>
          </section>

          <section className="space-y-3 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Serviços</p>
                <p className="text-lg font-semibold">Itens do atendimento</p>
              </div>
              <span className="text-xs text-white/60">{detail.services.length} item(ns)</span>
            </div>
            {detail.services.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-center text-sm text-white/60">
                Nenhum serviço associado.
              </p>
            ) : (
              <ul className="space-y-2">
                {detail.services.map((service) => {
                  const professionalService = detailProfessionalServiceMap.get(service.id);
                  const serviceTips = professionalService?.tips;
                  return (
                    <li
                      key={`detail-service-${service.id}`}
                      className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3"
                    >
                      <div>
                        <p className="font-semibold">{service.name}</p>
                        <p className="text-xs text-white/60">{service.category_name}</p>
                        {professionalService?.professional_name ? (
                          <p className="text-xs text-white/60">
                            Profissional:{" "}
                            <span className="text-white">{professionalService.professional_name}</span>
                          </p>
                        ) : null}
                        {serviceTips ? (
                          <p className="text-xs text-white/60">
                            Gorjeta: <span className="text-white">{formatCurrency(serviceTips)}</span>
                          </p>
                        ) : null}
                      </div>
                      <span className="text-xs text-white/50">#{service.id}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="space-y-3 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Vendas</p>
                <p className="text-lg font-semibold">Produtos vinculados</p>
              </div>
              <span className="text-xs text-white/60">{detail.sells?.length ?? 0} item(ns)</span>
            </div>
            {detail.sells && detail.sells.length > 0 ? (
              <ul className="space-y-2">
                {detail.sells.map((sale) => {
                  const saleDate = sale.date_of_transaction
                    ? new Date(sale.date_of_transaction).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "--/--/----";
                  const sellPaymentLabel =
                    getPaymentTypeLabel(sale.transaction_payment as PaymentType) ||
                    capitalizeFirstLetter(sale.transaction_payment);
                  return (
                    <li
                      key={`appointment-sell-${sale.id}`}
                      className="space-y-2 rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/80"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">{sale.product_name ?? "Produto"}</p>
                          <p className="text-xs text-white/60">
                            {sale.quantity} un • {sellPaymentLabel}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-white">
                            {formatCurrency(sale.price ?? "0")}
                          </p>
                          <p className="text-xs text-white/60">{saleDate}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                        <span>Vendedor: {sale.user_name ?? "Não informado"}</span>
                        {sale.money_resource ? (
                          <span>Origem: {capitalizeFirstLetter(sale.money_resource)}</span>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="rounded-2xl border border-dashed border-white/10 px-4 py-4 text-center text-sm text-white/60">
                Nenhuma venda vinculada.
              </p>
            )}
          </section>

          <section className="space-y-2 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
            <p className="text-sm text-white/60">Observações</p>
            <p className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/80">
              {detail.observations && detail.observations.trim().length > 0
                ? detail.observations
                : "Nenhuma observação registrada."}
            </p>
          </section>

          {lastCompletedAppointmentId ? (
            <ClientLastAppointmentCard
              dateLabel={lastCompletedAppointmentDateLabel}
              onOpen={() => router.push(`/dashboard/agenda/${lastCompletedAppointmentId}`)}
            />
          ) : null}

          <section className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 text-sm text-white/70">
            <p>
              Criado em: <span className="font-semibold text-white">{formatDateTime(detail.created_at)}</span>
            </p>
            <p className="mt-1">
              Atualizado em:{" "}
              <span className="font-semibold text-white">{formatDateTime(detail.updated_at)}</span>
            </p>
            <p className="mt-1">
              Origem do agendamento:{" "}
              <span className="font-semibold text-white">{appointmentOriginLabel}</span>
            </p>
          </section>
        </>
      ) : null}

      <Modal
        open={showAppointmentCancelModal}
        onClose={closeAppointmentCancelModal}
        title="Confirmar cancelamento"
        subtitle="Agendamento"
      >
        <div className="space-y-4 text-sm text-white/80">
          <p>Deseja cancelar este agendamento?</p>
          <p className="text-xs text-white/50">Essa ação altera o status para cancelado.</p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={closeAppointmentCancelModal}
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={() => void confirmAppointmentCancel()}
              disabled={appointmentStatusUpdating || appointmentDetailLoading}
              className="rounded-2xl bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              Confirmar cancelamento
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
