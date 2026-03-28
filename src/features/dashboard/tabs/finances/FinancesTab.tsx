"use client";

import { FinancesPage } from "@/src/features/finances/pages/FinancesPage";

type Props = { firstName: string };

export function FinancesTab({ firstName }: Props) {
  return <FinancesPage firstName={firstName} />;
}
