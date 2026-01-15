import type { ReactNode } from "react";

import { DashboardBottomNavigation } from "@/features/dashboard/components/dashboard-bottom-navigation";
import { DashboardProvider } from "@/features/dashboard/providers/dashboard-provider";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardProvider>
      <div className="relative min-h-screen bg-[#050505] text-white">
        <main className="mx-auto w-full max-w-[430px] px-5 pb-40 pt-10">{children}</main>
        <DashboardBottomNavigation />
      </div>
    </DashboardProvider>
  );
}
