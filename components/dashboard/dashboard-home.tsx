"use client";

import type { DashboardTab } from "@/components/dashboard/dashboard-tabs";
import { AgendaTab } from "@/src/features/dashboard/tabs/agenda/AgendaTab";
import { FinancesTab } from "@/src/features/dashboard/tabs/finances/FinancesTab";
import { HomeTab } from "@/src/features/dashboard/tabs/home/HomeTab";
import { PerformanceTab } from "@/src/features/dashboard/tabs/performance/PerformanceTab";
import { ProductsTab } from "@/src/features/dashboard/tabs/products/ProductsTab";
import { ServicesTab } from "@/src/features/dashboard/tabs/services/ServicesTab";
import { UsersTab } from "@/src/features/dashboard/tabs/users/UsersTab";

type DashboardHomeProps = {
  firstName: string;
  activeTab: DashboardTab;
};

const TAB_COMPONENTS = {
  home: HomeTab,
  users: UsersTab,
  agenda: AgendaTab,
  services: ServicesTab,
  products: ProductsTab,
  finances: FinancesTab,
  performance: PerformanceTab,
} as const;

export function DashboardHome({ firstName, activeTab }: DashboardHomeProps) {
  const ActiveTab = TAB_COMPONENTS[activeTab] ?? HomeTab;

  return <ActiveTab firstName={firstName} />;
}
