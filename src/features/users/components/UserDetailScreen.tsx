"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Calendar, ChevronLeft, Loader2, Mail, PenSquare, UserRound } from "lucide-react";
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
      <div className="flex flex-1 flex-col items-center justify-center text-white/70">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="mt-3 text-sm">Carregando usuário...</p>
      </div>
    );
  }

  if (userDetailError) {
    return (
      <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
        {userDetailError}
      </div>
    );
  }

  if (!userDetail) return null;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center justify-between">
        <button
          type="button"
          className="mr-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-white/40 hover:text-white"
          onClick={onBack}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 text-center">
          <p className="text-sm text-white/60">Usuários</p>
          <p className="text-2xl font-semibold">
            {userDetail.first_name} {userDetail.last_name}
          </p>
        </div>
      </header>

      {feedback ? <FeedbackBanner message={feedback.message} type={feedback.type} /> : null}

      <section className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            {userDetail.profile_pic ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userDetail.profile_pic}
                alt={`${userDetail.first_name} ${userDetail.last_name}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound className="h-7 w-7 text-white/70" />
            )}
          </div>
          <div>
            <p className="text-lg font-semibold">
              {userDetail.first_name} {userDetail.last_name}
            </p>
            <p className="text-sm text-white/60">{roleLabelMap[userDetail.role] ?? userDetail.role_display}</p>
            <p className="text-xs text-white/40">{userDetail.email}</p>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                if (canEditUser) profilePicInputRef.current?.click();
              }}
              disabled={!canEditUser}
              className={`group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/5 ${
                canEditUser ? "cursor-pointer" : "cursor-default"
              }`}
            >
              {profilePicSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profilePicSrc}
                  alt={`${userDetail.first_name} ${userDetail.last_name}`}
                  className={`h-full w-full object-cover transition ${
                    canEditUser ? "group-hover:blur-sm group-focus-visible:blur-sm" : ""
                  }`}
                />
              ) : (
                <UserRound className="h-8 w-8 text-white/70" />
              )}
              {canEditUser ? (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-3xl bg-black/40 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                  <PenSquare className="h-5 w-5 text-white" />
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
            <div className="flex flex-1 justify-between">
              <div>
                <p className="text-lg font-semibold">Informações do usuário</p>
                <p className="text-xs text-white/60">
                  {canEditUser ? "Modo de edição habilitado" : "Visualização"}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button
                  type="button"
                  onClick={toggleEdit}
                  className="rounded-2xl p-2 text-white/80 transition hover:border-white/40"
                  aria-label="Editar usuário"
                >
                  <PenSquare className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewEmailModal(true)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40"
                >
                  <Mail className="h-4 w-4" />
                  Enviar email de avaliação
                </button>
              </div>
            </div>
          </div>
        </div>

        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
          <label className="text-sm text-white/70">
            Primeiro nome
            <input
              type="text"
              {...register("firstName")}
              disabled={!canEditUser}
              className={`mt-1 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 ${
                errors.firstName ? "border-red-500/60" : "border-white/10"
              } ${!canEditUser ? "opacity-60" : ""}`}
            />
            {errors.firstName ? <p className="mt-1 text-xs text-red-400">{errors.firstName.message}</p> : null}
          </label>

          <label className="text-sm text-white/70">
            Sobrenome
            <input
              type="text"
              {...register("lastName")}
              disabled={!canEditUser}
              className={`mt-1 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 ${
                errors.lastName ? "border-red-500/60" : "border-white/10"
              } ${!canEditUser ? "opacity-60" : ""}`}
            />
            {errors.lastName ? <p className="mt-1 text-xs text-red-400">{errors.lastName.message}</p> : null}
          </label>

          <label className="text-sm text-white/70">
            E-mail
            <input
              type="email"
              {...register("email")}
              disabled={!canEditUser}
              className={`mt-1 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 ${
                errors.email ? "border-red-500/60" : "border-white/10"
              } ${!canEditUser ? "opacity-60" : ""}`}
            />
            {errors.email ? <p className="mt-1 text-xs text-red-400">{errors.email.message}</p> : null}
          </label>

          <label className="text-sm text-white/70">
            Telefone
            <input
              type="tel"
              {...register("phone")}
              disabled={!canEditUser}
              className={`mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 ${
                !canEditUser ? "opacity-60" : ""
              }`}
            />
          </label>

          <label className="text-sm text-white/70">
            CPF
            <input
              type="text"
              {...register("cpf")}
              disabled={!canEditUser}
              className={`mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 ${
                !canEditUser ? "opacity-60" : ""
              }`}
            />
          </label>

          <label className="text-sm text-white/70">
            Função
            <select
              {...register("role")}
              disabled={!canEditUser}
              className={`mt-1 w-full rounded-2xl border bg-[#050505] px-4 py-3 text-sm outline-none focus:border-white/40 ${
                errors.role ? "border-red-500/60" : "border-white/10"
              } ${!canEditUser ? "opacity-60" : ""}`}
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
            {errors.role ? <p className="mt-1 text-xs text-red-400">{errors.role.message}</p> : null}
          </label>

          <label className="text-sm text-white/70">
            Data de nascimento
            <div
              className={`mt-1 flex items-center rounded-2xl border bg-transparent px-3 focus-within:border-white/40 ${
                errors.dateOfBirth ? "border-red-500/60" : "border-white/10"
              } ${!canEditUser ? "opacity-60" : ""}`}
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
                className="w-full bg-transparent px-1 py-3 text-sm outline-none"
                maxLength={10}
                placeholder="dd/mm/aaaa"
              />
              <button
                type="button"
                onClick={() => datePickerRef.current?.showPicker?.()}
                disabled={!canEditUser}
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

          <label className="flex items-center gap-3 text-sm text-white/70">
            <input
              type="checkbox"
              {...register("isActive")}
              disabled={!canEditUser}
              className="h-4 w-4 rounded border border-white/20 bg-transparent text-black"
            />
            Usuário ativo
          </label>

          {isAdmin ? (
            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={() => setShowPasswordResetModal(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40"
              >
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
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
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
        <section className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-1 shadow-card">
          <button
            type="button"
            onClick={() => setShowClientHistory(true)}
            className="flex w-full items-center overflow-hidden rounded-2xl bg-white text-left transition hover:shadow-lg"
          >
            <div className="flex flex-1 flex-col gap-2 px-4 py-4 text-black">
              <p className="text-lg font-semibold">Descubra os atendimentos de {userDetail.first_name}</p>
              <span className="inline-flex w-max items-center gap-2 rounded-full bg-black px-4 py-1 text-xs font-medium text-white">
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
          onSaveProfile={updateProfessionalProfile}
          onAddInterval={addProfessionalInterval}
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
