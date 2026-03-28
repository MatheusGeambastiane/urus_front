"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Loader2, PenSquare, Plus, Trash2 } from "lucide-react";
import type { ServiceCategoryOption } from "@/src/features/services/types";
import type { useServiceDetail } from "@/src/features/services/hooks/useServiceDetail";
import { createServiceSchema, type CreateServiceFormValues } from "@/src/features/services/schemas";
import { FeedbackBanner } from "@/components/ui/FeedbackBanner";

type ServiceDetailScreenProps = {
  detail: ReturnType<typeof useServiceDetail>;
  serviceCategories: ServiceCategoryOption[];
  onBack: () => void;
  onAddProduct: () => void;
};

export function ServiceDetailScreen({
  detail,
  serviceCategories,
  onBack,
  onAddProduct,
}: ServiceDetailScreenProps) {
  const {
    serviceDetail,
    serviceDetailLoading,
    serviceDetailError,
    canEditService,
    isUpdatingService,
    productUsageDeletingId,
    toggleEdit,
    updateService,
    deleteProductUsage,
  } = detail;

  const [feedback, setFeedbackRaw] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const setFeedback = (value: { type: "success" | "error"; message: string } | null) => {
    setFeedbackRaw(value);
    if (value) setTimeout(() => setFeedbackRaw(null), 4000);
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateServiceFormValues>({
    resolver: zodResolver(createServiceSchema),
  });

  useEffect(() => {
    if (serviceDetail) {
      reset({
        name: serviceDetail.name,
        price: serviceDetail.price,
        category: String(serviceDetail.category),
        duration: serviceDetail.duration,
        isActive: serviceDetail.is_active,
        productUsage: [],
      });
    }
  }, [serviceDetail, reset]);

  const handleSave = handleSubmit(async (values) => {
    const result = await updateService(values);
    if (result.success) {
      setFeedback({ type: "success", message: "Serviço atualizado com sucesso." });
    } else {
      setFeedback({ type: "error", message: result.error ?? "Erro ao salvar." });
    }
  });

  const handleDeleteUsage = async (usageId: number) => {
    const result = await deleteProductUsage(usageId);
    if (result.success) {
      setFeedback({ type: "success", message: "Produto removido." });
    } else {
      setFeedback({ type: "error", message: result.error ?? "Erro ao remover." });
    }
  };

  if (serviceDetailLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-white/70">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="mt-3 text-sm">Carregando serviço...</p>
      </div>
    );
  }

  if (serviceDetailError) {
    return (
      <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
        {serviceDetailError}
      </div>
    );
  }

  if (!serviceDetail) return null;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center justify-between">
        <button
          type="button"
          className="mr-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-white/40 hover:text-white"
          onClick={onBack}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 text-center">
          <p className="text-sm text-white/60">Serviços</p>
          <p className="text-2xl font-semibold">{serviceDetail.name}</p>
        </div>
      </header>

      {feedback ? <FeedbackBanner message={feedback.message} type={feedback.type} /> : null}

      <section className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">Informações do serviço</p>
            <p className="text-xs text-white/60">
              {canEditService ? "Modo de edição habilitado" : "Somente leitura"}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleEdit}
            className="rounded-2xl border border-white/10 p-2 text-white/80"
          >
            <PenSquare className="h-4 w-4" />
          </button>
        </div>

        <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
          <label className="text-sm text-white/70">
            Nome
            <input
              type="text"
              {...register("name")}
              disabled={!canEditService}
              className={`mt-1 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 ${
                errors.name ? "border-red-500/60" : "border-white/10"
              } ${!canEditService ? "opacity-60" : ""}`}
            />
            {errors.name ? <p className="mt-1 text-xs text-red-400">{errors.name.message}</p> : null}
          </label>

          <label className="text-sm text-white/70">
            Preço
            <input
              type="text"
              {...register("price")}
              disabled={!canEditService}
              className={`mt-1 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 ${
                errors.price ? "border-red-500/60" : "border-white/10"
              } ${!canEditService ? "opacity-60" : ""}`}
            />
            {errors.price ? <p className="mt-1 text-xs text-red-400">{errors.price.message}</p> : null}
          </label>

          <label className="text-sm text-white/70">
            Categoria
            <select
              {...register("category")}
              disabled={!canEditService}
              className={`mt-1 w-full rounded-2xl border bg-[#050505] px-4 py-3 text-sm outline-none focus:border-white/40 ${
                errors.category ? "border-red-500/60" : "border-white/10"
              } ${!canEditService ? "opacity-60" : ""}`}
            >
              <option value="" disabled>
                Selecione
              </option>
              {serviceCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category ? (
              <p className="mt-1 text-xs text-red-400">{errors.category.message}</p>
            ) : null}
          </label>

          <label className="text-sm text-white/70">
            Duração
            <input
              type="text"
              {...register("duration")}
              disabled={!canEditService}
              className={`mt-1 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 ${
                errors.duration ? "border-red-500/60" : "border-white/10"
              } ${!canEditService ? "opacity-60" : ""}`}
            />
            {errors.duration ? (
              <p className="mt-1 text-xs text-red-400">{errors.duration.message}</p>
            ) : null}
          </label>

          <label className="flex items-center gap-3 text-sm text-white/70">
            <input
              type="checkbox"
              {...register("isActive")}
              disabled={!canEditService}
              className="h-4 w-4 rounded border border-white/20 bg-transparent text-black"
            />
            Serviço ativo
          </label>
        </form>

        {canEditService ? (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={isUpdatingService}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isUpdatingService ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar serviço"
              )}
            </button>
          </div>
        ) : null}
      </section>

      <section className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">Produtos utilizados</p>
            <p className="text-xs text-white/60">
              Controle os insumos necessários para o serviço.
            </p>
          </div>
          {canEditService ? (
            <button
              type="button"
              onClick={onAddProduct}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/80"
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </button>
          ) : null}
        </div>

        {serviceDetail.product_usages.length === 0 ? (
          <p className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/60">
            Nenhum produto associado.
          </p>
        ) : (
          <ul className="space-y-3">
            {serviceDetail.product_usages.map((usage) => (
              <li
                key={usage.id}
                className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold">{usage.product_name}</p>
                  <p className="text-xs text-white/60">Quantidade: {usage.quantity_used}</p>
                </div>
                {canEditService ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteUsage(usage.id)}
                    disabled={productUsageDeletingId === usage.id}
                    className="text-red-300 disabled:opacity-50"
                  >
                    {productUsageDeletingId === usage.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
