"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowClockwise,
  CalendarDays,
  Check,
  Clock3,
  NotebookPen,
  Sparkles,
  UserRound,
} from "lucide-react";

import {
  type AppointmentStatus,
  useDashboardAppointments,
} from "@/components/dashboard/agenda/use-dashboard-appointments";

const statusOptions: Array<{ value: AppointmentStatus; label: string }> = [
  { value: "agendado", label: "Agendado" },
  { value: "iniciado", label: "Em andamento" },
  { value: "realizado", label: "Finalizado" },
];

const paymentOptions = ["pix", "dinheiro", "credito", "debito"] as const;

type AgendaPageProps = {
  firstName: string;
};

type NewAppointmentFormState = {
  date: string;
  time: string;
  clientId: string;
  professionalId: string;
  serviceId: string;
  paymentType: (typeof paymentOptions)[number];
  price: string;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const formatDisplayDate = (iso: string) => {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "full",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

export function AgendaPage({ firstName }: AgendaPageProps) {
  const today = new Date();
  const todayDate = today.toISOString().slice(0, 10);
  const todayTime = today.toISOString().slice(11, 16);
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    appointments,
    createAppointment,
    dateFilter,
    error,
    isLoading,
    refresh,
    setDateFilter,
    setStatusFilter,
    statusFilter,
    summary,
  } = useDashboardAppointments(todayDate);

  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [formState, setFormState] = useState<NewAppointmentFormState>({
    date: todayDate,
    time: todayTime,
    clientId: "",
    professionalId: "",
    serviceId: "",
    paymentType: "pix",
    price: "0",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const shouldShowEmptyState = !isLoading && appointments.length === 0;
  const quickActionParam = searchParams.get("novo_atendimento");

  useEffect(() => {
    if (quickActionParam === "1") {
      setIsNewAppointmentOpen(true);
      router.replace("/dashboard/agenda", { scroll: false });
    }
  }, [quickActionParam, router]);

  const totalValue = useMemo(() => currencyFormatter.format(summary.completedValue), [summary.completedValue]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    const clientId = Number.parseInt(formState.clientId, 10);
    const professionalId = Number.parseInt(formState.professionalId, 10);
    const serviceId = Number.parseInt(formState.serviceId, 10);
    const price = Number.parseFloat(formState.price);

    if (Number.isNaN(clientId) || Number.isNaN(professionalId) || Number.isNaN(serviceId)) {
      setFormError("Informe IDs válidos para cliente, profissional e serviço.");
      return;
    }

    if (Number.isNaN(price) || price <= 0) {
      setFormError("Informe um valor válido para o atendimento.");
      return;
    }

    const startsAtIso = `${formState.date}T${formState.time}:00`;
    setIsSubmitting(true);
    try {
      await createAppointment({
        clientId,
        professionalId,
        serviceIds: [serviceId],
        paymentType: formState.paymentType,
        startsAtIso,
        price,
      });
      setSuccessMessage("Agendamento criado com sucesso.");
      setFormState((previous) => ({
        ...previous,
        clientId: "",
        professionalId: "",
        serviceId: "",
        price: "0",
      }));
      setIsNewAppointmentOpen(false);
      await refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro inesperado ao criar agendamento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 pb-28 pt-6 text-white">
      <header className="rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 p-6 shadow-lg">
        <p className="text-sm uppercase tracking-wide text-white/70">Agenda inteligente</p>
        <h1 className="mt-2 text-3xl font-semibold">Bem-vindo de volta, {firstName}</h1>
        <p className="mt-1 text-sm text-white/80">
          Centralize o fluxo de atendimentos e acompanhe a ocupação diária da equipe.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2 text-sm font-medium backdrop-blur transition hover:bg-white/25"
            onClick={() => setIsNewAppointmentOpen(true)}
          >
            <NotebookPen className="h-4 w-4" />
            Novo atendimento
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2 text-sm font-medium backdrop-blur transition hover:border-white"
            onClick={() => refresh()}
          >
            <ArrowClockwise className="h-4 w-4" />
            Atualizar lista
          </button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-white/70">Total agendado</p>
          <p className="mt-2 text-3xl font-semibold">{summary.totalCount}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-white/70">Finalizados</p>
          <p className="mt-2 text-3xl font-semibold">{summary.completedCount}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-white/70">Receita confirmada</p>
          <p className="mt-2 text-3xl font-semibold">{totalValue}</p>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-1 flex-col gap-2">
            <label className="text-sm font-medium">Data</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="rounded-2xl border border-white/20 bg-transparent px-4 py-2 text-sm focus:border-white focus:outline-none"
            />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <label className="text-sm font-medium">Status</label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as AppointmentStatus)}
              className="rounded-2xl border border-white/20 bg-transparent px-4 py-2 text-sm focus:border-white focus:outline-none"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-[#050505] text-white">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-white/60">{dateFilter}</p>
            <h2 className="text-2xl font-semibold">Seus agendamentos</h2>
          </div>
          {isLoading ? (
            <span className="text-sm text-white/70">Carregando...</span>
          ) : (
            <span className="text-sm text-white/70">{appointments.length} registros</span>
          )}
        </div>

        {shouldShowEmptyState ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/20 p-10 text-center">
            <Sparkles className="h-8 w-8 text-white/60" />
            <p className="mt-3 text-lg font-semibold">Sem agendamentos para o filtro selecionado</p>
            <p className="mt-1 text-sm text-white/60">
              Que tal utilizar o botão &quot;Novo atendimento&quot; para iniciar o dia?
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {appointments.map((appointment) => (
              <li key={appointment.id} className="rounded-2xl border border-white/15 bg-[#070707] p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-white/60">#{appointment.id}</p>
                    <p className="text-xl font-semibold">
                      {appointment.client_name ?? "Cliente não informado"}
                    </p>
                    <p className="text-sm text-white/70">
                      Profissional: {appointment.professional_name ?? "-"}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                    appointment.status === "realizado"
                      ? "bg-green-500/20 text-green-200"
                      : appointment.status === "iniciado"
                        ? "bg-yellow-500/20 text-yellow-200"
                        : "bg-white/10 text-white"
                  }`}>
                    <Check className="h-3 w-3" />
                    {statusOptions.find((option) => option.value === appointment.status)?.label ?? appointment.status}
                  </span>
                </div>
                <div className="mt-4 flex flex-col gap-2 text-sm text-white/70">
                  <p className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    {formatDisplayDate(appointment.date_time)}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4" />
                    {appointment.services.map((service) => service.name).join(", ") || "Sem serviços"}
                  </p>
                  <p className="flex items-center gap-2">
                    <UserRound className="h-4 w-4" />
                    {currencyFormatter.format(Number.parseFloat(appointment.price_paid ?? "0"))}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {isNewAppointmentOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-10">
          <div className="w-full max-w-lg rounded-3xl bg-[#050505] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Novo atendimento</h3>
              <button
                type="button"
                className="text-sm text-white/60 hover:text-white"
                onClick={() => setIsNewAppointmentOpen(false)}
              >
                Fechar
              </button>
            </div>
            <p className="mt-1 text-sm text-white/60">
              Utilize este formulário simplificado para iniciar um agendamento a partir de qualquer página.
            </p>
            <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="flex gap-4">
                <label className="flex flex-1 flex-col gap-2 text-sm">
                  Cliente (ID)
                  <input
                    type="number"
                    min="1"
                    value={formState.clientId}
                    onChange={(event) => setFormState((previous) => ({ ...previous, clientId: event.target.value }))}
                    className="rounded-2xl border border-white/20 bg-transparent px-4 py-2 focus:border-white focus:outline-none"
                    required
                  />
                </label>
                <label className="flex flex-1 flex-col gap-2 text-sm">
                  Profissional (ID)
                  <input
                    type="number"
                    min="1"
                    value={formState.professionalId}
                    onChange={(event) =>
                      setFormState((previous) => ({ ...previous, professionalId: event.target.value }))
                    }
                    className="rounded-2xl border border-white/20 bg-transparent px-4 py-2 focus:border-white focus:outline-none"
                    required
                  />
                </label>
              </div>
              <label className="flex flex-col gap-2 text-sm">
                Serviço (ID)
                <input
                  type="number"
                  min="1"
                  value={formState.serviceId}
                  onChange={(event) => setFormState((previous) => ({ ...previous, serviceId: event.target.value }))}
                  className="rounded-2xl border border-white/20 bg-transparent px-4 py-2 focus:border-white focus:outline-none"
                  required
                />
              </label>
              <div className="flex gap-4">
                <label className="flex flex-1 flex-col gap-2 text-sm">
                  Data
                  <input
                    type="date"
                    value={formState.date}
                    onChange={(event) => setFormState((previous) => ({ ...previous, date: event.target.value }))}
                    className="rounded-2xl border border-white/20 bg-transparent px-4 py-2 focus:border-white focus:outline-none"
                    required
                  />
                </label>
                <label className="flex flex-1 flex-col gap-2 text-sm">
                  Horário
                  <input
                    type="time"
                    value={formState.time}
                    onChange={(event) => setFormState((previous) => ({ ...previous, time: event.target.value }))}
                    className="rounded-2xl border border-white/20 bg-transparent px-4 py-2 focus:border-white focus:outline-none"
                    required
                  />
                </label>
              </div>
              <label className="flex flex-col gap-2 text-sm">
                Pagamento
                <select
                  value={formState.paymentType}
                  onChange={(event) =>
                    setFormState((previous) => ({
                      ...previous,
                      paymentType: event.target.value as NewAppointmentFormState["paymentType"],
                    }))
                  }
                  className="rounded-2xl border border-white/20 bg-transparent px-4 py-2 focus:border-white focus:outline-none"
                >
                  {paymentOptions.map((option) => (
                    <option key={option} value={option} className="bg-[#050505] text-white">
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm">
                Valor (R$)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.price}
                  onChange={(event) => setFormState((previous) => ({ ...previous, price: event.target.value }))}
                  className="rounded-2xl border border-white/20 bg-transparent px-4 py-2 focus:border-white focus:outline-none"
                  required
                />
              </label>
              {formError ? <p className="text-sm text-red-400">{formError}</p> : null}
              {successMessage ? <p className="text-sm text-emerald-400">{successMessage}</p> : null}
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Salvando..." : "Salvar agendamento"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
