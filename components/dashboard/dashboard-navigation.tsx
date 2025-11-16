"use client";

import type { ElementType } from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  DollarSign,
  Home,
  Package,
  Plus,
  Users,
  Wrench,
} from "lucide-react";

import {
  dashboardRouteToTab,
  dashboardTabRoutes,
  type DashboardTab,
} from "@/components/dashboard/dashboard-tabs";

const navItems: Array<{ tab: DashboardTab; label: string; icon: ElementType }> = [
  { tab: "home", label: "Home", icon: Home },
  { tab: "agenda", label: "Agenda", icon: Calendar },
  { tab: "services", label: "Serviços", icon: Wrench },
  { tab: "products", label: "Produtos", icon: Package },
  { tab: "users", label: "Clientes", icon: Users },
  { tab: "finances", label: "Financeiro", icon: DollarSign },
];

const quickActions: Partial<Record<DashboardTab, { label: string; href: string }>> = {
  agenda: {
    label: "Novo atendimento",
    href: "/dashboard/agenda?novo_atendimento=1",
  },
};

const getRoutePath = (tab: DashboardTab) => `/dashboard/${dashboardTabRoutes[tab]}`;

export function DashboardNavigationBar() {
  const pathname = usePathname();
  const router = useRouter();
  const activeSegment = pathname?.split("/")[2] ?? "home";
  const activeTab = dashboardRouteToTab[activeSegment] ?? "home";
  const quickAction = quickActions[activeTab];

  return (
    <footer className="sticky bottom-0 z-50 border-t border-white/10 bg-[#050505]/95 backdrop-blur supports-[backdrop-filter]:bg-[#050505]/75">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <nav className="flex flex-1 items-center justify-around gap-1">
          {navItems.map(({ tab, label, icon: Icon }) => {
            const href = getRoutePath(tab);
            const isActive = tab === activeTab;
            return (
              <Link
                key={tab}
                href={href}
                className={`flex flex-col items-center rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                  isActive ? "text-white" : "text-white/50 hover:text-white/80"
                }`}
              >
                <Icon className="mb-1 h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        {quickAction ? (
          <button
            type="button"
            className="ml-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black shadow-lg transition hover:bg-white/90"
            onClick={() => router.push(quickAction.href)}
          >
            <Plus className="h-4 w-4" />
            {quickAction.label}
          </button>
        ) : null}
      </div>
    </footer>
  );
}
