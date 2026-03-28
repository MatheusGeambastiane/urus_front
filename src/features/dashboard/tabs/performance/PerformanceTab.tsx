"use client";

import { PerformancePage } from "@/src/features/finances/pages/PerformancePage";

type Props = { firstName: string };

export function PerformanceTab({ firstName }: Props) {
  return <PerformancePage firstName={firstName} />;
}
