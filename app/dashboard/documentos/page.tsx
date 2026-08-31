import { redirect } from "next/navigation";

import { getDashboardSession } from "@/lib/get-dashboard-session";
import { DocumentsTab } from "@/src/features/dashboard/tabs/documents/DocumentsTab";

export default async function DocumentsPage() {
  const session = await getDashboardSession();
  if (session.user?.role !== "admin") {
    redirect("/dashboard/home");
  }

  return <DocumentsTab firstName={session.user.firstName ?? "Admin"} />;
}
