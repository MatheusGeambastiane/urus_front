"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import {
  Calendar,
  ChevronLeft,
  KeyRound,
  Loader2,
  Mail,
  PenSquare,
  Phone,
  UserRound,
} from "lucide-react";
import { FeedbackBanner } from "@/components/ui/FeedbackBanner";
import { editUserSchema, type EditUserFormValues } from "@/src/features/users/schemas";
import type { RoleOption } from "@/src/features/users/types";
import type { useUserDetail } from "@/src/features/users/hooks/useUserDetail";
import { convertDisplayDateToIso, formatDisplayDate, formatIsoToDisplay } from "@/src/features/shared/utils/date";
import type { TokenRefreshService } from "@/src/features/shared/utils/auth";
import { ProfessionalProfileForm } from "./ProfessionalProfileForm";
import { PasswordResetModal } from "./PasswordResetModal";
import { ReviewEmailModal } from "./ReviewEmailModal";
import { ClientHistoryScreen } from "./ClientHistoryScreen";

type UserDetailScreenProps = {
  detail: ReturnType<typeof useUserDetail>;
  accessToken: string | null;
  fetchWithAuth: TokenRefreshService["fetchWithAuth"];
  roleOptions: RoleOption[];
  userRole: string | undefined;
  onBack: () => void;
};

