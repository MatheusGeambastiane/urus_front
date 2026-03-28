"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Camera, ChevronLeft, Loader2, Save, ShieldCheck, Sparkles } from "lucide-react";
import { DashboardShell } from "@/src/features/dashboard/components/DashboardShell";
import { FeedbackBanner } from "@/components/ui/FeedbackBanner";
import { useAuth } from "@/src/features/shared/hooks/useAuth";
import { convertDisplayDateToIso, formatDisplayDate } from "@/src/features/shared/utils/date";
import { servicesSimpleListEndpoint, usersMeEndpoint } from "@/src/features/users/services/endpoints";
import type { AuthenticatedUserProfile } from "@/src/features/users/types";
import type { ServiceSimpleOption } from "@/src/features/services/types";

type ProfileFormState = {
  firstName: string;
  lastName: string;
  cpf: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  professionalType: string;
  cnpj: string;
  commission: string;
  bio: string;
  services: number[];
};

const emptyForm: ProfileFormState = {
  firstName: "",
  lastName: "",
  cpf: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  professionalType: "",
  cnpj: "",
  commission: "",
  bio: "",
  services: [],
};

const professionalTypeOptions = [
  { value: "barbeiro", label: "Barbeiro" },
  { value: "massoterapeuta", label: "Massoterapeuta" },
];

