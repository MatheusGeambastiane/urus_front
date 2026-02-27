"use client";

import { DashboardLegacyTab } from "@/src/features/dashboard/components/DashboardLegacyTab";

type Props = { firstName: string };

export function HomeTab({ firstName }: Props) {
  return <DashboardLegacyTab firstName={firstName} activeTab="home" />;
}