export function UserDetailScreen({
  detail,
  accessToken,
  fetchWithAuth,
  roleOptions,
  userRole,
  onBack,
}: UserDetailScreenProps) {
  const {
    userDetail,
    userDetailLoading,
    userDetailError,
    canEditUser,
    isUpdatingUser,
    showClientHistory,
    setShowClientHistory,
    clientHistoryData,
    clientHistoryLoading,
    clientHistoryError,
    showPasswordResetModal,
    setShowPasswordResetModal,
    showReviewEmailModal,
    setShowReviewEmailModal,
    toggleEdit,
    updateUser,
    updateProfessionalProfile,
    sendPasswordReset,
    addProfessionalInterval,
    sendReviewEmail,
  } = detail;

  const [feedback, setFeedbackRaw] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const datePickerRef = useRef<HTMLInputElement & { showPicker?: () => void }>(null);
  const profilePicInputRef = useRef<HTMLInputElement | null>(null);

  const setFeedback = (value: { type: "success" | "error"; message: string } | null) => {
    setFeedbackRaw(value);
    if (value) setTimeout(() => setFeedbackRaw(null), 4000);
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      cpf: "",
      role: "",
      dateOfBirth: "",
      isActive: true,
      profilePic: undefined,
    },
  });

  const profilePicField = register("profilePic");
  const dateOfBirthValue = useWatch({ control, name: "dateOfBirth" }) ?? "";
  const isActiveValue = useWatch({ control, name: "isActive" }) ?? false;
  const profilePicWatch = useWatch({ control, name: "profilePic" });

  useEffect(() => {
    if (!userDetail) return;
    reset({
      firstName: userDetail.first_name,
      lastName: userDetail.last_name,
      email: userDetail.email,
      phone: userDetail.phone ?? "",
      cpf: userDetail.cpf ?? "",
      role: userDetail.role,
      dateOfBirth: formatIsoToDisplay(userDetail.date_of_birth ?? ""),
      isActive: userDetail.is_active,
      profilePic: undefined,
    });
  }, [userDetail, reset]);

  const profilePicPreview = useMemo(() => {
    if (!profilePicWatch || !(profilePicWatch instanceof FileList) || profilePicWatch.length === 0) {
      return null;
    }
    const file = profilePicWatch.item(0);
    return file ? URL.createObjectURL(file) : null;
  }, [profilePicWatch]);

  useEffect(() => {
    return () => {
      if (profilePicPreview) {
        URL.revokeObjectURL(profilePicPreview);
      }
    };
  }, [profilePicPreview]);

  const isAdmin = userRole === "admin";
  const isProfessional = userDetail?.role === "professional";
  const profilePicSrc = profilePicPreview ?? userDetail?.profile_pic ?? null;
  const fullName = userDetail ? `${userDetail.first_name} ${userDetail.last_name}`.trim() : "";

  const roleLabelMap = useMemo(
    () =>
      roleOptions.reduce<Record<string, string>>((acc, option) => {
        acc[option.value] = option.label;
        return acc;
      }, {}),
    [roleOptions],
  );

  const handleSave = handleSubmit(async (values) => {
    const payload = new FormData();
    payload.append("first_name", values.firstName.trim());
    payload.append("last_name", values.lastName.trim());
    payload.append("email", values.email.trim());
    payload.append("phone", values.phone?.trim() || "");
    payload.append("cpf", values.cpf?.trim() || "");
    payload.append("role", values.role);
    payload.append("is_active", String(values.isActive));

    const isoDate = convertDisplayDateToIso(values.dateOfBirth);
    if (isoDate) {
      payload.append("date_of_birth", isoDate);
    }

    const fileList = values.profilePic;
    if (typeof FileList !== "undefined" && fileList instanceof FileList && fileList.length > 0) {
      payload.append("profile_pic", fileList[0]);
    }

    const result = await updateUser(payload);
    if (!result.success) {
      setFeedback({ type: "error", message: result.error ?? "Não foi possível atualizar o usuário." });
      return;
    }
    setFeedback({ type: "success", message: "Usuário atualizado com sucesso." });
  });

  if (showClientHistory) {
    return (
      <ClientHistoryScreen
        userDetail={userDetail}
        clientHistoryData={clientHistoryData}
        clientHistoryLoading={clientHistoryLoading}
        clientHistoryError={clientHistoryError}
        onBack={() => setShowClientHistory(false)}
      />
    );
  }

  if (userDetailLoading) {
    return (
      <div className="flex min-h-[360px] flex-1 flex-col items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-white/70">
        <Loader2 className="h-6 w-6 animate-spin text-white" />
        <p className="mt-3 text-sm">Carregando usuário...</p>
      </div>
    );
  }

  if (userDetailError) {
    return (
      <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100 backdrop-blur">
        {userDetailError}
      </div>
    );
  }

  if (!userDetail) return null;

  const roleLabel = roleLabelMap[userDetail.role] ?? userDetail.role_display;
  const phoneLabel = userDetail.phone || "Telefone não informado";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <header className="flex items-center gap-3">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/75 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
          onClick={onBack}
          aria-label="Voltar para usuários"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">Usuários</p>
          <h1 className="text-2xl font-semibold text-white">Perfil do usuário</h1>
        </div>
      </header>

      {feedback ? <FeedbackBanner message={feedback.message} type={feedback.type} /> : null}

      <section className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.055] text-white shadow-[0_18px_55px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <div className="grid gap-5 p-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:p-6">
          <button
            type="button"
            onClick={() => {
              if (canEditUser) profilePicInputRef.current?.click();
            }}
            disabled={!canEditUser}
            className={`group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border border-white/12 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:h-28 sm:w-28 ${
              canEditUser ? "cursor-pointer" : "cursor-default"
            }`}
            aria-label={canEditUser ? "Alterar foto do usuário" : "Foto do usuário"}
          >
            {profilePicSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profilePicSrc}
                alt={fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound className="h-9 w-9 text-white/45" />
            )}
            {canEditUser ? (
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/45 text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                <PenSquare className="h-5 w-5" />
              </span>
            ) : null}
          </button>
          <input
            type="file"
            accept="image/*"
            {...profilePicField}
            ref={(element) => {
              profilePicField.ref(element);
              profilePicInputRef.current = element;
            }}
            disabled={!canEditUser}
            className="hidden"
          />

          <div className="min-w-0">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white/45">Cadastro #{userDetail.id}</p>
                <h2 className="mt-1 text-3xl font-semibold leading-tight text-white">{fullName}</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-sm font-medium text-white/78">
                    <Phone className="h-4 w-4 text-white/45" />
                    {phoneLabel}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1.5 text-sm font-semibold text-emerald-100">
                    {roleLabel}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-semibold ${
                      userDetail.is_active
                        ? "border-sky-300/25 bg-sky-400/10 text-sky-100"
                        : "border-white/10 bg-white/[0.05] text-white/50"
                    }`}
                  >
                    {userDetail.is_active ? "Ativo" : "Inativo"}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <button
                  type="button"
                  onClick={toggleEdit}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    canEditUser
                      ? "bg-white text-black hover:bg-white/90"
                      : "border border-white/10 bg-white/[0.07] text-white/78 hover:border-white/25 hover:bg-white/[0.1]"
                  }`}
                >
                  <PenSquare className="h-4 w-4" />
                  {canEditUser ? "Editando" : "Editar"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewEmailModal(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.07] px-4 py-2 text-sm font-semibold text-white/78 transition hover:border-white/25 hover:bg-white/[0.1]"
                >
                  <Mail className="h-4 w-4" />
                  Avaliação
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5 rounded-lg border border-white/10 bg-white/[0.045] p-5 text-white shadow-[0_18px_55px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-3 border-b border-white/8 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Informações</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Dados do usuário</h2>
          </div>
          <p
            className={`w-max rounded-full px-3 py-1 text-xs font-semibold ${
              canEditUser
                ? "border border-amber-300/25 bg-amber-400/10 text-amber-100"
                : "border border-white/10 bg-white/[0.06] text-white/50"
            }`}
          >
            {canEditUser ? "Modo edição" : "Somente leitura"}
          </p>
        </div>

        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
          <label className="text-sm font-medium text-white/65">
            Primeiro nome
            <input
              type="text"
              {...register("firstName")}
              disabled={!canEditUser}
              className={`mt-1 w-full rounded-lg border px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/35 ${
                errors.firstName ? "border-red-400/45 bg-red-500/10" : "border-white/10 bg-white/[0.045]"
              } ${!canEditUser ? "bg-white/[0.025] text-white/45" : ""}`}
            />
            {errors.firstName ? <p className="mt-1 text-xs text-red-300">{errors.firstName.message}</p> : null}
          </label>

          <label className="text-sm font-medium text-white/65">
            Sobrenome
            <input
              type="text"
              {...register("lastName")}
              disabled={!canEditUser}
              className={`mt-1 w-full rounded-lg border px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/35 ${
                errors.lastName ? "border-red-400/45 bg-red-500/10" : "border-white/10 bg-white/[0.045]"
              } ${!canEditUser ? "bg-white/[0.025] text-white/45" : ""}`}
            />
            {errors.lastName ? <p className="mt-1 text-xs text-red-300">{errors.lastName.message}</p> : null}
          </label>

          <label className="text-sm font-medium text-white/65">
            E-mail
            <input
              type="email"
              {...register("email")}
              disabled={!canEditUser}
              className={`mt-1 w-full rounded-lg border px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/35 ${
                errors.email ? "border-red-400/45 bg-red-500/10" : "border-white/10 bg-white/[0.045]"
              } ${!canEditUser ? "bg-white/[0.025] text-white/45" : ""}`}
            />
            {errors.email ? <p className="mt-1 text-xs text-red-300">{errors.email.message}</p> : null}
          </label>

          {canEditUser ? (
            <label className="text-sm font-medium text-white/65">
              Telefone
              <input
                type="tel"
                {...register("phone")}
                disabled={!canEditUser}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/35"
              />
            </label>
          ) : null}

          <label className="text-sm font-medium text-white/65">
            CPF
            <input
              type="text"
              {...register("cpf")}
              disabled={!canEditUser}
              className={`mt-1 w-full rounded-lg border border-white/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/35 ${
                !canEditUser ? "bg-white/[0.025] text-white/45" : "bg-white/[0.045]"
              }`}
            />
          </label>

          {canEditUser ? (
            <label className="text-sm font-medium text-white/65">
              Função
              <select
                {...register("role")}
                disabled={!canEditUser}
                className={`mt-1 w-full rounded-lg border px-4 py-3 text-sm text-white outline-none transition focus:border-white/35 ${
                  errors.role ? "border-red-400/45 bg-red-500/10" : "border-white/10 bg-[#111]"
                }`}
              >
                <option value="" disabled>
                  Selecione
                </option>
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.role ? <p className="mt-1 text-xs text-red-300">{errors.role.message}</p> : null}
            </label>
          ) : null}

          <label className="text-sm font-medium text-white/65">
            Data de nascimento
            <div
              className={`mt-1 flex items-center rounded-lg border px-3 transition focus-within:border-white/35 ${
                errors.dateOfBirth ? "border-red-400/45 bg-red-500/10" : "border-white/10 bg-white/[0.045]"
              } ${!canEditUser ? "bg-white/[0.025] text-white/45" : ""}`}
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
                disabled={!canEditUser}
                className="w-full bg-transparent px-1 py-3 text-sm text-white outline-none placeholder:text-white/25 disabled:text-white/45"
                maxLength={10}
                placeholder="dd/mm/aaaa"
              />
              <button
                type="button"
                onClick={() => datePickerRef.current?.showPicker?.()}
                disabled={!canEditUser}
                className="rounded-lg p-2 text-white/45 transition hover:bg-white/[0.08] hover:text-white disabled:hover:bg-transparent"
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
            {errors.dateOfBirth ? <p className="mt-1 text-xs text-red-300">{errors.dateOfBirth.message}</p> : null}
          </label>

          {canEditUser ? (
            <label className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-medium text-white/65">
              <span>Usuário ativo</span>
              <input
                type="checkbox"
                {...register("isActive")}
                disabled={!canEditUser}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className={`relative h-7 w-12 rounded-full border transition ${
                  isActiveValue
                    ? "border-emerald-300/30 bg-emerald-400/30"
                    : "border-white/10 bg-white/[0.08]"
                } cursor-pointer`}
              >
                <span
                  className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-sm transition ${
                    isActiveValue ? "left-6" : "left-1"
                  }`}
                />
              </span>
            </label>
          ) : null}

          {isAdmin ? (
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <button
                type="button"
                onClick={() => setShowPasswordResetModal(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.07] px-4 py-2 text-sm font-semibold text-white/78 transition hover:border-white/25 hover:bg-white/[0.1]"
              >
                <KeyRound className="h-4 w-4" />
                Redefinir senha
              </button>
            </div>
          ) : null}
        </form>

        {canEditUser ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={isUpdatingUser}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isUpdatingUser ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar usuário"
              )}
            </button>
          </div>
        ) : null}
      </section>

      {userDetail.role === "client" ? (
        <section className="rounded-lg border border-white/10 bg-white/[0.045] p-1 shadow-[0_18px_55px_rgba(0,0,0,0.24)] backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setShowClientHistory(true)}
            className="flex w-full items-center overflow-hidden rounded-lg bg-white/[0.055] text-left transition hover:bg-white/[0.08]"
          >
            <div className="flex flex-1 flex-col gap-2 px-4 py-4 text-white">
              <p className="text-lg font-semibold">Histórico de atendimentos de {userDetail.first_name}</p>
              <span className="inline-flex w-max items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-4 py-1 text-xs font-medium text-white/80">
                Abrir histórico
              </span>
            </div>
            <div className="relative h-32 w-32 flex-shrink-0">
              <Image
                src="/barbeiro_cortando.png"
                alt="Barbeiro cortando"
                fill
                sizes="128px"
                className="object-cover"
              />
            </div>
          </button>
        </section>
      ) : null}

      {isProfessional ? (
        <ProfessionalProfileForm
          userDetail={userDetail}
          accessToken={accessToken}
          fetchWithAuth={fetchWithAuth}
          canEditUser={canEditUser}
          onSaveProfile={updateProfessionalProfile}
          onAddInterval={addProfessionalInterval}
          onSaveActiveInterval={updateUser}
          onFeedback={setFeedback}
        />
      ) : null}

      {showPasswordResetModal ? (
        <PasswordResetModal
          open={showPasswordResetModal}
          onClose={() => setShowPasswordResetModal(false)}
          onSubmit={sendPasswordReset}
          onSuccess={() => setFeedback({ type: "success", message: "Senha redefinida com sucesso." })}
        />
      ) : null}

      {showReviewEmailModal ? (
        <ReviewEmailModal
          open={showReviewEmailModal}
          onClose={() => setShowReviewEmailModal(false)}
          onSubmit={sendReviewEmail}
          onSuccess={() => setFeedback({ type: "success", message: "Email de avaliação enviado com sucesso." })}
        />
      ) : null}
    </div>
  );
}
