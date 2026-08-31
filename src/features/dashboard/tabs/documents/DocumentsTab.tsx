"use client";

import { DocumentsPage } from "@/src/features/documents/pages/DocumentsPage";

type Props = { firstName: string };

export function DocumentsTab({ firstName }: Props) {
  void firstName;
  return <DocumentsPage />;
}
