import type { Session } from "next-auth";

import { DashboardHome } from "@/features/dashboard/components/dashboard-home";
import type { DashboardTab } from "@/features/dashboard/data/dashboard-tabs";
import { getDashboardSession } from "@/lib/get-dashboard-session";

const getDashboardFirstName = (session: Session) => {
  const user = session.user;

  if (!user) {
    return "Usuário";
  }

  return user.firstName || user.name?.split(" ").at(0) || "Usuário";
};

export function createDashboardTabPage(tab: DashboardTab) {
  return async function DashboardTabPage() {
    const session = await getDashboardSession();
    const firstName = getDashboardFirstName(session);

    return <DashboardHome firstName={firstName} activeTab={tab} />;
  };
}
