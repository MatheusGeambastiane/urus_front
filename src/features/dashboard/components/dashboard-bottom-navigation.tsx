"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Calendar, Home, Package, Scissors, Users, Wallet } from "lucide-react";

import {
  dashboardRouteToTab,
  dashboardTabRoutes,
  type DashboardTab,
} from "@/features/dashboard/data/dashboard-tabs";

const bottomNavItems: Array<{
  key: DashboardTab;
  label: string;
  icon: LucideIcon;
}> = [
  { key: "home", label: "Home", icon: Home },
  { key: "agenda", label: "Agenda", icon: Calendar },
  { key: "services", label: "Serviços", icon: Scissors },
  { key: "products", label: "Produtos", icon: Package },
  { key: "users", label: "Usuários", icon: Users },
  { key: "finances", label: "Financeiro", icon: Wallet },
];

export function DashboardBottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = useMemo<DashboardTab>(() => {
    const segment = pathname?.split("/")[2] ?? "home";
    return dashboardRouteToTab[segment] ?? "home";
  }, [pathname]);

  const navigateToTab = useCallback(
    (tab: DashboardTab) => {
      const segment = dashboardTabRoutes[tab];
      router.push(`/dashboard/${segment}`);
    },
    [router],
  );

  return (
    <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-4">
      <div className="pointer-events-auto w-full max-w-[430px] px-4">
        <div className="grid grid-cols-6 gap-2 rounded-3xl border border-white/10 bg-[#0b0b0b]/80 p-2 backdrop-blur">
          {bottomNavItems.map((item) => {
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
      </div>
    </footer>
  );
}
