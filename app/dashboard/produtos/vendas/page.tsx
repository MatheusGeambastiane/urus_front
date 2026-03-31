import { ProductsLegacyTab } from "@/src/features/dashboard/components/ProductsLegacyTab";
import { getDashboardSession } from "@/lib/get-dashboard-session";

const getDashboardFirstName = (user: {
  firstName?: string | null;
  name?: string | null;
} | undefined) => {
  return user?.firstName || user?.name?.split(" ").at(0) || "Usuário";
};

export default async function ProductSalesRoute() {
  const session = await getDashboardSession();

  return (
    <ProductsLegacyTab
      firstName={getDashboardFirstName(session.user)}
      activeTab="products"
      initialSalesView
    />
  );
}
