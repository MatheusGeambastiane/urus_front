"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { Mail } from "lucide-react";
import { env } from "@/lib/env";

export default function DashboardPasswordResetPage() {
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage("");
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${env.apiBaseUrl}/dashboard/auth/password-reset/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
          cache: "no-store",
        }
      );

      const payload = (await response.json().catch(() => null)) as
        | { detail?: string }
        | null;

      if (!response.ok) {
        setErrorMessage(
          payload?.detail ||
            "Nao foi possivel solicitar a redefinicao de senha."
        );
        return;
      }

      setStatusMessage(
        payload?.detail ||
          "Se o e-mail existir, enviaremos as instrucoes de redefinicao."
      );
    } catch {
      setErrorMessage("Erro ao enviar a solicitacao. Tente novamente.");
    } finally {
      setIsSubmitting(false);
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
            <h1 className="text-3xl font-semibold">Redefinir senha</h1>
            <p className="mt-2 text-sm text-white/60">
              Informe o e-mail do seu cadastro para receber as instrucoes.
            </p>
          </header>

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
                disabled={isSubmitting}
                required
              />
            </label>

            {statusMessage ? (
              <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                {statusMessage}
              </p>
            ) : null}

            {errorMessage ? (
              <p className="text-sm text-red-400">{errorMessage}</p>
            ) : null}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3 text-base font-semibold text-black transition hover:bg-white/95 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
            >
              <Mail className="h-5 w-5" />
              {isSubmitting ? "Enviando..." : "Enviar instrucoes"}
            </button>
          </form>

          <Link
            href="/dashboard/login"
            className="mt-6 block w-full text-center text-sm font-medium text-white/70 transition hover:text-white"
          >
            Voltar para o login
          </Link>
        </div>
      </div>
    </main>
  );
}
