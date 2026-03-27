"use client";

import type { ComponentType, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Home, Scissors, ShoppingBag, Sparkles, Users, Wallet } from "lucide-react";

import { dashboardTabRoutes, type DashboardTab } from "@/components/dashboard/dashboard-tabs";

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
      <div className="mx-auto flex w-full max-w-md flex-col px-5 pb-28 pt-10">{children}</div>

      <nav className="fixed bottom-4 left-1/2 w-full max-w-md -translate-x-1/2 px-4">
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
