"use client";

import type { FormEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Loader2, Plus } from "lucide-react";
import type { ServiceCategoryOption } from "@/src/features/services/types";
import { createServiceSchema, type CreateServiceFormValues } from "@/src/features/services/schemas";
import type { TokenRefreshService } from "@/src/features/shared/utils/auth";
import { servicesEndpointBase } from "@/src/features/services/services/endpoints";

type ProductUsageItem = {
  product: number;
  quantity_used: number;
  product_name?: string;
};

type CreateServiceScreenProps = {
  serviceCategories: ServiceCategoryOption[];
  accessToken: string | null;
  fetchWithAuth: TokenRefreshService["fetchWithAuth"];
  onSuccess: () => void;
  onCancel: () => void;
  onAddProduct: (onConfirm: (product: ProductUsageItem) => void) => void;
};

export function CreateServiceScreen({
  serviceCategories,
  accessToken,
  fetchWithAuth,
  onSuccess,
  onCancel,
  onAddProduct,
}: CreateServiceScreenProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateServiceFormValues>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      name: "",
      price: "",
      category: "",
      duration: "00:30:00",
      isActive: true,
      productUsage: [],
    },
  });

  const productUsageWatch = watch("productUsage") ?? [];

  const handleRemoveUsage = (index: number) => {
    const current = productUsageWatch;
    setValue(
      "productUsage",
      current.filter((_, i) => i !== index),
    );
  };

  const handleOpenProductPicker = () => {
    onAddProduct((item) => {
      setValue("productUsage", [...productUsageWatch, item]);
    });
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!accessToken) return;

    const payload = {
      name: values.name.trim(),
      price: values.price,
      category: Number(values.category),
      duration: values.duration,
      is_active: values.isActive,
      product_usage: (values.productUsage ?? []).map((item) => ({
        product: item.product,
        quantity_used: item.quantity_used,
      })),
    };

    const response = await fetchWithAuth(servicesEndpointBase, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      const detail = (data && (data.detail || data.message)) || "Não foi possível criar o serviço.";
      throw new Error(detail);
    }

    onSuccess();
  });

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center gap-3">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-white/40 hover:text-white"
          onClick={onCancel}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="text-sm text-white/60">Serviços</p>
          <p className="text-2xl font-semibold">Novo serviço</p>
          <p className="text-xs text-white/50">Cadastre um serviço para o catálogo</p>
        </div>
      </header>

      <section className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="text-sm text-white/70">
            Nome do serviço
            <input
              type="text"
              {...register("name")}
              className={`mt-1 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 ${
                errors.name ? "border-red-500/60" : "border-white/10"
              }`}
            />
            {errors.name ? (
              <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
            ) : null}
          </label>

          <label className="text-sm text-white/70">
            Preço
            <input
              type="text"
              inputMode="decimal"
              placeholder="120.00"
              {...register("price")}
              className={`mt-1 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 ${
                errors.price ? "border-red-500/60" : "border-white/10"
              }`}
            />
            {errors.price ? (
              <p className="mt-1 text-xs text-red-400">{errors.price.message}</p>
            ) : null}
          </label>

          <label className="text-sm text-white/70">
            Categoria
            <select
              {...register("category")}
              className={`mt-1 w-full rounded-2xl border bg-[#050505] px-4 py-3 text-sm outline-none focus:border-white/40 ${
                errors.category ? "border-red-500/60" : "border-white/10"
              }`}
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
            Duração (ex: 01:30:00)
            <input
              type="text"
              placeholder="01:30:00"
              {...register("duration")}
              className={`mt-1 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 ${
                errors.duration ? "border-red-500/60" : "border-white/10"
              }`}
            />
            {errors.duration ? (
              <p className="mt-1 text-xs text-red-400">{errors.duration.message}</p>
            ) : null}
          </label>

          <label className="flex items-center gap-3 text-sm text-white/70">
            <input
              type="checkbox"
              {...register("isActive")}
              className="h-4 w-4 rounded border border-white/20 bg-transparent text-black"
            />
            Serviço ativo
          </label>

          <fieldset className="space-y-3 rounded-2xl border border-white/10 p-4">
            <legend className="px-2 text-xs uppercase tracking-wide text-white/50">
              Produtos necessários
            </legend>
            <button
              type="button"
              onClick={handleOpenProductPicker}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/80"
            >
              <Plus className="h-4 w-4" />
              Adicionar produto
            </button>

            {productUsageWatch.length === 0 ? (
              <p className="text-xs text-white/50">Nenhum produto adicionado.</p>
            ) : (
              <ul className="space-y-2 text-sm text-white/80">
                {productUsageWatch.map((item, index) => (
                  <li
                    key={`${item.product}-${index}`}
                    className="flex items-center justify-between rounded-2xl border border-white/10 px-3 py-2"
                  >
                    <div>
                      <p className="font-semibold">
                        {item.product_name ?? `Produto #${item.product}`}
                      </p>
                      <p className="text-xs text-white/60">Quantidade: {item.quantity_used}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveUsage(index)}
                      className="text-xs text-red-300"
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </fieldset>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-2 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Criar serviço"
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
