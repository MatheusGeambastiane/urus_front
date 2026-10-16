import { ProductSalesDashboardPage } from "@/src/features/products/pages/ProductSalesDashboardPage";
import { getDashboardSession } from "@/lib/get-dashboard-session";

export default async function ProductSalesDashboardRoute() {
  await getDashboardSession();
  return <ProductSalesDashboardPage />;
}
