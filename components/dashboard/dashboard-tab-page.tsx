import type { Session } from "next-auth";

import type { DashboardTab } from "@/components/dashboard/dashboard-tabs";
import { getDashboardSession } from "@/lib/get-dashboard-session";
import { AgendaTab } from "@/src/features/dashboard/tabs/agenda/AgendaTab";
import { FinancesTab } from "@/src/features/dashboard/tabs/finances/FinancesTab";
import { HomeTab } from "@/src/features/dashboard/tabs/home/HomeTab";
import { PerformanceTab } from "@/src/features/dashboard/tabs/performance/PerformanceTab";
import { ProductsTab } from "@/src/features/dashboard/tabs/products/ProductsTab";
import { ServicesTab } from "@/src/features/dashboard/tabs/services/ServicesTab";
import { UsersTab } from "@/src/features/dashboard/tabs/users/UsersTab";

const getDashboardFirstName = (session: Session) => {
  const user = session.user;

  if (!user) {
    return "Usuário";
  }

  return user.firstName || user.name?.split(" ").at(0) || "Usuário";
};

const dashboardTabComponentMap = {
  home: HomeTab,
  agenda: AgendaTab,
  services: ServicesTab,
  products: ProductsTab,
  users: UsersTab,
  finances: FinancesTab,
  performance: PerformanceTab,
} as const;

export function createDashboardTabPage(tab: DashboardTab) {
  return async function DashboardTabPage() {
    const session = await getDashboardSession();
    const firstName = getDashboardFirstName(session);
    const TabComponent = dashboardTabComponentMap[tab];

    return <TabComponent firstName={firstName} />;
  };
}
