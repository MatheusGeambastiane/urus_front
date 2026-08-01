"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, Check, Loader2, PenSquare, Plus, Trash2, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import type { TokenRefreshService } from "@/src/features/shared/utils/auth";
import { professionalProfileSchema, type ProfessionalProfileFormValues } from "@/src/features/users/schemas";
import { servicesSimpleListEndpoint } from "@/src/features/users/services/endpoints";
import type { ProfessionalInterval, ProfessionalProfileServiceItem, UserDetail } from "@/src/features/users/types";
import type { ServiceSimpleOption } from "@/src/features/services/types";

type ProfessionalProfileFormProps = {
  userDetail: UserDetail;
  accessToken: string | null;
  fetchWithAuth: TokenRefreshService["fetchWithAuth"];
  canEditUser: boolean;
  onSaveProfile: (
    profileId: number | undefined,
    payload: {
      professional_type: string;
      cnpj: string;
      commission: number;
      bio: string;
      services: number[];
    },
  ) => Promise<{ success: boolean; error?: string }>;
  onAddInterval: (payload: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  onDeactivateInterval: (intervalId: number) => Promise<{ success: boolean; error?: string }>;
  onSaveActiveInterval: (payload: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  onFeedback: (feedback: { type: "success" | "error"; message: string }) => void;
};

const professionalTypeOptions = [
  { value: "barbeiro", label: "Barbeiro" },
  { value: "massoterapeuta", label: "Massoterapeuta" },
];

const intervalWeekDays = [
  { label: "S", value: 0, name: "Segunda" },
  { label: "T", value: 1, name: "Terça" },
  { label: "Q", value: 2, name: "Quarta" },
  { label: "Q", value: 3, name: "Quinta" },
  { label: "S", value: 4, name: "Sexta" },
  { label: "S", value: 5, name: "Sábado" },
];

type IntervalFormState = {
  dateStart: string;
  dateFinish: string;
  hourStart: string;
  hourFinish: string;
  repeat: boolean;
  weekDays: number[];
};

const initialIntervalForm: IntervalFormState = {
  dateStart: "",
  dateFinish: "",
  hourStart: "",
  hourFinish: "",
  repeat: false,
  weekDays: [],
};

const formatCnpj = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 14);

  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

const removeCnpjMask = (value: string) => value.replace(/\D/g, "");

const normalizeTime = (value: string) => value.slice(0, 5);

const getServiceIds = (services: Array<number | ProfessionalProfileServiceItem>) =>
  services.map((service) => (typeof service === "number" ? service : service.id));

const getIntervalFormFromActiveInterval = (interval: ProfessionalInterval): IntervalFormState => ({
  dateStart: interval.date_start ?? "",
  dateFinish: interval.date_finish ?? "",
  hourStart: normalizeTime(interval.hour_start),
  hourFinish: normalizeTime(interval.hour_finish),
  repeat: interval.week_days.length > 0,
  weekDays: interval.week_days,
});

const formatDisplayDate = (value: string | null) => {
  if (!value) return "Sem data";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
};

const formatWeekDays = (weekDays: number[]) => {
  if (weekDays.length === 0) return "Sem repetição";

  const dayNames = new Map(intervalWeekDays.map((day) => [day.value, day.name]));
  return weekDays.map((day) => dayNames.get(day) ?? String(day)).join(", ");
};

const formatIntervalPeriod = (interval: ProfessionalInterval) => {
  if (!interval.date_start || !interval.date_finish) return "Intervalo recorrente";
  return `${formatDisplayDate(interval.date_start)} até ${formatDisplayDate(interval.date_finish)}`;
};

const formatCreatedAt = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export function ProfessionalProfileForm({
  userDetail,
  accessToken,
  fetchWithAuth,
  canEditUser,
  onSaveProfile,
  onAddInterval,
  onDeactivateInterval,
  onSaveActiveInterval,
  onFeedback,
}: ProfessionalProfileFormProps) {
  const [serviceOptions, setServiceOptions] = useState<ServiceSimpleOption[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [intervalModalOpen, setIntervalModalOpen] = useState(false);
  const [intervalForm, setIntervalForm] = useState<IntervalFormState>(initialIntervalForm);
  const [intervalError, setIntervalError] = useState<string | null>(null);
  const [intervalSubmitting, setIntervalSubmitting] = useState(false);
  const [activeIntervalModalOpen, setActiveIntervalModalOpen] = useState(false);
  const [activeIntervalToEdit, setActiveIntervalToEdit] = useState<ProfessionalInterval | null>(null);
  const [activeIntervalForm, setActiveIntervalForm] = useState<IntervalFormState>(initialIntervalForm);
  const [activeIntervalError, setActiveIntervalError] = useState<string | null>(null);
  const [activeIntervalSubmitting, setActiveIntervalSubmitting] = useState(false);
  const [showAllIntervals, setShowAllIntervals] = useState(false);
  const [intervalToDeactivate, setIntervalToDeactivate] = useState<ProfessionalInterval | null>(null);
  const [deactivateIntervalError, setDeactivateIntervalError] = useState<string | null>(null);
  const [deactivateIntervalSubmitting, setDeactivateIntervalSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProfessionalProfileFormValues>({
    resolver: zodResolver(professionalProfileSchema),
    defaultValues: {
      professionalType: "",
      cnpj: "",
      commission: "",
      bio: "",
      services: [],
    },
  });
  const cnpjField = register("cnpj");

  useEffect(() => {
    reset({
      professionalType: userDetail.professional_profile?.professional_type ?? "",
      cnpj: formatCnpj(userDetail.professional_profile?.cnpj ?? ""),
      commission: userDetail.professional_profile?.commission != null
        ? String(userDetail.professional_profile.commission)
        : "",
      bio: userDetail.professional_profile?.bio ?? "",
      services: userDetail.professional_profile ? getServiceIds(userDetail.professional_profile.services) : [],
    });
  }, [userDetail, reset]);

  useEffect(() => {
    if (!accessToken) return;
    const controller = new AbortController();

    const fetchServices = async () => {
      setServicesLoading(true);
      setServicesError(null);
      try {
        const response = await fetchWithAuth(servicesSimpleListEndpoint, {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Não foi possível carregar os serviços.");
        const data: ServiceSimpleOption[] = await response.json();
        setServiceOptions(data);
      } catch (error) {
        if (!controller.signal.aborted) {
          setServicesError(error instanceof Error ? error.message : "Erro ao carregar serviços.");
        }
      } finally {
        if (!controller.signal.aborted) setServicesLoading(false);
      }
    };

    void fetchServices();
    return () => controller.abort();
  }, [accessToken, fetchWithAuth]);

  const watchedSelectedServices = useWatch({ control, name: "services" });
  const selectedServices = useMemo(() => watchedSelectedServices ?? [], [watchedSelectedServices]);
  const selectedServiceNames = useMemo(
    () =>
      serviceOptions
        .filter((service) => selectedServices.includes(service.id))
        .map((service) => service.name),
    [serviceOptions, selectedServices],
  );
  const activeIntervals = useMemo(
    () =>
      [...(userDetail.professional_profile?.active_professional_intervals ?? [])]
        .filter((interval) => interval.is_active !== false)
        .sort((first, second) => {
          const firstCreatedAt = first.created_at ? Date.parse(first.created_at) : Number.NaN;
          const secondCreatedAt = second.created_at ? Date.parse(second.created_at) : Number.NaN;

          if (Number.isFinite(firstCreatedAt) && Number.isFinite(secondCreatedAt)) {
            return secondCreatedAt - firstCreatedAt;
          }

          return second.id - first.id;
        }),
    [userDetail.professional_profile?.active_professional_intervals],
  );
  const visibleIntervals = showAllIntervals ? activeIntervals : activeIntervals.slice(0, 1);

  const handleToggleService = (serviceId: number) => {
    const exists = selectedServices.includes(serviceId);
    setValue(
      "services",
      exists
        ? selectedServices.filter((value) => value !== serviceId)
        : [...selectedServices, serviceId],
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const openCreateIntervalModal = () => {
    setIntervalForm(initialIntervalForm);
    setIntervalError(null);
    setIntervalModalOpen(true);
  };

  const openActiveIntervalModal = (interval: ProfessionalInterval) => {
    setActiveIntervalToEdit(interval);
    setActiveIntervalForm(getIntervalFormFromActiveInterval(interval));
    setActiveIntervalError(null);
    setActiveIntervalModalOpen(true);
  };

  const handleSaveProfile = handleSubmit(async (values) => {
    const result = await onSaveProfile(userDetail.professional_profile?.id, {
      professional_type: values.professionalType,
      cnpj: removeCnpjMask(values.cnpj),
      commission: Number(values.commission),
      bio: values.bio ?? "",
      services: values.services,
    });

    if (!result.success) {
      onFeedback({ type: "error", message: result.error ?? "Não foi possível salvar o perfil." });
      return;
    }

    onFeedback({ type: "success", message: "Perfil profissional salvo com sucesso." });
  });

  const handleSubmitInterval = async () => {
    setIntervalError(null);
    const { dateStart, dateFinish, hourStart, hourFinish, repeat, weekDays } = intervalForm;

    if (!hourStart || !hourFinish) {
      setIntervalError("Informe o horário inicial e final.");
      return;
    }
    if (repeat && weekDays.length === 0) {
      setIntervalError("Selecione ao menos um dia para repetir.");
      return;
    }
    if (!repeat && (!dateStart || !dateFinish)) {
      setIntervalError("Informe a data inicial e final.");
      return;
    }

    const profileId = userDetail.professional_profile?.id;
    if (!profileId) {
      setIntervalError("Perfil profissional não encontrado para este usuário.");
      return;
    }

    const payload = repeat
      ? {
          professional: profileId,
          hour_start: hourStart.length === 5 ? `${hourStart}:00` : hourStart,
          hour_finish: hourFinish.length === 5 ? `${hourFinish}:00` : hourFinish,
          week_days: weekDays,
        }
      : {
          professional: profileId,
          date_start: dateStart,
          date_finish: dateFinish,
          hour_start: hourStart,
          hour_finish: hourFinish,
        };

    setIntervalSubmitting(true);
    const result = await onAddInterval(payload);
    setIntervalSubmitting(false);

    if (!result.success) {
      setIntervalError(result.error ?? "Não foi possível salvar o intervalo.");
      return;
    }

    setIntervalForm(initialIntervalForm);
    setIntervalModalOpen(false);
    onFeedback({ type: "success", message: "Intervalo salvo com sucesso." });
  };

  const handleSaveActiveInterval = async () => {
    setActiveIntervalError(null);
    const profile = userDetail.professional_profile;

    if (!profile || !activeIntervalToEdit) {
      setActiveIntervalError("Intervalo ativo não encontrado para este profissional.");
      return;
    }

    const { dateStart, dateFinish, hourStart, hourFinish, weekDays } = activeIntervalForm;
    if (!hourStart || !hourFinish) {
      setActiveIntervalError("Informe os horários do intervalo.");
      return;
    }
    if (weekDays.length === 0 && (!dateStart || !dateFinish)) {
      setActiveIntervalError("Informe as datas do intervalo.");
      return;
    }

    const values = getValues();
    setActiveIntervalSubmitting(true);
    const result = await onSaveActiveInterval({
      professional_profile: {
        professional_type: values.professionalType,
        cnpj: removeCnpjMask(values.cnpj),
        commission: Number(values.commission),
        bio: values.bio ?? "",
        services: values.services,
        active_professional_interval: {
          id: activeIntervalToEdit.id,
          date_start: dateStart || null,
          date_finish: dateFinish || null,
          hour_start: hourStart,
          hour_finish: hourFinish,
          week_days: weekDays,
        },
      },
    });
    setActiveIntervalSubmitting(false);

    if (!result.success) {
      setActiveIntervalError(result.error ?? "Não foi possível atualizar o intervalo ativo.");
      return;
    }

    setActiveIntervalModalOpen(false);
    setActiveIntervalToEdit(null);
    onFeedback({ type: "success", message: "Intervalo ativo atualizado com sucesso." });
  };

  const openDeactivateIntervalModal = (interval: ProfessionalInterval) => {
    setDeactivateIntervalError(null);
    setIntervalToDeactivate(interval);
  };

  const handleDeactivateInterval = async () => {
    if (!intervalToDeactivate) return;

    setDeactivateIntervalSubmitting(true);
    setDeactivateIntervalError(null);
    const result = await onDeactivateInterval(intervalToDeactivate.id);
    setDeactivateIntervalSubmitting(false);

    if (!result.success) {
      setDeactivateIntervalError(result.error ?? "Não foi possível desativar o intervalo.");
      return;
    }

    setIntervalToDeactivate(null);
    onFeedback({ type: "success", message: "Intervalo desativado com sucesso." });
  };

  return (
    <section className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Perfil profissional</h2>
      </div>

      <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
        <fieldset className="space-y-4 rounded-2xl border border-white/5 p-4">
          <legend className="px-2 text-xs uppercase tracking-wide text-white/50">
            Dados do profissional
          </legend>

          <label className="text-sm text-white/70">
            Tipo profissional
            <select
              {...register("professionalType")}
              className="mt-1 w-full rounded-2xl border border-white/10 bg-[#050505] px-4 py-3 text-sm outline-none focus:border-white/40"
            >
              <option value="" disabled>
                Selecione
              </option>
              {professionalTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.professionalType ? <p className="mt-1 text-xs text-red-400">{errors.professionalType.message}</p> : null}
          </label>

          <label className="text-sm text-white/70">
            CNPJ
            <input
              type="text"
              inputMode="numeric"
              maxLength={18}
              {...cnpjField}
              onChange={(event) => {
                event.target.value = formatCnpj(event.target.value);
                void cnpjField.onChange(event);
              }}
              className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
            />
            {errors.cnpj ? <p className="mt-1 text-xs text-red-400">{errors.cnpj.message}</p> : null}
          </label>

          <label className="text-sm text-white/70">
            Comissão (%)
            <input
              type="text"
              inputMode="decimal"
              {...register("commission")}
              className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
            />
            {errors.commission ? <p className="mt-1 text-xs text-red-400">{errors.commission.message}</p> : null}
          </label>

          <label className="text-sm text-white/70">
            Bio
            <textarea
              {...register("bio")}
              className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
              rows={3}
            />
          </label>

          <div>
            <p className="text-sm text-white/70">Serviços</p>
            <div className="mt-2 space-y-2 rounded-2xl border border-white/10 p-3">
              {servicesLoading ? <p className="text-sm text-white/60">Carregando...</p> : null}
              {servicesError ? <p className="text-sm text-red-300">{servicesError}</p> : null}
              {!servicesLoading && !servicesError ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {serviceOptions.map((service) => {
                    const selected = selectedServices.includes(service.id);
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => handleToggleService(service.id)}
                        className={`flex items-center justify-between rounded-2xl border px-3 py-2 text-left text-sm transition ${
                          selected ? "border-white bg-white text-black" : "border-white/10 text-white/80"
                        }`}
                      >
                        <span>{service.name}</span>
                        {selected ? <Check className="h-4 w-4" /> : null}
                      </button>
                    );
                  })}
                </div>
              ) : null}
              {selectedServiceNames.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedServiceNames.map((name) => (
                    <span key={name} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/80">
                      {name}
                    </span>
                  ))}
                </div>
              ) : null}
              {errors.services ? <p className="text-xs text-red-400">{errors.services.message}</p> : null}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar perfil"
              )}
            </button>
          </div>
        </fieldset>
      </form>

      <div className="space-y-4 rounded-2xl border border-white/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 px-2">
            <p className="text-xs uppercase tracking-wide text-white/50">Intervalos</p>
            {userDetail.professional_profile ? (
              <span className="flex h-6 items-center justify-center rounded-full bg-white/10 px-2.5 text-[11px] font-semibold text-white/70">
                {activeIntervals.length} {activeIntervals.length === 1 ? "ativo" : "ativos"}
              </span>
            ) : null}
          </div>
          {userDetail.professional_profile ? (
            <button
              type="button"
              onClick={openCreateIntervalModal}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-black transition hover:bg-white/90"
              aria-label="Criar novo intervalo"
            >
              <Plus className="h-5 w-5" />
            </button>
          ) : null}
        </div>

        {!userDetail.professional_profile ? (
          <p className="text-sm text-white/60">Crie o perfil profissional antes de cadastrar um intervalo.</p>
        ) : (
          <>
            <button
              type="button"
              onClick={openCreateIntervalModal}
              className="flex w-full items-center justify-between rounded-2xl border border-dashed border-white/15 px-4 py-3 text-left transition hover:border-white/40"
            >
              <span className="text-sm font-medium text-white/80">Criar novo intervalo</span>
              <Plus className="h-4 w-4 text-white/70" />
            </button>

            {activeIntervals.length > 0 ? (
              <div className="space-y-3">
                {visibleIntervals.map((interval, index) => {
                  const createdAt = formatCreatedAt(interval.created_at);
                  const isLatest = index === 0;

                  return (
                    <article
                      key={interval.id}
                      className={`space-y-3 rounded-2xl border p-4 transition ${
                        isLatest
                          ? "border-white/15 bg-white/[0.055]"
                          : "border-white/8 bg-white/[0.025]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                            <CalendarClock className="h-5 w-5 text-white/80" />
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-white">Intervalo ativo</p>
                              {isLatest ? (
                                <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/65">
                                  Mais recente
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-0.5 truncate text-xs text-white/45">
                              ID {interval.id}{createdAt ? ` • Criado em ${createdAt}` : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          {canEditUser ? (
                            <button
                              type="button"
                              onClick={() => openActiveIntervalModal(interval)}
                              className="rounded-xl p-2 text-white/55 transition hover:bg-white/10 hover:text-white"
                              aria-label={`Editar intervalo ${interval.id}`}
                            >
                              <PenSquare className="h-4 w-4" />
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => openDeactivateIntervalModal(interval)}
                            className="rounded-xl p-2 text-white/45 transition hover:bg-red-500/15 hover:text-red-300"
                            aria-label={`Desativar intervalo ${interval.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="grid gap-3 text-sm sm:grid-cols-3">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-white/40">Período</p>
                          <p className="mt-1 text-white/80">{formatIntervalPeriod(interval)}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-white/40">Horário</p>
                          <p className="mt-1 text-white/80">
                            {normalizeTime(interval.hour_start)} às {normalizeTime(interval.hour_finish)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-white/40">Repetição</p>
                          <p className="mt-1 text-white/80">{formatWeekDays(interval.week_days)}</p>
                        </div>
                      </div>
                    </article>
                  );
                })}

                {activeIntervals.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => setShowAllIntervals((current) => !current)}
                    className="flex w-full items-center justify-center rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3 text-sm font-medium text-white/65 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
                    aria-expanded={showAllIntervals}
                  >
                    {showAllIntervals
                      ? "Mostrar apenas o mais recente"
                      : `Ver todos os ${activeIntervals.length} intervalos`}
                  </button>
                ) : null}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-sm text-white/45">
                Nenhum intervalo ativo para este profissional.
              </p>
            )}
          </>
        )}
      </div>

      {intervalModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0b0b0b] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">Novo intervalo</p>
                <p className="text-xs text-white/50">Configure o período do profissional</p>
              </div>
              <button
                type="button"
                onClick={() => setIntervalModalOpen(false)}
                className="rounded-2xl p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Fechar modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <fieldset className="space-y-4 rounded-2xl border border-white/5 p-4">
              <legend className="px-2 text-xs uppercase tracking-wide text-white/50">Intervalo</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm text-white/70">
                  Data de início
                  <input
                    type="date"
                    value={intervalForm.dateStart}
                    onChange={(event) => setIntervalForm((prev) => ({ ...prev, dateStart: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
                  />
                </label>
                <label className="text-sm text-white/70">
                  Data final
                  <input
                    type="date"
                    value={intervalForm.dateFinish}
                    onChange={(event) => setIntervalForm((prev) => ({ ...prev, dateFinish: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm text-white/70">
                  Hora de início
                  <input
                    type="time"
                    value={intervalForm.hourStart}
                    onChange={(event) => setIntervalForm((prev) => ({ ...prev, hourStart: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
                  />
                </label>
                <label className="text-sm text-white/70">
                  Hora final
                  <input
                    type="time"
                    value={intervalForm.hourFinish}
                    onChange={(event) => setIntervalForm((prev) => ({ ...prev, hourFinish: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
                  />
                </label>
              </div>

              <label className="flex items-center gap-3 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={intervalForm.repeat}
                  onChange={() => setIntervalForm((prev) => ({ ...prev, repeat: !prev.repeat }))}
                  className="h-4 w-4 rounded border border-white/20 bg-transparent text-black"
                />
                Repetição do intervalo
              </label>

              <div className="flex flex-wrap gap-2">
                {intervalWeekDays.map((day) => {
                  const isActive = intervalForm.weekDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() =>
                        setIntervalForm((prev) => ({
                          ...prev,
                          weekDays: isActive
                            ? prev.weekDays.filter((value) => value !== day.value)
                            : [...prev.weekDays, day.value],
                        }))
                      }
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition ${
                        isActive ? "bg-white text-black" : "bg-white/10 text-white/70"
                      }`}
                      aria-label={`Selecionar ${day.name}`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>

              {intervalError ? <p className="text-sm text-red-300">{intervalError}</p> : null}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIntervalModalOpen(false)}
                  className="rounded-2xl border border-white/10 px-5 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmitInterval}
                  disabled={intervalSubmitting}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-2 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {intervalSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar intervalo"
                  )}
                </button>
              </div>
            </fieldset>
          </div>
        </div>
      ) : null}

      {activeIntervalModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0b0b0b] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">Editar intervalo ativo</p>
                <p className="text-xs text-white/50">A alteração será enviada junto ao perfil profissional</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveIntervalModalOpen(false);
                  setActiveIntervalToEdit(null);
                }}
                className="rounded-2xl p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Fechar modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <fieldset className="space-y-4 rounded-2xl border border-white/5 p-4">
              <legend className="px-2 text-xs uppercase tracking-wide text-white/50">Intervalo ativo</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm text-white/70">
                  Data de início
                  <input
                    type="date"
                    value={activeIntervalForm.dateStart}
                    onChange={(event) => setActiveIntervalForm((prev) => ({ ...prev, dateStart: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
                  />
                </label>
                <label className="text-sm text-white/70">
                  Data final
                  <input
                    type="date"
                    value={activeIntervalForm.dateFinish}
                    onChange={(event) => setActiveIntervalForm((prev) => ({ ...prev, dateFinish: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm text-white/70">
                  Hora de início
                  <input
                    type="time"
                    value={activeIntervalForm.hourStart}
                    onChange={(event) => setActiveIntervalForm((prev) => ({ ...prev, hourStart: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
                  />
                </label>
                <label className="text-sm text-white/70">
                  Hora final
                  <input
                    type="time"
                    value={activeIntervalForm.hourFinish}
                    onChange={(event) => setActiveIntervalForm((prev) => ({ ...prev, hourFinish: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                {intervalWeekDays.map((day) => {
                  const isActive = activeIntervalForm.weekDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() =>
                        setActiveIntervalForm((prev) => ({
                          ...prev,
                          weekDays: isActive
                            ? prev.weekDays.filter((value) => value !== day.value)
                            : [...prev.weekDays, day.value],
                        }))
                      }
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition ${
                        isActive ? "bg-white text-black" : "bg-white/10 text-white/70"
                      }`}
                      aria-label={`Selecionar ${day.name}`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>

              {activeIntervalError ? <p className="text-sm text-red-300">{activeIntervalError}</p> : null}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveIntervalModalOpen(false);
                    setActiveIntervalToEdit(null);
                  }}
                  className="rounded-2xl border border-white/10 px-5 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveActiveInterval}
                  disabled={activeIntervalSubmitting}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-2 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {activeIntervalSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar intervalo"
                  )}
                </button>
              </div>
            </fieldset>
          </div>
        </div>
      ) : null}

      <Modal
        open={Boolean(intervalToDeactivate)}
        onClose={() => {
          if (deactivateIntervalSubmitting) return;
          setIntervalToDeactivate(null);
          setDeactivateIntervalError(null);
        }}
        title="Você deseja desativar este intervalo?"
        subtitle={intervalToDeactivate ? `Intervalo ID ${intervalToDeactivate.id}` : undefined}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-white/60">
            O intervalo deixará de bloquear a agenda deste profissional. Esta ação não exclui o histórico.
          </p>

          {intervalToDeactivate ? (
            <div className="rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3 text-sm">
              <p className="font-medium text-white/85">{formatIntervalPeriod(intervalToDeactivate)}</p>
              <p className="mt-1 text-white/50">
                {normalizeTime(intervalToDeactivate.hour_start)} às {normalizeTime(intervalToDeactivate.hour_finish)}
              </p>
            </div>
          ) : null}

          {deactivateIntervalError ? (
            <p
              className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200"
              role="alert"
            >
              {deactivateIntervalError}
            </p>
          ) : null}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIntervalToDeactivate(null);
                setDeactivateIntervalError(null);
              }}
              disabled={deactivateIntervalSubmitting}
              className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/75 transition hover:border-white/30 hover:text-white disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => void handleDeactivateInterval()}
              disabled={deactivateIntervalSubmitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deactivateIntervalSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {deactivateIntervalSubmitting ? "Desativando..." : "Desativar intervalo"}
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
