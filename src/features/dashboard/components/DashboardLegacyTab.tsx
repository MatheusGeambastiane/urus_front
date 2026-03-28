"use client";

import { ProductsLegacyTab } from "@/src/features/dashboard/components/ProductsLegacyTab";

type DashboardLegacyTabProps = {
  firstName: string;
  activeTab: "products";
};

export function DashboardLegacyTab({ firstName }: DashboardLegacyTabProps) {
  return <ProductsLegacyTab firstName={firstName} activeTab="products" />;
}
