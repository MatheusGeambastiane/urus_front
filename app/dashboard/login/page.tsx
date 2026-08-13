"use client";

import Image from "next/image";
import { Eye, EyeOff, LogIn, LoaderCircle } from "lucide-react";
import { FormEvent, Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function DashboardLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const oauthError = searchParams.get("error");
  const oauthErrorMessage =
    oauthError === "AccessDenied"
      ? "Esta conta Google não possui acesso staff ativo ao dashboard."
      : oauthError === "GoogleSignin" || oauthError === "OAuthCallback"
        ? "Não foi possível autenticar com o Google. Tente novamente."
        : "";
  const displayedError = errorMessage || oauthErrorMessage;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setErrorMessage(result.error);
      return;
    }

    router.replace("/dashboard");
  };

  const handleGoogleLogin = async () => {
    setErrorMessage("");
    setIsGoogleSubmitting(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      setErrorMessage("Não foi possível iniciar o login com o Google.");
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(255,255,255,0.05),_transparent_40%),linear-gradient(135deg,_#050505_0%,_#0a0a0a_40%,_#020202_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_55%)] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(255,255,255,0.05),transparent_50%)] blur-2xl" />
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center px-6 py-12">
        <div className="mb-4 flex justify-center">
          <div className="relative h-20 w-52">
            <Image
              src="/urus_logo_nobg_branca.png"
              alt="Urus Barbearia"
              fill
              sizes="208px"
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="w-full rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <header className="mb-6 text-center">
            <h1 className="text-3xl font-semibold">Entrar</h1>
            <p className="mt-2 text-sm text-white/60">
              Acesso exclusivo para profissionais Urus.
            </p>
          </header>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleSubmitting || isSubmitting}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white px-4 py-3 text-sm font-semibold text-[#111] shadow-[0_12px_30px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGoogleSubmitting ? (
              <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <svg
                width="19"
                height="19"
                viewBox="0 0 18 18"
                aria-hidden="true"
              >
                <path fill="#4285F4" d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.482h4.844a4.14 4.14 0 0 1-1.797 2.716v2.258h2.909c1.702-1.567 2.684-3.875 2.684-6.615Z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.468-.806 5.956-2.18l-2.91-2.258c-.805.54-1.835.86-3.046.86-2.344 0-4.328-1.585-5.037-3.714H.956v2.332A9 9 0 0 0 9 18Z" />
                <path fill="#FBBC05" d="M3.963 10.708A5.41 5.41 0 0 1 3.681 9c0-.593.102-1.17.282-1.708V4.96H.956A9 9 0 0 0 0 9c0 1.452.347 2.827.956 4.04l3.007-2.332Z" />
                <path fill="#EA4335" d="M9 3.578c1.321 0 2.507.454 3.442 1.346l2.582-2.582C13.464.89 11.426 0 9 0A9 9 0 0 0 .956 4.96l3.007 2.332C4.672 5.163 6.656 3.578 9 3.578Z" />
              </svg>
            )}
            {isGoogleSubmitting ? "Abrindo o Google..." : "Entrar com o Google"}
          </button>

          <div className="my-6 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">
              ou use sua senha
            </span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block space-y-2 text-sm">
              <span className="text-white/70">Email</span>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="nome@exemplo.com"
                className="w-full rounded-2xl border border-white/15 bg-black px-4 py-3 text-base text-white placeholder-white/30 outline-none transition focus:border-white/40 focus:ring-2 focus:ring-white/20"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isSubmitting || isGoogleSubmitting}
                required
              />
            </label>

            <label className="block space-y-2 text-sm">
              <span className="text-white/70">Senha</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-white/15 bg-black px-4 py-3 pr-12 text-base text-white placeholder-white/30 outline-none transition focus:border-white/40 focus:ring-2 focus:ring-white/20"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isSubmitting || isGoogleSubmitting}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="absolute inset-y-0 right-3 flex items-center text-white/60"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </label>

            {displayedError ? (
              <p className="text-sm text-red-400">{displayedError}</p>
            ) : null}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3 text-base font-semibold text-black transition hover:bg-white/95 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting || isGoogleSubmitting}
            >
              <LogIn className="h-5 w-5" />
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <Link
            href="/dashboard/password-reset"
            className="mt-6 w-full text-center text-sm font-medium text-white/70 transition hover:text-white"
          >
            Esqueci minha senha
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function DashboardLoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#050505]" />}>
      <DashboardLoginContent />
    </Suspense>
  );
}
