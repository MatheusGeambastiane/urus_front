"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Clock3,
  Loader2,
  Repeat2,
  UserRound,
} from "lucide-react";
import { DashboardShell } from "@/src/features/dashboard/components/DashboardShell";
import { professionalProfilesSimpleListEndpoint } from "@/src/features/appointments/services/endpoints";
import { professionalIntervalsEndpointBase } from "@/src/features/users/services/endpoints";
import { useAuth } from "@/src/features/shared/hooks/useAuth";
import { getApiErrorMessage } from "@/src/features/shared/utils/api-errors";
import { formatDateParam } from "@/src/features/shared/utils/date";
import type { ProfessionalSimple } from "@/src/features/services/types";

const weekDays = [
  { shortLabel: "S", label: "Segunda", value: 0 },
  { shortLabel: "T", label: "Terça", value: 1 },
  { shortLabel: "Q", label: "Quarta", value: 2 },
  { shortLabel: "Q", label: "Quinta", value: 3 },
  { shortLabel: "S", label: "Sexta", value: 4 },
  { shortLabel: "S", label: "Sábado", value: 5 },
];

type IntervalForm = {
  professionalId: string;
  dateStart: string;
  dateFinish: string;
  hourStart: string;
  hourFinish: string;
  repeat: boolean;
  weekDays: number[];
};

type ExistingInterval = {
  id: number;
  professional_name: string;
  created_by_name: string | null;
  created_at: string;
  date_start: string | null;
  date_finish: string | null;
  hour_start: string;
  hour_finish: string;
  week_days: number[];
};

type IntervalsResponse = {
  results: ExistingInterval[];
  next: string | null;
};

const formatDate = (value: string) => value.split("-").reverse().join("/");
const formatHour = (value: string) => value.slice(0, 5);
const getInitials = (value: string) =>
  value.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
const formatCreatedAt = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));

const formatPeriod = (interval: ExistingInterval) => {
  if (interval.week_days.length) {
    const days = interval.week_days
      .map((day) => weekDays.find((item) => item.value === day)?.label ?? (day === 6 ? "Domingo" : null))
      .filter(Boolean)
      .join(", ");
    return days;
  }
  if (interval.date_start && interval.date_finish) {
    return interval.date_start === interval.date_finish
      ? formatDate(interval.date_start)
      : `${formatDate(interval.date_start)} a ${formatDate(interval.date_finish)}`;
  }
  return "Período não informado";
};

const createInitialForm = (): IntervalForm => {
  const today = formatDateParam(new Date());

  return {
    professionalId: "",
    dateStart: today,
    dateFinish: today,
    hourStart: "",
    hourFinish: "",
    repeat: false,
    weekDays: [],
  };
};

const normalizeTime = (value: string) => (value.length === 5 ? `${value}:00` : value);

