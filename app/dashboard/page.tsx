import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { DashboardHome } from "@/components/dashboard/dashboard-home";

export default async function DashboardHomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/dashboard/login");
  }

  const firstName =
    session.user.firstName ||
    session.user.name?.split(" ").at(0) ||
    "Usuário";

  return <DashboardHome firstName={firstName} />;
}
