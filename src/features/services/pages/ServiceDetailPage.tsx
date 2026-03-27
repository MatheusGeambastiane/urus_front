"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { DashboardShell } from "@/src/features/dashboard/components/DashboardShell";
import { useAuth } from "@/src/features/shared/hooks/useAuth";
import { useServiceDetail } from "@/src/features/services/hooks/useServiceDetail";
import { useServices } from "@/src/features/services/hooks/useServices";
import { ServiceDetailScreen } from "@/src/features/services/components/ServiceDetailScreen";
import { ProductPickerModal } from "@/src/features/services/components/ProductPickerModal";
import { useRouter } from "next/navigation";

type ProductUsageItem = {
  product: number;
  quantity_used: number;
  product_name?: string;
};

export function ServiceDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { accessToken, fetchWithAuth, profilePic, userRole } = useAuth();
  const [productPickerOpen, setProductPickerOpen] = useState(false);

  const { serviceCategories } = useServices({ accessToken, fetchWithAuth });

  const detail = useServiceDetail({
    serviceId: Number(id),
    accessToken,
    fetchWithAuth,
    serviceCategories,
  });

  const handleBack = () => router.push("/dashboard/servicos");
  const handleLogout = async () => signOut({ callbackUrl: "/dashboard/login" });

  const handleAddProduct = () => setProductPickerOpen(true);

  const handleProductConfirm = async (item: ProductUsageItem) => {
    await detail.addProductUsage(item.product, item.quantity_used, item.product_name ?? "");
    setProductPickerOpen(false);
  };

  return (
    <DashboardShell activeTab="services" userRole={userRole}>
      <ServiceDetailScreen
        detail={detail}
        serviceCategories={serviceCategories}
        profilePic={profilePic}
        onLogout={handleLogout}
        onBack={handleBack}
        onAddProduct={handleAddProduct}
      />
      <ProductPickerModal
        open={productPickerOpen}
        accessToken={accessToken}
        fetchWithAuth={fetchWithAuth}
        onClose={() => setProductPickerOpen(false)}
        onConfirm={handleProductConfirm}
      />
    </DashboardShell>
  );
}
