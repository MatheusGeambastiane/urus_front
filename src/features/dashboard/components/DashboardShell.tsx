"use client";

import type { ComponentType, ReactNode } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Calendar, Home, Scissors, ShoppingBag, Sparkles, Users, Wallet } from "lucide-react";

import { ProfileMenu } from "@/components/ui/ProfileMenu";
import { dashboardTabRoutes, type DashboardTab } from "@/components/dashboard/dashboard-tabs";

type DashboardShellProps = {
  activeTab: DashboardTab;
  children: ReactNode;
  userRole?: string;
  profilePic?: string | null;
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

export function DashboardShell({ activeTab, children, userRole, profilePic = null }: DashboardShellProps) {
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
    <div className="relative min-h-screen bg-[#050505] text-white">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 border-r border-white/8 bg-[#070707]/95 px-5 py-6 backdrop-blur-xl lg:flex lg:flex-col">
        <div className="px-3">
          <span className="brand-sheen block text-[1.05rem] font-semibold uppercase tracking-[0.38em] text-white">
            URUS
          </span>
          <span className="brand-sheen mt-1 block text-[0.58rem] font-medium uppercase tracking-[0.34em] text-white/95">
            Barbearia
          </span>
        </div>

        <nav className="mt-10 flex flex-1 flex-col gap-2">
          {visibleItems.map((item) => {
            const isActive = item.key === activeTab;
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigateToTab(item.key)}
                className={`group flex h-12 items-center gap-3 rounded-2xl px-4 text-sm font-semibold transition ${
                  isActive
                    ? "bg-white text-black shadow-[0_18px_40px_rgba(255,255,255,0.08)]"
                    : "text-white/62 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="rounded-3xl border border-white/8 bg-white/[0.04] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">Navegação</p>
          <p className="mt-1 text-sm font-medium text-white/70">Painel administrativo</p>
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

      <nav className="fixed bottom-4 left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-4 lg:hidden">
        <div
          className="grid gap-2 rounded-3xl border border-white/10 bg-[#0b0b0b]/80 p-2 backdrop-blur"
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
                className={`flex flex-col items-center rounded-2xl px-2 py-2 text-[11px] font-medium transition ${
                  isActive ? "bg-white text-black shadow-inner" : "text-white/70"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
                <span className="mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
