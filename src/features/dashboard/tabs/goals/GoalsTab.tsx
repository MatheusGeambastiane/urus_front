"use client";

import { GoalsPage } from "@/src/features/goals/pages/GoalsPage";

type Props = { firstName: string };

export function GoalsTab({ firstName }: Props) {
  void firstName;
  return <GoalsPage />;
}
