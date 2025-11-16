import type { ReactNode } from "react";

import { DashboardNavigationBar } from "@/components/dashboard/dashboard-navigation";
import { DashboardProvider } from "@/components/dashboard/dashboard-provider";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardProvider>
      <div className="flex min-h-screen flex-col bg-[#050505] text-white">
        <main className="flex-1 pb-28">{children}</main>
        <DashboardNavigationBar />
      </div>
    </DashboardProvider>
  );
}
