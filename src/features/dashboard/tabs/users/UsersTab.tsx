"use client";

import { DashboardLegacyTab } from "@/src/features/dashboard/components/DashboardLegacyTab";

type Props = { firstName: string };

export function UsersTab({ firstName }: Props) {
  return <DashboardLegacyTab firstName={firstName} activeTab="users" />;
}
