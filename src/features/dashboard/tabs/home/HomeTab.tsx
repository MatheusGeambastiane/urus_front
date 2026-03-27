"use client";

import { HomePage } from "@/src/features/home/pages/HomePage";

type Props = { firstName: string };

export function HomeTab({ firstName }: Props) {
  return <HomePage firstName={firstName} />;
}
