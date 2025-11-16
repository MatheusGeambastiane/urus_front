import { AgendaPage } from "@/components/dashboard/agenda/agenda-page";
import { getDashboardSession } from "@/lib/get-dashboard-session";

const getDashboardFirstName = (name?: string | null) => {
  if (!name) {
    return "Usuário";
  }
  return name.split(" ").at(0) ?? "Usuário";
};

export default async function DashboardAgendaPage() {
  const session = await getDashboardSession();
  const firstName = session.user?.firstName || getDashboardFirstName(session.user?.name ?? null);

  return <AgendaPage firstName={firstName} />;
}
