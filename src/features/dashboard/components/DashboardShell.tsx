"use client";

import type { ComponentType, ReactNode } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Calendar, Home, Scissors, ShoppingBag, Sparkles, Users, Wallet } from "lucide-react";

import { ProfileMenu } from "@/components/ui/ProfileMenu";
import { dashboardTabRoutes, type DashboardTab } from "@/components/dashboard/dashboard-tabs";
import { useAuth } from "@/src/features/shared/hooks/useAuth";

type DashboardShellProps = {
  activeTab: DashboardTab;
  children: ReactNode;
  userRole?: string;
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

export function DashboardShell({ activeTab, children, userRole }: DashboardShellProps) {
  const router = useRouter();
  const { profilePic } = useAuth();
  const visibleItems = bottomNavItems.filter((item) => {
    if (item.key === "finances") {
      return userRole === "admin";
    }
    if (item.key === "performance") {
      return userRole === "professional";
    }
    return true;
  });

  return (
    <div className="relative min-h-screen bg-[#050505] text-white">
      <div className="mx-auto w-full max-w-md px-5 pt-4">
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

      <div className="mx-auto flex w-full max-w-md flex-col px-5 pb-28 pt-5">{children}</div>

      <nav className="fixed bottom-4 left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-4">
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
                onClick={() => router.push(`/dashboard/${dashboardTabRoutes[item.key]}`)}
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
