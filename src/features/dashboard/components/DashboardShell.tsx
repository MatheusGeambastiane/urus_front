"use client";

import type { ComponentType, ReactNode } from "react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Calendar, Home, Scissors, ShoppingBag, Sparkles, Users, Wallet } from "lucide-react";

import { ProfileMenu } from "@/components/ui/ProfileMenu";
import { dashboardTabRoutes, type DashboardTab } from "@/components/dashboard/dashboard-tabs";

type DashboardShellProps = {
  activeTab: DashboardTab;
  children: ReactNode;
  userRole?: string;
  profilePic?: string | null;
  desktopVariant?: "default" | "luxury";
};

const bottomNavItems: Array<{ key: DashboardTab; label: string; icon: ComponentType<{ className?: string; strokeWidth?: number }> }> = [
  { key: "home", label: "Home", icon: Home },
  { key: "agenda", label: "Agenda", icon: Calendar },
  { key: "services", label: "Serviços", icon: Scissors },
  { key: "products", label: "Produtos", icon: ShoppingBag },
  { key: "users", label: "Usuários", icon: Users },
  { key: "finances", label: "Financeiro", icon: Wallet },
  { key: "performance", label: "Desempenho", icon: Sparkles },
];

export function DashboardShell({
  activeTab,
  children,
  userRole,
  profilePic = null,
  desktopVariant = "default",
}: DashboardShellProps) {
  const router = useRouter();
  const visibleItems = bottomNavItems.filter((item) => {
    if (item.key === "finances") {
      return userRole === "admin";
    }
    if (item.key === "performance") {
      return userRole === "professional";
    }
    return true;
  });
  const navigateToTab = (tab: DashboardTab) => {
    router.push(`/dashboard/${dashboardTabRoutes[tab]}`);
  };

  return (
    <div className={`relative min-h-screen bg-[#050505] text-white ${desktopVariant === "luxury" ? "lg:bg-[#080807]" : ""}`}>
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 overflow-hidden border-r border-[#c6a56b]/15 bg-[radial-gradient(circle_at_top_left,rgba(198,165,107,0.1),transparent_28%),linear-gradient(180deg,rgba(13,13,11,0.98),rgba(6,6,6,0.99))] px-5 py-6 shadow-[22px_0_70px_rgba(0,0,0,0.2)] backdrop-blur-xl [font-family:var(--font-dashboard-body)] lg:flex lg:flex-col">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#c6a56b]/70 to-transparent" />

        <div className="relative flex h-28 shrink-0 items-center justify-center overflow-hidden" aria-label="Urus Barbearia">
          <Image
            src="/urus_logo_nobg_branca.png"
            alt="Urus Barbearia"
            width={500}
            height={500}
            sizes="224px"
            className="h-56 w-56 max-w-none object-contain"
            priority
          />
          <div className="absolute bottom-0 flex items-center gap-3 text-[9px] font-semibold uppercase tracking-[0.34em] text-[#c6a56b]/55">
            <span className="h-px w-7 bg-[#c6a56b]/25" />
            Backoffice
            <span className="h-px w-7 bg-[#c6a56b]/25" />
          </div>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1.5" aria-label="Navegação principal">
          {visibleItems.map((item) => {
            const isActive = item.key === activeTab;
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigateToTab(item.key)}
                aria-current={isActive ? "page" : undefined}
                className={`group relative flex h-[3.15rem] items-center gap-3 rounded-[14px] border px-3 text-sm font-semibold transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c6a56b]/60 ${
                  isActive
                    ? "border-[#c6a56b]/22 bg-[linear-gradient(90deg,rgba(198,165,107,0.15),rgba(198,165,107,0.055))] text-[#e4c887] shadow-[0_14px_32px_rgba(0,0,0,0.22)] before:absolute before:-left-5 before:h-6 before:w-[3px] before:rounded-r-full before:bg-[#c6a56b] before:shadow-[0_0_14px_rgba(198,165,107,0.5)]"
                    : "border-transparent text-white/52 hover:border-white/[0.06] hover:bg-white/[0.035] hover:text-white/90"
                }`}
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-[10px] transition duration-300 ${
                  isActive
                    ? "bg-[#c6a56b] text-[#0a0907] shadow-[0_8px_20px_rgba(198,165,107,0.18)]"
                    : "bg-white/[0.035] text-white/55 group-hover:bg-[#c6a56b]/10 group-hover:text-[#d9ba78]"
                }`}>
                  <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.3 : 1.9} />
                </span>
                <span className="tracking-[0.01em]">{item.label}</span>
                {isActive ? <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#c6a56b] shadow-[0_0_10px_rgba(198,165,107,0.75)]" /> : null}
              </button>
            );
          })}
        </nav>

        <div className="relative overflow-hidden rounded-[18px] border border-[#c6a56b]/12 bg-[#c6a56b]/[0.045] px-4 py-3.5">
          <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-[#c6a56b]/60 to-transparent" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c6a56b]/55">Urus Workspace</p>
          <p className="mt-1.5 text-sm font-medium text-white/68">Painel administrativo</p>
        </div>
      </aside>

      <div className="mx-auto w-full max-w-md px-5 pt-4 lg:hidden">
        <div className="grid h-12 grid-cols-[48px_minmax(0,1fr)_48px] items-center rounded-3xl bg-[#050505]/60 px-0 backdrop-blur-xl">
          <div className="h-12 w-12" />
          <div className="flex flex-col items-center justify-center text-center leading-none">
            <span className="brand-sheen text-[1.02rem] font-semibold uppercase tracking-[0.38em] text-white">
              URUS
            </span>
            <span className="brand-sheen mt-1 text-[0.56rem] font-medium uppercase tracking-[0.34em] text-white/95">
              Barbearia
            </span>
          </div>
          <div className="flex justify-end pr-0">
          <ProfileMenu
            profilePicUrl={profilePic}
            onLogout={() => void signOut({ callbackUrl: "/dashboard/login" })}
            myProfileHref="/dashboard/meu-perfil"
          />
          </div>
        </div>
      </div>

      <div className="hidden lg:ml-72 lg:flex lg:w-[calc(100%-18rem)] lg:px-8 lg:pt-6 xl:px-10">
        <div className="mx-auto flex w-full max-w-[1500px] items-center justify-end">
          <ProfileMenu
            profilePicUrl={profilePic}
            onLogout={() => void signOut({ callbackUrl: "/dashboard/login" })}
            myProfileHref="/dashboard/meu-perfil"
          />
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-md flex-col px-5 pb-28 pt-5 lg:mx-0 lg:ml-72 lg:w-[calc(100%-18rem)] lg:max-w-none lg:px-8 lg:pb-10 lg:pt-5 xl:px-10">
        <div className="mx-auto w-full lg:max-w-[1500px]">{children}</div>
      </main>

      <nav className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-4 [font-family:var(--font-dashboard-body)] lg:hidden" aria-label="Navegação principal">
        <div
          className="relative grid gap-1 overflow-hidden rounded-[24px] border border-[#c6a56b]/18 bg-[linear-gradient(180deg,rgba(18,17,14,0.94),rgba(8,8,8,0.96))] p-1.5 shadow-[0_22px_55px_rgba(0,0,0,0.55)] backdrop-blur-2xl before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#c6a56b]/70 before:to-transparent"
          style={{ gridTemplateColumns: `repeat(${visibleItems.length}, minmax(0, 1fr))` }}
        >
          {visibleItems.map((item) => {
            const isActive = item.key === activeTab;
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigateToTab(item.key)}
                aria-current={isActive ? "page" : undefined}
                className={`group relative flex min-w-0 flex-col items-center rounded-[17px] border px-1 py-2 text-[8px] font-medium transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c6a56b]/60 min-[380px]:text-[9px] ${
                  isActive
                    ? "border-[#c6a56b]/18 bg-[#c6a56b]/12 text-[#e4c887] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                    : "border-transparent text-white/48 active:bg-white/[0.045] active:text-white/80"
                }`}
              >
                {isActive ? <span className="absolute top-0 h-0.5 w-5 rounded-b-full bg-[#c6a56b] shadow-[0_0_9px_rgba(198,165,107,0.7)]" /> : null}
                <span className={`flex h-7 w-7 items-center justify-center rounded-[9px] transition ${
                  isActive ? "bg-[#c6a56b] text-[#090806] shadow-[0_7px_18px_rgba(198,165,107,0.16)]" : "text-white/55"
                }`}>
                  <Icon className="h-[17px] w-[17px]" strokeWidth={isActive ? 2.35 : 1.9} />
                </span>
                <span className="mt-1 whitespace-nowrap tracking-[-0.01em]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
