"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DashboardLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-12 text-white">
      <div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-10">
        <div className="w-full rounded-[32px] border border-white/5 bg-[#0f0f0f]/95 p-6 shadow-[0_20px_40px_rgba(0,0,0,0.45)]">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold">Entrar</h1>
          </header>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block space-y-2 text-sm">
              <span className="text-white/70">Email</span>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="nome@exemplo.com"
                className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-base text-white placeholder-white/30 outline-none transition focus:border-white/40 focus:ring-2 focus:ring-white/15"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isSubmitting}
                required
              />
            </label>

            <label className="block space-y-2 text-sm">
              <span className="text-white/70">Senha</span>
              <input
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-base text-white placeholder-white/30 outline-none transition focus:border-white/40 focus:ring-2 focus:ring-white/15"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isSubmitting}
                required
              />
            </label>

            {errorMessage ? (
              <p className="text-sm text-red-400">{errorMessage}</p>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-2xl bg-white py-3 text-base font-semibold text-black transition hover:bg-white/95 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <button
            type="button"
            className="mt-5 text-center text-sm font-medium text-white/60 transition hover:text-white"
          >
            Esqueci minha senha
          </button>
        </div>
      </div>
    </main>
  );
}
