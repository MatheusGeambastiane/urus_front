"use client";

import { useState } from "react";
import { DashboardShell } from "@/src/features/dashboard/components/DashboardShell";
import { useAuth } from "@/src/features/shared/hooks/useAuth";
import { useServices } from "@/src/features/services/hooks/useServices";
import { useServiceDetail } from "@/src/features/services/hooks/useServiceDetail";
import { ServiceList } from "@/src/features/services/components/ServiceList";
import { ServiceDetailScreen } from "@/src/features/services/components/ServiceDetailScreen";
import { CreateServiceScreen } from "@/src/features/services/components/CreateServiceScreen";
import { CreateServiceCategoryScreen } from "@/src/features/services/components/CreateServiceCategoryScreen";
import { ProductPickerModal } from "@/src/features/services/components/ProductPickerModal";
import { FeedbackBanner } from "@/components/ui/FeedbackBanner";

type Props = { firstName: string };

type Screen = "list" | "detail" | "create" | "create-category";

type ProductUsageItem = {
  product: number;
  quantity_used: number;
  product_name?: string;
};

export function ServicesTab({ firstName }: Props) {
  void firstName;
  const { accessToken, fetchWithAuth, userRole } = useAuth();

  const [screen, setScreen] = useState<Screen>("list");
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [showFabOptions, setShowFabOptions] = useState(false);
  const [feedback, setFeedbackRaw] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [productPickerCallback, setProductPickerCallback] = useState<
    ((item: ProductUsageItem) => void) | null
  >(null);

  const setFeedback = (value: { type: "success" | "error"; message: string } | null) => {
    setFeedbackRaw(value);
    if (value) setTimeout(() => setFeedbackRaw(null), 4000);
  };

  const services = useServices({ accessToken, fetchWithAuth });

  const serviceDetail = useServiceDetail({
    serviceId: selectedServiceId,
    accessToken,
    fetchWithAuth,
    serviceCategories: services.serviceCategories,
  });

  const handleOpenServiceDetail = (id: number) => {
    setSelectedServiceId(id);
    setScreen("detail");
  };

  const handleBackToList = () => {
    setSelectedServiceId(null);
    setScreen("list");
    setProductPickerOpen(false);
  };

  const handleStartCreate = () => {
    setScreen("create");
    setShowFabOptions(false);
  };

  const handleStartCreateCategory = () => {
    setScreen("create-category");
    setShowFabOptions(false);
  };

  const handleServiceCreated = () => {
    setScreen("list");
    services.refreshServicesList();
    setFeedback({ type: "success", message: "Serviço criado com sucesso." });
  };

  const handleCategoryCreated = () => {
    setScreen("list");
    setFeedback({ type: "success", message: "Categoria criada com sucesso." });
  };

  const handleOpenProductPicker = (callback: (item: ProductUsageItem) => void) => {
    setProductPickerCallback(() => callback);
    setProductPickerOpen(true);
  };

  const handleProductPickerConfirm = (item: ProductUsageItem) => {
    productPickerCallback?.(item);
    setProductPickerOpen(false);
    setProductPickerCallback(null);
  };

  const renderContent = () => {
    if (screen === "detail") {
      return (
        <ServiceDetailScreen
          detail={serviceDetail}
          serviceCategories={services.serviceCategories}
          onBack={handleBackToList}
          onAddProduct={() =>
            handleOpenProductPicker((item) => {
              if (serviceDetail.serviceDetail && accessToken) {
                serviceDetail.addProductUsage(
                  item.product,
                  item.quantity_used,
                  item.product_name ?? "",
                );
              }
            })
          }
        />
      );
    }

    if (screen === "create") {
      return (
        <CreateServiceScreen
          serviceCategories={services.serviceCategories}
          accessToken={accessToken}
          fetchWithAuth={fetchWithAuth}
          onSuccess={handleServiceCreated}
          onCancel={() => setScreen("list")}
          onAddProduct={handleOpenProductPicker}
        />
      );
    }

    if (screen === "create-category") {
      return (
        <CreateServiceCategoryScreen
          onCancel={() => setScreen("list")}
          createServiceCategory={services.createServiceCategory}
          onSuccess={handleCategoryCreated}
        />
      );
    }

    // Default: list
    return (
      <div className="flex flex-col gap-5">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60">Serviços</p>
            <p className="text-2xl font-semibold">Gerencie seu catálogo</p>
          </div>
        </header>

        {feedback ? <FeedbackBanner message={feedback.message} type={feedback.type} /> : null}

        <ServiceList
          {...services}
          onServiceClick={handleOpenServiceDetail}
          onStartCreateService={handleStartCreate}
          onStartCreateCategory={handleStartCreateCategory}
          showFabOptions={showFabOptions}
          onToggleFab={() => setShowFabOptions((prev) => !prev)}
          onSearchSubmit={(e) => {
            e.preventDefault();
            services.handleServiceSearchSubmit();
          }}
          onSearchInputChange={services.setServicesSearchInput}
          onClearSearch={services.handleClearSearch}
          onCategorySelect={services.handleServiceCategorySelect}
          onPageSizeChange={services.handleServicesPageSizeChange}
          onPagination={services.handleServicesPagination}
          pageSizeOptions={services.PAGE_SIZE_OPTIONS}
        />
      </div>
    );
  };

  return (
    <DashboardShell activeTab="services" userRole={userRole}>
      {renderContent()}

      <ProductPickerModal
        open={productPickerOpen}
        accessToken={accessToken}
        fetchWithAuth={fetchWithAuth}
        onClose={() => {
          setProductPickerOpen(false);
          setProductPickerCallback(null);
        }}
        onConfirm={handleProductPickerConfirm}
      />
    </DashboardShell>
  );
}
