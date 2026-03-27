"use client";

import type { FormEvent } from "react";
import { Loader2, Plus, Search, X } from "lucide-react";
import type { ServiceCategoryOption, ServiceItem } from "@/src/features/services/types";
import { ServiceCard } from "./ServiceCard";

type ServiceListProps = {
  servicesList: ServiceItem[];
  servicesCount: number;
  servicesNextPage: string | null;
  servicesPreviousPage: string | null;
  servicesPageSize: number;
  servicesLoadingList: boolean;
  servicesFetchError: string | null;
  servicesSearchInput: string;
  servicesSearchTerm: string;
  selectedServiceCategory: number | null;
  serviceCategories: ServiceCategoryOption[];
  serviceCategoriesError: string | null;
  pageSizeOptions: readonly number[];
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: (e: FormEvent) => void;
  onClearSearch: () => void;
  onCategorySelect: (id: number | null) => void;
  onPageSizeChange: (size: number) => void;
  onPagination: (direction: "next" | "previous") => void;
  onServiceClick: (id: number) => void;
  onStartCreateService: () => void;
  onStartCreateCategory: () => void;
  showFabOptions: boolean;
  onToggleFab: () => void;
};

export function ServiceList({
  servicesList,
  servicesCount,
  servicesNextPage,
  servicesPreviousPage,
  servicesPageSize,
  servicesLoadingList,
  servicesFetchError,
  servicesSearchInput,
  servicesSearchTerm,
  selectedServiceCategory,
  serviceCategories,
  serviceCategoriesError,
  pageSizeOptions,
  onSearchInputChange,
  onSearchSubmit,
  onClearSearch,
  onCategorySelect,
  onPageSizeChange,
  onPagination,
  onServiceClick,
  onStartCreateService,
  onStartCreateCategory,
  showFabOptions,
  onToggleFab,
}: ServiceListProps) {
  return (
    <div className="flex flex-col gap-5">
      <form
        onSubmit={(e) => { e.preventDefault(); onSearchSubmit(e); }}
        className="relative"
        role="search"
      >
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          value={servicesSearchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
          placeholder="Buscar serviço, duração..."
          className="h-12 w-full rounded-2xl border border-white/10 bg-transparent pl-11 pr-24 text-sm outline-none transition focus:border-white/40"
        />
        {servicesSearchTerm ? (
          <button
            type="button"
            onClick={onClearSearch}
            className="absolute right-20 top-1/2 -translate-y-1/2 text-xs text-white/60"
          >
            Limpar
          </button>
        ) : null}
        <button
          type="submit"
          className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center rounded-2xl bg-white px-3 py-1 text-sm font-semibold text-black"
        >
          Buscar
        </button>
      </form>

      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
        <button
          type="button"
          onClick={() => onCategorySelect(null)}
          className={`rounded-full px-5 py-2 text-sm font-medium ${
            selectedServiceCategory === null ? "bg-white text-black" : "bg-white/10 text-white/70"
          }`}
        >
          Todos
        </button>
        {serviceCategories.map((category) => (
          <button
            type="button"
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium ${
              selectedServiceCategory === category.id
                ? "bg-white text-black"
                : "bg-white/10 text-white/70"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-white/60">
        <span>
          Exibindo {servicesList.length} de {servicesCount}
        </span>
        <label className="flex items-center gap-2 rounded-2xl border border-white/10 px-3 py-2 text-xs text-white/70">
          Itens por página
          <select
            value={servicesPageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-transparent text-sm text-white focus:outline-none"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      {serviceCategoriesError ? (
        <p className="text-xs text-red-300">{serviceCategoriesError}</p>
      ) : null}

      <section className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Todos os serviços</h3>
          <span className="text-xs text-white/60">{servicesCount} itens</span>
        </div>

        {servicesFetchError ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {servicesFetchError}
          </div>
        ) : null}

        {servicesLoadingList ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-white/70" />
          </div>
        ) : servicesList.length === 0 ? (
          <p className="rounded-2xl border border-white/10 px-4 py-6 text-center text-sm text-white/60">
            Nenhum serviço encontrado.
          </p>
        ) : (
          <div className="space-y-3">
            {servicesList.map((service) => (
              <ServiceCard key={service.id} service={service} onClick={onServiceClick} />
            ))}
          </div>
        )}
      </section>

      <div className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/70">
        <button
          type="button"
          onClick={() => onPagination("previous")}
          disabled={!servicesPreviousPage || servicesLoadingList}
          className="rounded-2xl border border-white/10 px-4 py-2 text-xs font-semibold text-white/80 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Página anterior
        </button>
        <span>
          {servicesPreviousPage ? "•" : ""} {servicesNextPage ? "•" : ""}
        </span>
        <button
          type="button"
          onClick={() => onPagination("next")}
          disabled={!servicesNextPage || servicesLoadingList}
          className="rounded-2xl border border-white/10 px-4 py-2 text-xs font-semibold text-white/80 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Próxima página
        </button>
      </div>

      {/* FAB */}
      <div className="fixed bottom-24 right-6 z-40 flex flex-col items-end gap-3">
        {showFabOptions ? (
          <>
            <button
              type="button"
              onClick={onStartCreateService}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black shadow-lg"
            >
              <Plus className="h-4 w-4" />
              Adicionar serviço
            </button>
            <button
              type="button"
              onClick={onStartCreateCategory}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black shadow-lg"
            >
              <Plus className="h-4 w-4" />
              Adicionar categoria
            </button>
          </>
        ) : null}
        <button
          type="button"
          onClick={onToggleFab}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-xl"
          aria-label={showFabOptions ? "Fechar opções" : "Abrir opções"}
        >
          <X
            className={`h-6 w-6 transition-transform duration-200 ${showFabOptions ? "" : "rotate-45"}`}
          />
        </button>
      </div>
    </div>
  );
}
