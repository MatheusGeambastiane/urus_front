"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2 } from "lucide-react";
import type { TokenRefreshService } from "@/src/features/shared/utils/auth";
import { professionalProfileSchema, type ProfessionalProfileFormValues } from "@/src/features/users/schemas";
import { servicesSimpleListEndpoint } from "@/src/features/users/services/endpoints";
import type { UserDetail } from "@/src/features/users/types";
import type { ServiceSimpleOption } from "@/src/features/services/types";

type ProfessionalProfileFormProps = {
  userDetail: UserDetail;
  accessToken: string | null;
  fetchWithAuth: TokenRefreshService["fetchWithAuth"];
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

export function ProfessionalProfileForm({
  userDetail,
  accessToken,
  fetchWithAuth,
  onSaveProfile,
  onAddInterval,
  onFeedback,
}: ProfessionalProfileFormProps) {
  const [serviceOptions, setServiceOptions] = useState<ServiceSimpleOption[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [intervalForm, setIntervalForm] = useState<IntervalFormState>(initialIntervalForm);
  const [intervalError, setIntervalError] = useState<string | null>(null);
  const [intervalSubmitting, setIntervalSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
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

  useEffect(() => {
    reset({
      professionalType: userDetail.professional_profile?.professional_type ?? "",
      cnpj: userDetail.professional_profile?.cnpj ?? "",
      commission: userDetail.professional_profile?.commission != null
        ? String(userDetail.professional_profile.commission)
        : "",
      bio: userDetail.professional_profile?.bio ?? "",
      services: userDetail.professional_profile?.services ?? [],
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

  const handleSaveProfile = handleSubmit(async (values) => {
    const result = await onSaveProfile(userDetail.professional_profile?.id, {
      professional_type: values.professionalType,
      cnpj: values.cnpj,
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
    onFeedback({ type: "success", message: "Intervalo salvo com sucesso." });
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
              {...register("cnpj")}
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
        <p className="px-2 text-xs uppercase tracking-wide text-white/50">Intervalo</p>

        {!userDetail.professional_profile ? (
          <p className="text-sm text-white/60">Crie o perfil profissional antes de cadastrar um intervalo.</p>
        ) : (
          <>
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

            <div className="flex justify-end">
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
          </>
        )}
      </div>
    </section>
  );
}
