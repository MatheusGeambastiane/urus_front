import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";

export function ResetPasswordLoading() {
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
            <h1 className="text-3xl font-semibold">Nova senha</h1>
            <p className="mt-2 text-sm text-white/60">
              Defina sua nova senha para acessar o painel.
            </p>
          </header>

          <form className="space-y-5">
            <label className="block space-y-2 text-sm">
              <span className="text-white/70">Nova senha</span>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full rounded-2xl border border-white/15 bg-black px-4 py-3 text-base text-white placeholder-white/30 outline-none transition focus:border-white/40 focus:ring-2 focus:ring-white/20"
                disabled
              />
            </label>

            <label className="block space-y-2 text-sm">
              <span className="text-white/70">Confirmar nova senha</span>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full rounded-2xl border border-white/15 bg-black px-4 py-3 text-base text-white placeholder-white/30 outline-none transition focus:border-white/40 focus:ring-2 focus:ring-white/20"
                disabled
              />
            </label>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3 text-base font-semibold text-black transition hover:bg-white/95 disabled:cursor-not-allowed disabled:opacity-60"
              disabled
            >
              <Lock className="h-5 w-5" />
              Atualizando...
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
