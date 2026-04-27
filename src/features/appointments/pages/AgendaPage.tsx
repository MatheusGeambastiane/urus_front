"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock3, Eye, EyeOff, Filter, Plus, Trash2, Waves } from "lucide-react";
import { DashboardShell } from "@/src/features/dashboard/components/DashboardShell";
import { useAuth } from "@/src/features/shared/hooks/useAuth";
import { formatDateParam } from "@/src/features/shared/utils/date";
import { formatCurrency } from "@/src/features/shared/utils/money";
import { AppointmentList } from "@/src/features/appointments/components/AppointmentList";
import { useAppointments } from "@/src/features/appointments/hooks/useAppointments";
import type { PaymentType } from "@/src/shared/types/payment";

const AppointmentFilterModal = dynamic(
  () =>
    import("@/src/features/appointments/components/AppointmentFilterModal").then((module) => ({
      default: module.AppointmentFilterModal,
    })),
  { ssr: false },
);

const DayRestrictionModal = dynamic(
  () =>
    import("@/src/features/appointments/components/DayRestrictionModal").then((module) => ({
      default: module.DayRestrictionModal,
    })),
  { ssr: false },
);

const DeleteDayRestrictionModal = dynamic(
  () =>
    import("@/src/features/appointments/components/DeleteDayRestrictionModal").then((module) => ({
      default: module.DeleteDayRestrictionModal,
    })),
  { ssr: false },
);

function SummarySkeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-full bg-white/10 ${className}`.trim()} />;
}

export function AgendaPage() {
  const router = useRouter();
  const { accessToken, fetchWithAuth, profilePic, userRole } = useAuth();
  const agenda = useAppointments({ accessToken, fetchWithAuth });
  const appointmentsDateListRef = useRef<HTMLDivElement>(null);
  const [showSummaryValues, setShowSummaryValues] = useState(false);

  useEffect(() => {
    const list = appointmentsDateListRef.current;
    if (!list) {
      return;
    }
    const key = formatDateParam(agenda.selectedDate);
    const target = list.querySelector<HTMLElement>(`[data-date="${key}"]`);
    target?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [agenda.selectedDate]);

  const summaryValue = formatCurrency(agenda.appointmentsSummary.completed_total_price ?? "0");
  const totalAppointments = agenda.appointmentsSummary.total ?? agenda.appointmentsCount;
  const scheduledByProfessional = agenda.appointmentsSummary.scheduled_by_professional ?? [];
  const isAllDayRestriction = agenda.dayRestriction?.is_all_day === true;
  const dayRestrictionStartTime = agenda.dayRestriction
    ? new Date(agenda.dayRestriction.start_datetime).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  const dayRestrictionFinishTime = agenda.dayRestriction
    ? new Date(agenda.dayRestriction.finish_datetime).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const nextPendingLabel = agenda.nextPendingAppointment
    ? new Date(agenda.nextPendingAppointment.date_time).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const quickSummaryText = agenda.pendingAppointmentsCount === 1
    ? "1 atendimento pendente"
    : `${agenda.pendingAppointmentsCount} atendimentos pendentes`;

  const summaryValueDisplay = showSummaryValues ? summaryValue : "R$ •••••";
  const servicesValueDisplay = showSummaryValues
    ? `${agenda.appointmentsSummary.completed_total_count ?? 0} / ${totalAppointments}`
    : "••• / •••";
  const completedTotalDisplay = showSummaryValues
    ? formatCurrency(agenda.appointmentsSummary.completed_total_price ?? "0")
    : "R$ •••••";
  const totalScheduledDisplay = showSummaryValues
    ? formatCurrency(agenda.appointmentsSummary.total_scheduled ?? "0")
    : "R$ •••••";
  const scheduledStatusTotalDisplay = showSummaryValues
    ? agenda.appointmentsSummary.scheduled_status_total ?? 0
    : "•••";

  return (
    <DashboardShell activeTab="agenda" profilePic={profilePic} userRole={userRole}>
      <div className="flex flex-col gap-5 pb-40">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60">Agenda</p>
            <p className="text-3xl font-semibold">Seus agendamentos</p>
            <p className="text-xs text-white/60">{agenda.appointmentsCount} encontrado(s)</p>
          </div>
          <button
            type="button"
            onClick={agenda.handleOpenAppointmentsFilter}
            className="rounded-2xl border border-white/10 p-2 text-white/80"
          >
            <Filter className="h-5 w-5" />
          </button>
        </header>

        <section className="overflow-hidden rounded-[32px] border border-white/8 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.1),_transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 backdrop-blur-sm">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">Panorama</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Resumo do período</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowSummaryValues((prev) => !prev)}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                aria-label={showSummaryValues ? "Ocultar valores" : "Mostrar valores"}
                title={showSummaryValues ? "Ocultar valores" : "Mostrar valores"}
              >
                {showSummaryValues ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <article className="min-w-0 rounded-[28px] border border-white/8 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/40">Faturamento</p>
                {agenda.appointmentsLoading ? (
                  <div className="mt-4 space-y-3">
                    <SummarySkeleton className="h-10 w-full max-w-40 rounded-2xl" />
                    <SummarySkeleton className="h-4 w-52" />
                  </div>
                ) : (
                  <>
                    <p className="mt-4 truncate text-[clamp(1.5rem,6vw,2.25rem)] font-semibold tracking-tight text-white">
                      {summaryValueDisplay}
                    </p>
                  </>
                )}
              </article>

              <article className="min-w-0 rounded-[28px] border border-white/8 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/40">Serviços</p>
                {agenda.appointmentsLoading ? (
                  <div className="mt-4 space-y-3">
                    <SummarySkeleton className="h-10 w-full max-w-28 rounded-2xl" />
                    <SummarySkeleton className="h-4 w-40" />
                  </div>
                ) : (
                  <>
                    <p className="mt-4 truncate text-[clamp(1.5rem,6vw,2.25rem)] font-semibold tracking-tight text-white">
                      {servicesValueDisplay}
                    </p>
                  </>
                )}
              </article>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-black/15 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/40">Detalhamento</p>
                </div>
                <button
                  type="button"
                  onClick={() => agenda.setShowAppointmentsSummaryDetails((prev) => !prev)}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  {agenda.showAppointmentsSummaryDetails ? "Ocultar detalhes" : "Ver detalhes"}
                </button>
              </div>

              {agenda.appointmentsLoading ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-3">
                    <SummarySkeleton className="h-3 w-20" />
                    <SummarySkeleton className="mt-3 h-7 w-24 rounded-xl" />
                  </div>
                  <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-3">
                    <SummarySkeleton className="h-3 w-20" />
                    <SummarySkeleton className="mt-3 h-7 w-24 rounded-xl" />
                  </div>
                  <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-3">
                    <SummarySkeleton className="h-3 w-20" />
                    <SummarySkeleton className="mt-3 h-7 w-24 rounded-xl" />
                  </div>
                </div>
              ) : agenda.showAppointmentsSummaryDetails ? (
                <div className="mt-4 space-y-4 text-sm text-white/70">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-3">
                      <p className="text-xs text-white/50">Total realizado</p>
                      <p className="mt-2 text-lg font-semibold text-white">{completedTotalDisplay}</p>
                    </div>
                    <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-3">
                      <p className="text-xs text-white/50">Total previsto</p>
                      <p className="mt-2 text-lg font-semibold text-white">{totalScheduledDisplay}</p>
                    </div>
                    <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-3">
                      <p className="text-xs text-white/50">Total pendente</p>
                      <p className="mt-2 text-lg font-semibold text-white">{scheduledStatusTotalDisplay}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
                      Atendimentos por profissional
                    </p>
                    {scheduledByProfessional.length === 0 ? (
                      <p className="mt-3 rounded-2xl border border-white/6 bg-white/[0.03] px-3 py-2 text-sm text-white/55">
                        Nenhum profissional encontrado.
                      </p>
                    ) : (
                      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                        {scheduledByProfessional.map((item) => (
                          <li
                            key={item.id}
                            className="flex items-center justify-between rounded-2xl border border-white/6 bg-white/[0.03] px-3 py-2.5"
                          >
                            <span className="text-sm text-white/75">{item.name}</span>
                            <span className="text-sm font-semibold text-white">{item.total}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <div
          ref={appointmentsDateListRef}
          className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 snap-x snap-mandatory"
        >
          {agenda.appointmentsDateOptions.map((option) => (
            <button
              type="button"
              key={option.key}
              data-date={option.key}
              onClick={() => agenda.handleSelectDate(option.date)}
              className={`snap-center rounded-full px-5 py-2 text-sm font-medium ${
                formatDateParam(agenda.selectedDate) === option.key
                  ? "bg-white text-black"
                  : "bg-white/10 text-white/70"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {agenda.appointmentsError ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {agenda.appointmentsError}
          </div>
        ) : null}

        {agenda.dayRestriction ? (
          <article className="rounded-3xl border border-amber-500/30 bg-amber-500/10 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-amber-100">
                {agenda.dayRestriction.is_all_day
                  ? "Existe uma restrição do dia inteiro para este dia"
                  : `Este dia existe restrição de horário das ${dayRestrictionStartTime} às ${dayRestrictionFinishTime}`}
              </p>
              <button
                type="button"
                onClick={agenda.handleOpenDeleteDayRestrictionModal}
                className="rounded-full border border-amber-300/30 p-2 text-amber-100 transition hover:bg-amber-300/10"
                aria-label="Excluir restrição"
                title="Excluir restrição"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </article>
        ) : null}

        {!agenda.appointmentsLoading ? (
          <div className="flex items-center gap-3 rounded-2xl border border-neutral-900 bg-neutral-900/50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black">
              <Clock3 className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{quickSummaryText}</p>
              <p className="mt-0.5 text-xs text-neutral-500">
                {nextPendingLabel ? `Próximo às ${nextPendingLabel}` : "Sem próximo atendimento no período"}
              </p>
            </div>
          </div>
        ) : null}

        {agenda.appointmentsLoading ? (
          <div className="flex items-center justify-center py-10">
            <Calendar className="h-6 w-6 animate-pulse text-white/70" />
          </div>
        ) : agenda.appointments.length === 0 ? (
          <p className="rounded-3xl border border-white/5 bg-[#0b0b0b] px-4 py-6 text-center text-sm text-white/60">
            Nenhum agendamento para o período selecionado.
          </p>
        ) : (
          <AppointmentList
            appointments={agenda.appointments}
            servicesList={agenda.servicesList}
            statusUpdatingId={agenda.statusUpdatingId}
            onOpen={(appointmentId) => router.push(`/dashboard/agenda/${appointmentId}`)}
            onComplete={async (appointmentId, paymentType: PaymentType, serviceIds: number[]) => {
              await agenda.updateAppointmentStatus(appointmentId, "realizado", paymentType, serviceIds);
            }}
            onReopen={async (appointmentId) => {
              await agenda.updateAppointmentStatus(appointmentId, "agendado");
            }}
          />
        )}

        <div className="fixed bottom-28 right-6 z-40 flex flex-col items-end gap-3">
          {agenda.showAgendaFabOptions ? (
            <>
              <button
                type="button"
                onClick={() => router.push("/dashboard/agenda/novo")}
                disabled={isAllDayRestriction}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Calendar className="h-4 w-4" />
                Novo agendamento
              </button>
              <button
                type="button"
                onClick={agenda.handleOpenDayRestrictionModal}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black shadow-lg"
              >
                <Waves className="h-4 w-4" />
                Restrição de agenda
              </button>
            </>
          ) : null}
          <button
            type="button"
            onClick={agenda.handleToggleAgendaFab}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-xl transition-transform duration-200"
          >
            <Plus
              className={`h-6 w-6 transition-transform duration-200 ${
                agenda.showAgendaFabOptions ? "rotate-45" : ""
              }`}
            />
          </button>
        </div>

        <AppointmentFilterModal
          open={agenda.showAppointmentsFilterModal}
          professionalsList={agenda.professionalsList}
          professionalsError={agenda.professionalsError}
          serviceCategories={agenda.serviceCategories}
          pendingProfessionalId={agenda.pendingProfessionalId}
          pendingCategoryId={agenda.pendingCategoryId ?? ""}
          pendingServiceId={agenda.pendingServiceId}
          pendingStartDate={agenda.pendingStartDate}
          pendingEndDate={agenda.pendingEndDate}
          onClose={() => agenda.setShowAppointmentsFilterModal(false)}
          onClear={agenda.handleClearAppointmentsFilter}
          onApply={agenda.handleApplyAppointmentsFilter}
          onChangeProfessionalId={agenda.setPendingProfessionalId}
          onChangeCategoryId={agenda.setPendingCategoryId}
          onChangeServiceId={agenda.setPendingServiceId}
          onChangeStartDate={agenda.setPendingStartDate}
          onChangeEndDate={agenda.setPendingEndDate}
        />

        <DayRestrictionModal
          open={agenda.showDayRestrictionModal}
          form={agenda.dayRestrictionForm}
          error={agenda.dayRestrictionError}
          submitting={agenda.dayRestrictionSubmitting}
          onClose={agenda.handleCloseDayRestrictionModal}
          onSubmit={agenda.handleSubmitDayRestriction}
          onChange={(updater) => agenda.setDayRestrictionForm((current) => updater(current))}
        />

        <DeleteDayRestrictionModal
          open={agenda.showDeleteDayRestrictionModal}
          error={agenda.deleteDayRestrictionError}
          submitting={agenda.deleteDayRestrictionSubmitting}
          onClose={agenda.handleCloseDeleteDayRestrictionModal}
          onConfirm={agenda.handleDeleteDayRestriction}
        />
      </div>
    </DashboardShell>
  );
}
