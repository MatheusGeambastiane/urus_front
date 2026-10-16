import { redirect } from "next/navigation";

import { getDashboardSession } from "@/lib/get-dashboard-session";
import { GoalsTab } from "@/src/features/dashboard/tabs/goals/GoalsTab";

export default async function GoalsPage() {
  const session = await getDashboardSession();
  if (session.user?.role !== "admin" && session.user?.role !== "professional") {
    redirect("/dashboard/home");
  }
  return <GoalsTab firstName={session.user.firstName ?? "Usuário"} />;
}
