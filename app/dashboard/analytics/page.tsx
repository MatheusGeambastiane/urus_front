import { redirect } from "next/navigation";

import { AnalyticsTab } from "@/src/features/dashboard/tabs/analytics/AnalyticsTab";
import { getDashboardSession } from "@/lib/get-dashboard-session";

export default async function AnalyticsPage() {
  const session = await getDashboardSession();
  if (session.user?.role !== "admin") {
    redirect("/dashboard/home");
  }

  return <AnalyticsTab firstName={session.user.firstName ?? "Admin"} />;
}
