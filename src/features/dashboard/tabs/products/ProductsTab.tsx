"use client";

import { ProductsLegacyTab } from "@/src/features/dashboard/components/ProductsLegacyTab";

type Props = { firstName: string };

export function ProductsTab({ firstName }: Props) {
  return <ProductsLegacyTab firstName={firstName} activeTab="products" />;
}