export function CreateProfessionalIntervalPage() {
  const router = useRouter();
  const { accessToken, fetchWithAuth, profilePic, userRole } = useAuth();
  const [form, setForm] = useState<IntervalForm>(createInitialForm);
  const [professionals, setProfessionals] = useState<ProfessionalSimple[]>([]);
  const [professionalsLoading, setProfessionalsLoading] = useState(false);
  const [professionalsError, setProfessionalsError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => formatDateParam(new Date()));
  const [intervals, setIntervals] = useState<ExistingInterval[]>([]);
  const [intervalsLoading, setIntervalsLoading] = useState(false);
  const [intervalsError, setIntervalsError] = useState<string | null>(null);
  const [intervalsRefresh, setIntervalsRefresh] = useState(0);

  useEffect(() => {
    if (!accessToken || !selectedDate) return;
    const controller = new AbortController();

    const loadIntervals = async () => {
      setIntervalsLoading(true);
      setIntervalsError(null);
      try {
        const items: ExistingInterval[] = [];
        let url: string | null = `${professionalIntervalsEndpointBase}active/?date=${encodeURIComponent(selectedDate)}&page_size=100`;
        while (url) {
          const response = await fetchWithAuth(url, {
            credentials: "include",
            headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
            signal: controller.signal,
          });
          if (!response.ok) {
            const payload: unknown = await response.json().catch(() => null);
            throw new Error(getApiErrorMessage(payload, "Não foi possível carregar os intervalos."));
          }
          const payload = (await response.json()) as IntervalsResponse;
          items.push(...payload.results);
          url = payload.next;
        }
        if (!controller.signal.aborted) setIntervals(items);
      } catch (error) {
        if (!controller.signal.aborted) {
          setIntervalsError(error instanceof Error ? error.message : "Erro inesperado ao carregar intervalos.");
        }
      } finally {
        if (!controller.signal.aborted) setIntervalsLoading(false);
      }
    };

    void loadIntervals();
    return () => controller.abort();
  }, [accessToken, fetchWithAuth, selectedDate, intervalsRefresh]);

  useEffect(() => {
    if (!accessToken) return;

    const controller = new AbortController();

    const loadProfessionals = async () => {
      setProfessionalsLoading(true);
      setProfessionalsError(null);

      try {
        const response = await fetchWithAuth(professionalProfilesSimpleListEndpoint, {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          const payload: unknown = await response.json().catch(() => null);
          throw new Error(getApiErrorMessage(payload, "Não foi possível carregar os profissionais."));
        }

        const payload = (await response.json()) as ProfessionalSimple[];
        setProfessionals(Array.isArray(payload) ? payload : []);
      } catch (error) {
        if (!controller.signal.aborted) {
          setProfessionalsError(
            error instanceof Error ? error.message : "Erro inesperado ao carregar profissionais.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setProfessionalsLoading(false);
        }
      }
    };

    void loadProfessionals();
    return () => controller.abort();
  }, [accessToken, fetchWithAuth]);

  const selectedProfessional = useMemo(
    () => professionals.find((professional) => String(professional.id) === form.professionalId),
    [form.professionalId, professionals],
  );

  const selectedWeekDayNames = useMemo(
    () =>
      weekDays
        .filter((day) => form.weekDays.includes(day.value))
        .map((day) => day.label)
        .join(", "),
    [form.weekDays],
  );

  const updateField = <Field extends keyof IntervalForm>(field: Field, value: IntervalForm[Field]) => {
    setSuccessMessage(null);
    setSubmitError(null);
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleWeekDay = (dayValue: number) => {
    const nextDays = form.weekDays.includes(dayValue)
      ? form.weekDays.filter((value) => value !== dayValue)
      : [...form.weekDays, dayValue].sort((first, second) => first - second);

    updateField("weekDays", nextDays);
  };

  const validateForm = () => {
    if (!form.professionalId) return "Selecione um profissional.";
    if (!form.hourStart || !form.hourFinish) return "Informe o horário inicial e final.";
    if (form.hourFinish <= form.hourStart) return "O horário final deve ser posterior ao inicial.";
    if (form.repeat && form.weekDays.length === 0) {
      return "Selecione ao menos um dia para repetir.";
    }
    if (!form.repeat && (!form.dateStart || !form.dateFinish)) {
      return "Informe a data inicial e final.";
    }
    if (!form.repeat && form.dateFinish < form.dateStart) {
      return "A data final deve ser igual ou posterior à inicial.";
    }
    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);

    if (!accessToken) {
      setSubmitError("Sessão expirada. Faça login novamente.");
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    const professionalId = Number(form.professionalId);
    const payload = form.repeat
      ? {
          professional: professionalId,
          hour_start: normalizeTime(form.hourStart),
          hour_finish: normalizeTime(form.hourFinish),
          week_days: form.weekDays,
        }
      : {
          professional: professionalId,
          date_start: form.dateStart,
          date_finish: form.dateFinish,
          hour_start: form.hourStart,
          hour_finish: form.hourFinish,
        };

    setSubmitting(true);
    try {
      const response = await fetchWithAuth(professionalIntervalsEndpointBase, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const responsePayload: unknown = await response.json().catch(() => null);
        throw new Error(getApiErrorMessage(responsePayload, "Não foi possível criar o intervalo."));
      }

      setSuccessMessage(`Intervalo de ${selectedProfessional?.user_name ?? "profissional"} criado com sucesso.`);
      setIntervalsRefresh((current) => current + 1);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Erro inesperado ao criar intervalo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell activeTab="home" profilePic={profilePic} userRole={userRole}>
      <div className="mx-auto max-w-5xl space-y-5 pb-8">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/home")}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-white/35 hover:bg-white/[0.06] hover:text-white"
            aria-label="Voltar para a página inicial"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/35">Agenda</p>
            <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Criar novo intervalo
            </h1>
          </div>
          <button
            type="submit"
            disabled={submitting || professionalsLoading || Boolean(successMessage)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : successMessage ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : null}
            <span className="hidden sm:inline">
              {submitting ? "Salvando..." : successMessage ? "Intervalo criado" : "Salvar intervalo"}
            </span>
            <span className="sm:hidden">
              {submitting ? "Salvando" : successMessage ? "Criado" : "Salvar"}
            </span>
          </button>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <section className="rounded-[28px] border border-white/8 bg-[#0b0b0b] p-5 shadow-card sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-white">Profissional</p>
                  <p className="text-sm text-white/45">Selecione quem ficará indisponível.</p>
                </div>
              </div>

              <label className="block text-sm text-white/70">
                Perfil profissional
                <div className="relative mt-2">
                  <select
                    value={form.professionalId}
                    onChange={(event) => updateField("professionalId", event.target.value)}
                    disabled={professionalsLoading}
                    className="w-full appearance-none rounded-2xl border border-white/10 bg-[#050505] px-4 py-3.5 pr-11 text-sm text-white outline-none transition focus:border-white/40 disabled:cursor-wait disabled:text-white/40"
                  >
                    <option value="">
                      {professionalsLoading ? "Carregando profissionais..." : "Selecione um profissional"}
                    </option>
                    {professionals.map((professional) => (
                      <option key={professional.id} value={professional.id}>
                        {professional.user_name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                </div>
              </label>

              {professionalsError ? (
                <p className="mt-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {professionalsError}
                </p>
              ) : null}
              {!professionalsLoading && !professionalsError && professionals.length === 0 ? (
                <p className="mt-3 text-sm text-zinc-200/80">Nenhum perfil profissional disponível.</p>
              ) : null}
            </section>

            <section className="rounded-[28px] border border-white/8 bg-[#0b0b0b] p-5 shadow-card sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-white">Período</p>
                  <p className="text-sm text-white/45">Defina quando o intervalo começa e termina.</p>
                </div>
              </div>

              <div className={`grid gap-4 sm:grid-cols-2 ${form.repeat ? "opacity-40" : ""}`}>
                <label className="text-sm text-white/70">
                  Data de início
                  <input
                    type="date"
                    value={form.dateStart}
                    onChange={(event) => updateField("dateStart", event.target.value)}
                    disabled={form.repeat}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#050505] px-4 py-3 text-sm text-white outline-none transition focus:border-white/40 disabled:cursor-not-allowed"
                  />
                </label>
                <label className="text-sm text-white/70">
                  Data final
                  <input
                    type="date"
                    min={form.dateStart}
                    value={form.dateFinish}
                    onChange={(event) => updateField("dateFinish", event.target.value)}
                    disabled={form.repeat}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#050505] px-4 py-3 text-sm text-white outline-none transition focus:border-white/40 disabled:cursor-not-allowed"
                  />
                </label>
              </div>

              {form.repeat ? (
                <p className="mt-3 text-xs text-white/40">As datas não são usadas em intervalos recorrentes.</p>
              ) : null}

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="text-sm text-white/70">
                  Horário de início
                  <div className="relative mt-2">
                    <input
                      type="time"
                      value={form.hourStart}
                      onChange={(event) => updateField("hourStart", event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-[#050505] px-4 py-3 pr-11 text-sm text-white outline-none transition focus:border-white/40"
                    />
                    <Clock3 className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  </div>
                </label>
                <label className="text-sm text-white/70">
                  Horário final
                  <div className="relative mt-2">
                    <input
                      type="time"
                      value={form.hourFinish}
                      onChange={(event) => updateField("hourFinish", event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-[#050505] px-4 py-3 pr-11 text-sm text-white outline-none transition focus:border-white/40"
                    />
                    <Clock3 className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  </div>
                </label>
              </div>
            </section>

            <section className="rounded-[28px] border border-white/8 bg-[#0b0b0b] p-5 shadow-card sm:p-6">
              <button
                type="button"
                onClick={() => updateField("repeat", !form.repeat)}
                className="flex w-full items-center justify-between gap-4 text-left"
                aria-pressed={form.repeat}
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <Repeat2 className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-semibold text-white">Este intervalo se repete?</span>
                    <span className="mt-0.5 block text-sm text-white/45">Use os mesmos horários durante a semana.</span>
                  </span>
                </span>
                <span
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                    form.repeat ? "bg-white" : "bg-white/15"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full transition ${
                      form.repeat ? "left-6 bg-black" : "left-1 bg-white/70"
                    }`}
                  />
                </span>
              </button>

              {form.repeat ? (
                <div className="mt-5 border-t border-white/8 pt-5">
                  <p className="text-sm text-white/65">Dias da semana</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {weekDays.map((day) => {
                      const selected = form.weekDays.includes(day.value);
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleWeekDay(day.value)}
                          aria-label={`${selected ? "Remover" : "Selecionar"} ${day.label}`}
                          aria-pressed={selected}
                          className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold transition ${
                            selected
                              ? "bg-white text-black shadow-[0_8px_24px_rgba(255,255,255,0.12)]"
                              : "border border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {day.shortLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6">
            <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.10),transparent_42%),#0b0b0b] p-5 shadow-card">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/35">Resumo</p>
              <p className="mt-4 text-lg font-semibold text-white">
                {selectedProfessional?.user_name ?? "Profissional não selecionado"}
              </p>
              <div className="mt-5 space-y-4 text-sm">
                <div>
                  <p className="text-white/35">Tipo</p>
                  <p className="mt-1 text-white/80">{form.repeat ? "Recorrente" : "Pontual"}</p>
                </div>
                <div>
                  <p className="text-white/35">Período</p>
                  <p className="mt-1 text-white/80">
                    {form.repeat
                      ? selectedWeekDayNames || "Selecione os dias"
                      : form.dateStart && form.dateFinish
                        ? `${form.dateStart.split("-").reverse().join("/")} até ${form.dateFinish.split("-").reverse().join("/")}`
                        : "Datas não informadas"}
                  </p>
                </div>
                <div>
                  <p className="text-white/35">Horário</p>
                  <p className="mt-1 text-white/80">
                    {form.hourStart && form.hourFinish
                      ? `${form.hourStart} às ${form.hourFinish}`
                      : "Horários não informados"}
                  </p>
                </div>
              </div>
            </section>

            {submitError ? (
              <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-100" role="alert">
                {submitError}
              </div>
            ) : null}
            {successMessage ? (
              <div className="flex gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100" role="status">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            ) : null}
          </aside>
        </div>
      </form>
        <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_100%_0%,rgba(255,255,255,0.065),transparent_38%),#0b0b0b] shadow-card">
          <div className="flex flex-wrap items-end justify-between gap-5 border-b border-white/8 px-5 py-6 sm:px-7">
            <div className="min-w-0">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)]" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">Agenda do dia</p>
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">Intervalos existentes</h2>
              <p className="mt-1.5 text-sm text-white/45">
                {selectedDate
                  ? `${selectedDate === formatDateParam(new Date()) ? "Hoje" : formatDate(selectedDate)} · ${intervalsLoading ? "Carregando" : intervalsError ? "Consulta indisponível" : `${intervals.length} ${intervals.length === 1 ? "intervalo" : "intervalos"}`}`
                  : "Selecione uma data para consultar"}
              </p>
            </div>
            <label className="block w-full text-xs font-medium text-white/60 sm:w-auto">
              Ver por data
              <span className="relative mt-2 block">
                <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="w-full min-w-48 rounded-xl border border-white/15 bg-white/[0.055] py-3 pl-10 pr-3 text-sm text-white outline-none transition hover:border-white/30 focus:border-white/50 sm:w-auto [color-scheme:dark]"
                />
              </span>
            </label>
          </div>
          <div className="p-5 sm:p-7" aria-live="polite">
            {intervalsLoading ? (
              <div className="grid gap-4 sm:grid-cols-2" role="status" aria-label="Carregando intervalos">
                {[0, 1].map((index) => (
                  <div key={index} className="h-64 animate-pulse rounded-[22px] border border-white/8 bg-white/[0.035]" />
                ))}
              </div>
            ) : intervalsError ? (
              <p className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-4 text-sm text-red-100" role="alert">{intervalsError}</p>
            ) : !selectedDate || intervals.length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center rounded-[22px] border border-dashed border-white/15 bg-white/[0.02] px-5 text-center">
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] text-white/50">
                  <CalendarDays className="h-5 w-5" />
                </span>
                <p className="font-medium text-white/80">{selectedDate ? "Nenhum intervalo nesta data" : "Escolha uma data"}</p>
                <p className="mt-1 text-sm text-white/40">{selectedDate ? "Os intervalos ativos aparecerão aqui." : "Use o filtro acima para consultar os intervalos."}</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {intervals.map((interval) => (
                  <article
                    key={interval.id}
                    className="group relative flex min-h-64 flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(155deg,rgba(255,255,255,0.065),rgba(255,255,255,0.018)_48%,rgba(255,255,255,0.035))] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:shadow-[0_20px_40px_rgba(0,0,0,0.28)] sm:p-6"
                  >
                    <div className="absolute inset-y-6 left-0 w-0.5 rounded-r-full bg-white/45 transition group-hover:bg-white/80" />
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-xs font-semibold tracking-wider text-white/90">
                          {getInitials(interval.professional_name)}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-white/40">Profissional</p>
                          <h3 className="truncate text-sm font-semibold text-white sm:text-base" title={interval.professional_name}>{interval.professional_name}</h3>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full border border-white/12 bg-white/[0.065] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.13em] text-white/65">
                        {interval.week_days.length ? "Recorrente" : "Pontual"}
                      </span>
                    </div>

                    <div className="mt-7 flex items-center gap-3 text-white">
                      <Clock3 className="h-4 w-4 shrink-0 text-white/35" />
                      <p className="text-2xl font-semibold tabular-nums tracking-tight sm:text-[1.7rem]">
                        {formatHour(interval.hour_start)} <span className="font-normal text-white/30">—</span> {formatHour(interval.hour_finish)}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-2" aria-hidden="true">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/65" />
                      <span className="h-px flex-1 bg-gradient-to-r from-white/45 to-white/10" />
                      <span className="h-1.5 w-1.5 rounded-full border border-white/35" />
                    </div>
                    <p className="mt-3 text-sm text-white/60"><span className="mr-2 text-white/35">Período</span>{formatPeriod(interval)}</p>

                    <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-white/10 pt-4 text-xs text-white/45">
                      <UserRound className="h-3.5 w-3.5 shrink-0" />
                      <span>Criado por <span className="font-medium text-white/75">{interval.created_by_name ?? "Não informado"}</span></span>
                      <span className="hidden text-white/25 sm:inline">·</span>
                      <time dateTime={interval.created_at} className="text-white/55">{formatCreatedAt(interval.created_at)}</time>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