const formatDateTime = (value?: string | null) => {
  if (!value) return "Não informado";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Não informado";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function MyProfilePage() {
  const router = useRouter();
  const { accessToken, fetchWithAuth, profilePic, userRole } = useAuth();
  const [profile, setProfile] = useState<AuthenticatedUserProfile | null>(null);
  const [form, setForm] = useState<ProfileFormState>(emptyForm);
  const [serviceOptions, setServiceOptions] = useState<ServiceSimpleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingImage, setSavingImage] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showProfessionalProfile = profile?.role === "professional" || Boolean(profile?.professional_profile);

  useEffect(() => {
    if (!accessToken) return;
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileResponse, servicesResponse] = await Promise.all([
          fetchWithAuth(usersMeEndpoint, {
            credentials: "include",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            signal: controller.signal,
          }),
          fetchWithAuth(servicesSimpleListEndpoint, {
            credentials: "include",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            signal: controller.signal,
          }),
        ]);

        if (!profileResponse.ok) throw new Error("Não foi possível carregar seu perfil.");
        if (!servicesResponse.ok) throw new Error("Não foi possível carregar a lista de serviços.");

        const profileData: AuthenticatedUserProfile = await profileResponse.json();
        const servicesData: ServiceSimpleOption[] = await servicesResponse.json();

        setProfile(profileData);
        setServiceOptions(servicesData);
        setForm({
          firstName: profileData.first_name ?? "",
          lastName: profileData.last_name ?? "",
          cpf: profileData.cpf ?? "",
          email: profileData.email ?? "",
          phone: profileData.phone ?? "",
          dateOfBirth: formatDisplayDate(profileData.date_of_birth ?? ""),
          professionalType: profileData.professional_profile?.professional_type ?? "",
          cnpj: profileData.professional_profile?.cnpj ?? "",
          commission:
            profileData.professional_profile?.commission != null
              ? String(profileData.professional_profile.commission)
              : "",
          bio: profileData.professional_profile?.bio ?? "",
          services: profileData.professional_profile?.services.map((service) => service.id) ?? [],
        });
      } catch (error) {
        if (!controller.signal.aborted) {
          setFeedback({
            type: "error",
            message: error instanceof Error ? error.message : "Erro ao carregar seu perfil.",
          });
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void fetchData();
    return () => controller.abort();
  }, [accessToken, fetchWithAuth]);

  const imagePreview = useMemo(() => {
    if (!selectedImage) return profile?.profile_pic ?? profilePic ?? null;
    return URL.createObjectURL(selectedImage);
  }, [selectedImage, profile?.profile_pic, profilePic]);

  useEffect(() => {
    return () => {
      if (selectedImage && imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [selectedImage, imagePreview]);

  const selectedServiceNames = useMemo(
    () =>
      serviceOptions
        .filter((service) => form.services.includes(service.id))
        .map((service) => service.name),
    [form.services, serviceOptions],
  );

  const setFormField = <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveProfile = async () => {
    if (!accessToken) return;
    setSaving(true);
    setFeedback(null);

    try {
      const dateOfBirthIso = convertDisplayDateToIso(form.dateOfBirth);
      if (!dateOfBirthIso) {
        throw new Error("Use uma data de nascimento válida no formato dd/mm/aaaa.");
      }

      const payload: Record<string, unknown> = {
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        cpf: form.cpf.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        date_of_birth: dateOfBirthIso,
      };

      if (showProfessionalProfile) {
        payload.professional_profile = {
          professional_type: form.professionalType,
          cnpj: form.cnpj.trim(),
          commission: Number(form.commission || 0),
          bio: form.bio.trim(),
          services: form.services,
        };
      }

      const response = await fetchWithAuth(usersMeEndpoint, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const detail = (data && (data.detail || data.message)) || "Não foi possível salvar o perfil.";
        throw new Error(detail);
      }

      const updated: AuthenticatedUserProfile = await response.json();
      setProfile(updated);
      setForm((prev) => ({
        ...prev,
        firstName: updated.first_name ?? "",
        lastName: updated.last_name ?? "",
        cpf: updated.cpf ?? "",
        email: updated.email ?? "",
        phone: updated.phone ?? "",
        dateOfBirth: formatDisplayDate(updated.date_of_birth ?? ""),
        professionalType: updated.professional_profile?.professional_type ?? prev.professionalType,
        cnpj: updated.professional_profile?.cnpj ?? prev.cnpj,
        commission:
          updated.professional_profile?.commission != null
            ? String(updated.professional_profile.commission)
            : prev.commission,
        bio: updated.professional_profile?.bio ?? prev.bio,
        services: updated.professional_profile?.services.map((service) => service.id) ?? prev.services,
      }));
      setFeedback({ type: "success", message: "Perfil atualizado com sucesso." });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Erro ao salvar perfil.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveImage = async () => {
    if (!accessToken || !selectedImage) return;
    setSavingImage(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append("profile_pic", selectedImage);

      const response = await fetchWithAuth(usersMeEndpoint, {
        method: "PATCH",
        credentials: "include",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const detail = (data && (data.detail || data.message)) || "Não foi possível atualizar a foto.";
        throw new Error(detail);
      }

      const updated: AuthenticatedUserProfile = await response.json();
      setProfile(updated);
      setSelectedImage(null);
      setFeedback({ type: "success", message: "Foto atualizada com sucesso." });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Erro ao atualizar foto.",
      });
    } finally {
      setSavingImage(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell activeTab="home" userRole={userRole}>
        <div className="flex min-h-[60vh] items-center justify-center text-white/70">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-3 text-sm">Carregando perfil...</span>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell activeTab="home" userRole={userRole}>
      <div className="space-y-5 pb-24">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-white/40 hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.25em] text-amber-100/60">Meu perfil</p>
            <p className="text-2xl font-semibold text-white">Identidade da equipe</p>
          </div>
        </header>

        {feedback ? <FeedbackBanner message={feedback.message} type={feedback.type} /> : null}

        <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,220,128,0.22),transparent_35%),linear-gradient(145deg,#161616,#060606_72%)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)] opacity-60" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group relative h-24 w-24 overflow-hidden rounded-[26px] border border-white/15 bg-black/30"
              >
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt={profile?.first_name ?? "Perfil"} className="h-full w-full object-cover transition group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-white/70">
                    <Camera className="h-6 w-6" />
                  </div>
                )}
                <span className="absolute inset-x-0 bottom-0 bg-black/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100/90">
                  Foto
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => setSelectedImage(event.target.files?.[0] ?? null)}
              />

              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100/85">
                  <Sparkles className="h-3.5 w-3.5" />
                  Perfil autenticado
                </div>
                <p className="mt-3 text-3xl font-semibold text-white">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <p className="mt-1 text-sm text-white/60">{profile?.role_display}</p>
                <p className="text-xs text-white/40">{profile?.email}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:min-w-[240px]">
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">Estado</p>
                <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-white">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  {profile?.is_active ? "Perfil ativo" : "Perfil inativo"}
                </p>
              </div>
              {selectedImage ? (
                <button
                  type="button"
                  onClick={handleSaveImage}
                  disabled={savingImage}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  Salvar nova foto
                </button>
              ) : null}
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
            <p className="text-xs uppercase tracking-[0.18em] text-white/45">Criado em</p>
            <p className="mt-2 text-sm font-medium text-white">{formatDateTime(profile?.created_at)}</p>
          </div>
          <div className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
            <p className="text-xs uppercase tracking-[0.18em] text-white/45">Atualizado em</p>
            <p className="mt-2 text-sm font-medium text-white">{formatDateTime(profile?.updated_at)}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Dados principais</p>
              <p className="text-xl font-semibold text-white">Assinatura da conta</p>
            </div>
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar perfil
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-white/70">
              Primeiro nome
              <input
                type="text"
                value={form.firstName}
                onChange={(event) => setFormField("firstName", event.target.value)}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-amber-200/60"
              />
            </label>
            <label className="text-sm text-white/70">
              Sobrenome
              <input
                type="text"
                value={form.lastName}
                onChange={(event) => setFormField("lastName", event.target.value)}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-amber-200/60"
              />
            </label>
            <label className="text-sm text-white/70">
              CPF
              <input
                type="text"
                value={form.cpf}
                onChange={(event) => setFormField("cpf", event.target.value)}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-amber-200/60"
              />
            </label>
            <label className="text-sm text-white/70">
              Telefone
              <input
                type="text"
                value={form.phone}
                onChange={(event) => setFormField("phone", event.target.value)}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-amber-200/60"
              />
            </label>
            <label className="text-sm text-white/70">
              E-mail
              <input
                type="email"
                value={form.email}
                onChange={(event) => setFormField("email", event.target.value)}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-amber-200/60"
              />
            </label>
            <label className="text-sm text-white/70">
              Data de nascimento
              <div className="mt-1 flex items-center rounded-2xl border border-white/10 bg-transparent px-3 focus-within:border-amber-200/60">
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.dateOfBirth}
                  onChange={(event) => setFormField("dateOfBirth", formatDisplayDate(event.target.value))}
                  placeholder="dd/mm/aaaa"
                  maxLength={10}
                  className="w-full bg-transparent px-1 py-3 text-sm outline-none"
                />
                <Calendar className="h-4 w-4 text-white/40" />
              </div>
            </label>
          </div>
        </section>

        {showProfessionalProfile ? (
          <section className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
            <div className="mb-5">
              <p className="text-sm text-white/60">Perfil profissional</p>
              <p className="text-xl font-semibold text-white">Especialidade e serviços</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-white/70">
                Tipo profissional
                <select
                  value={form.professionalType}
                  onChange={(event) => setFormField("professionalType", event.target.value)}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-[#050505] px-4 py-3 text-sm outline-none focus:border-amber-200/60"
                >
                  <option value="">Selecione</option>
                  {professionalTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-white/70">
                Comissão (%)
                <input
                  type="text"
                  inputMode="decimal"
                  value={form.commission}
                  onChange={(event) => setFormField("commission", event.target.value)}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-amber-200/60"
                />
              </label>

              <label className="text-sm text-white/70 sm:col-span-2">
                CNPJ
                <input
                  type="text"
                  value={form.cnpj}
                  onChange={(event) => setFormField("cnpj", event.target.value)}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-amber-200/60"
                />
              </label>

              <label className="text-sm text-white/70 sm:col-span-2">
                Bio
                <textarea
                  rows={4}
                  value={form.bio}
                  onChange={(event) => setFormField("bio", event.target.value)}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-amber-200/60"
                />
              </label>
            </div>

            <div className="mt-5 space-y-3">
              <div>
                <p className="text-sm text-white/70">Serviços atendidos</p>
                <p className="text-xs text-white/45">Selecione os serviços para enviar no PATCH do perfil profissional.</p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {serviceOptions.map((service) => {
                  const selected = form.services.includes(service.id);
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() =>
                        setFormField(
                          "services",
                          selected
                            ? form.services.filter((id) => id !== service.id)
                            : [...form.services, service.id],
                        )
                      }
                      className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        selected
                          ? "border-amber-200/60 bg-amber-200/10 text-amber-50"
                          : "border-white/10 bg-black/20 text-white/75"
                      }`}
                    >
                      <span className="block font-medium">{service.name}</span>
                      <span className="mt-1 block text-xs text-white/45">ID {service.id}</span>
                    </button>
                  );
                })}
              </div>

              {selectedServiceNames.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedServiceNames.map((name) => (
                    <span
                      key={name}
                      className="rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1 text-xs font-medium text-amber-100"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        ) : null}
      </div>
    </DashboardShell>
  );
}
