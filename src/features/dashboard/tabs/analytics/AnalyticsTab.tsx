"use client";

import { AccessAnalyticsPage } from "@/src/features/analytics/pages/AccessAnalyticsPage";

type Props = { firstName: string };

export function AnalyticsTab({ firstName }: Props) {
  void firstName;
  return <AccessAnalyticsPage />;
}
