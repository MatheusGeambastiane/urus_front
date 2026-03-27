"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Check, ChevronLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import type { TokenRefreshService } from "@/src/features/shared/utils/auth";
import { createUserSchema, type CreateUserFormValues } from "@/src/features/users/schemas";
import { usersEndpointBase } from "@/src/features/users/services/endpoints";
import type { RoleOption } from "@/src/features/users/types";
import { convertDisplayDateToIso, formatDisplayDate, formatIsoToDisplay } from "@/src/features/shared/utils/date";
import { passwordRequirementCheck, passwordRequirementLabels } from "@/src/features/users/utils/password";

type CreateUserScreenProps = {
  accessToken: string | null;
  fetchWithAuth: TokenRefreshService["fetchWithAuth"];
  roleOptions: RoleOption[];
  roleOptionsError: string | null;
  onCancel: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
};

const defaultValues: CreateUserFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  cpf: "",
  role: "",
  dateOfBirth: "",
  password: "",
  confirmPassword: "",
};

export function CreateUserScreen({
  accessToken,
  fetchWithAuth,
  roleOptions,
  roleOptionsError,
  onCancel,
  onSuccess,
  onError,
}: CreateUserScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const datePickerRef = useRef<HTMLInputElement & { showPicker?: () => void }>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues,
  });

  const passwordValue = watch("password") ?? "";
  const confirmPasswordValue = watch("confirmPassword") ?? "";
  const dateOfBirthValue = watch("dateOfBirth") ?? "";
  const role = watch("role") ?? "";

  useEffect(() => {
    if (role !== "client") return;
    setValue("password", "Urus123?", { shouldDirty: true, shouldValidate: true });
    setValue("confirmPassword", "Urus123?", { shouldDirty: true, shouldValidate: true });
  }, [role, setValue]);

  const passwordChecks = passwordRequirementCheck(passwordValue);
  const totalPasswordRequirements = Object.keys(passwordRequirementLabels).length;
  const passwordStrengthScore = Object.values(passwordChecks).filter(Boolean).length;
  const passwordStrengthPercent = (passwordStrengthScore / totalPasswordRequirements) * 100;
  const passwordStrengthColor =
    passwordStrengthScore <= 2
      ? "bg-red-500"
      : passwordStrengthScore === 3
        ? "bg-amber-400"
        : "bg-emerald-500";

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    if (!accessToken) {
      setFormError("Sessão expirada. Faça login novamente.");
      return;
    }

    const isClient = values.role === "client";
    const isoDate = values.dateOfBirth ? convertDisplayDateToIso(values.dateOfBirth) : null;
    if (!isClient && !isoDate) {
      setFormError("Informe uma data de nascimento válida (dd/mm/aaaa).");
      return;
    }

    try {
      const response = await fetchWithAuth(usersEndpointBase, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          first_name: values.firstName.trim(),
          last_name: values.lastName?.trim() || null,
          email: values.email.trim(),
          password: values.password,
          cpf: values.cpf?.trim() || null,
          phone: values.phone?.trim() || "",
          role: values.role,
          date_of_birth: isoDate,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const detail = (data && (data.detail || data.message)) || "Não foi possível criar o usuário.";
        throw new Error(detail);
      }

      onSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado ao criar usuário.";
      setFormError(message);
      onError(message);
    }
  });

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center gap-3">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-white/40 hover:text-white"
          onClick={onCancel}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="text-sm text-white/60">Usuários</p>
          <p className="text-2xl font-semibold">Novo usuário</p>
          <p className="text-xs text-white/50">Preencha os dados abaixo</p>
        </div>
      </header>

      <section className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-white/70">
              Primeiro nome
              <input
                type="text"
                {...register("firstName")}
                className={`mt-1 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 ${
                  errors.firstName ? "border-red-500/60" : "border-white/10"
                }`}
              />
              {errors.firstName ? <p className="mt-1 text-xs text-red-400">{errors.firstName.message}</p> : null}
            </label>

            <label className="text-sm text-white/70">
              Sobrenome
              <input
                type="text"
                {...register("lastName")}
                className={`mt-1 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 ${
                  errors.lastName ? "border-red-500/60" : "border-white/10"
                }`}
              />
              {errors.lastName ? <p className="mt-1 text-xs text-red-400">{errors.lastName.message}</p> : null}
            </label>

            <label className="text-sm text-white/70">
              E-mail
              <input
                type="email"
                {...register("email")}
                className={`mt-1 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 ${
                  errors.email ? "border-red-500/60" : "border-white/10"
                }`}
              />
              {errors.email ? <p className="mt-1 text-xs text-red-400">{errors.email.message}</p> : null}
            </label>

            <label className="text-sm text-white/70">
              Telefone
              <input
                type="tel"
                {...register("phone")}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
              />
            </label>

            <label className="text-sm text-white/70">
              CPF (opcional)
              <input
                type="text"
                {...register("cpf")}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
              />
            </label>

            <label className="text-sm text-white/70">
              Função
              <select
                {...register("role")}
                className={`mt-1 w-full rounded-2xl border bg-[#050505] px-4 py-3 text-sm outline-none focus:border-white/40 ${
                  errors.role ? "border-red-500/60" : "border-white/10"
                }`}
              >
                <option value="" disabled>
                  {roleOptions.length === 0 ? "Carregando opções..." : "Selecione"}
                </option>
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.role ? <p className="mt-1 text-xs text-red-400">{errors.role.message}</p> : null}
            </label>

            <label className="text-sm text-white/70">
              Data de nascimento
              <div
                className={`mt-1 flex items-center rounded-2xl border bg-transparent px-3 focus-within:border-white/40 ${
                  errors.dateOfBirth ? "border-red-500/60" : "border-white/10"
                }`}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  value={dateOfBirthValue}
                  onChange={(event) =>
                    setValue("dateOfBirth", formatDisplayDate(event.target.value), {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  className="w-full bg-transparent px-1 py-3 text-sm outline-none"
                  placeholder="dd/mm/aaaa"
                  maxLength={10}
                />
                <button
                  type="button"
                  onClick={() => datePickerRef.current?.showPicker?.()}
                  className="rounded-xl p-2 text-white/70 transition hover:bg-white/5 hover:text-white"
                  aria-label="Abrir calendário"
                >
                  <Calendar className="h-4 w-4" />
                </button>
                <input
                  ref={datePickerRef}
                  type="date"
                  value={convertDisplayDateToIso(dateOfBirthValue) ?? ""}
                  className="sr-only"
                  tabIndex={-1}
                  onChange={(event) =>
                    setValue("dateOfBirth", formatIsoToDisplay(event.target.value), {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
              </div>
              {errors.dateOfBirth ? <p className="mt-1 text-xs text-red-400">{errors.dateOfBirth.message}</p> : null}
            </label>

            <label className="text-sm text-white/70">
              Senha
              <div
                className={`mt-1 flex items-center rounded-2xl border bg-transparent px-1 focus-within:border-white/40 ${
                  errors.password ? "border-red-500/60" : "border-white/10"
                }`}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="w-full bg-transparent px-3 py-3 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="rounded-xl p-2 text-white/70 transition hover:bg-white/5 hover:text-white"
                  aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="mt-2">
                <div className="h-2 w-full rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-200 ${passwordStrengthColor}`}
                    style={{ width: `${passwordStrengthPercent}%` }}
                  />
                </div>
                <ul className="mt-2 space-y-1">
                  {Object.entries(passwordRequirementLabels).map(([key, label]) => {
                    const met = passwordChecks[key as keyof typeof passwordRequirementLabels];
                    return (
                      <li
                        key={key}
                        className={`flex items-center gap-2 text-xs ${met ? "text-emerald-300" : "text-white/50"}`}
                      >
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                            met ? "border-emerald-400 bg-emerald-400/20" : "border-white/30"
                          }`}
                        >
                          {met ? <Check className="h-3 w-3" /> : null}
                        </span>
                        {label}
                      </li>
                    );
                  })}
                </ul>
              </div>
              {errors.password ? <p className="mt-1 text-xs text-red-400">{errors.password.message}</p> : null}
            </label>

            <label className="text-sm text-white/70">
              Digite novamente a senha
              <div
                className={`mt-1 flex items-center rounded-2xl border bg-transparent px-1 focus-within:border-white/40 ${
                  errors.confirmPassword ? "border-red-500/60" : "border-white/10"
                }`}
              >
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  className="w-full bg-transparent px-3 py-3 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="rounded-xl p-2 text-white/70 transition hover:bg-white/5 hover:text-white"
                  aria-label={showConfirmPassword ? "Esconder confirmação de senha" : "Mostrar confirmação de senha"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword ? (
                <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>
              ) : confirmPasswordValue && passwordValue !== confirmPasswordValue ? (
                <p className="mt-1 text-xs text-red-400">As senhas não conferem.</p>
              ) : null}
            </label>
          </div>

          {roleOptionsError ? <p className="text-sm text-red-300">{roleOptionsError}</p> : null}
          {formError ? <p className="text-sm text-red-300">{formError}</p> : null}

          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/40"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-2 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Criar usuário"
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
