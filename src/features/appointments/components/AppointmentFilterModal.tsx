"use client";

import { Modal } from "@/components/ui/Modal";
import type { ServiceCategoryOption, ServiceOption } from "@/src/features/services/types";

type AppointmentFilterModalProps = {
  open: boolean;
  professionalsList: ServiceOption[];
  professionalsError: string | null;
  serviceCategories: ServiceCategoryOption[];
  pendingProfessionalId: string;
  pendingCategoryId: string;
  pendingServiceId: string;
  pendingStartDate: string;
  pendingEndDate: string;
  onClose: () => void;
  onClear: () => void;
  onApply: () => void;
  onChangeProfessionalId: (value: string) => void;
  onChangeCategoryId: (value: string) => void;
  onChangeServiceId: (value: string) => void;
  onChangeStartDate: (value: string) => void;
  onChangeEndDate: (value: string) => void;
};

export function AppointmentFilterModal({
  open,
  professionalsList,
  professionalsError,
  serviceCategories,
  pendingProfessionalId,
  pendingCategoryId,
  pendingServiceId,
  pendingStartDate,
  pendingEndDate,
  onClose,
  onClear,
  onApply,
  onChangeProfessionalId,
  onChangeCategoryId,
  onChangeServiceId,
  onChangeStartDate,
  onChangeEndDate,
}: AppointmentFilterModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Filtrar agendamentos" subtitle="Filtros">
      <div className="space-y-3 text-sm text-white/80">
        <label className="block text-white/70">
          Profissional
          <select
            value={pendingProfessionalId}
            onChange={(event) => onChangeProfessionalId(event.target.value)}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-[#050505] px-4 py-3 text-sm outline-none focus:border-white/40"
          >
            <option value="">Todos</option>
            {professionalsList.map((professional) => (
              <option key={professional.id} value={professional.id}>
                {professional.name}
              </option>
            ))}
          </select>
          {professionalsError ? <p className="mt-1 text-xs text-red-300">{professionalsError}</p> : null}
        </label>
        <label className="block text-white/70">
          Categoria
          <select
            value={pendingCategoryId}
            onChange={(event) => onChangeCategoryId(event.target.value)}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-[#050505] px-4 py-3 text-sm outline-none focus:border-white/40"
          >
            <option value="">Todas</option>
            {serviceCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-white/70">
          Serviço (ID)
          <input
            type="text"
            value={pendingServiceId}
            onChange={(event) => onChangeServiceId(event.target.value)}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
          />
        </label>
        <label className="block text-white/70">
          Data inicial
          <input
            type="date"
            value={pendingStartDate}
            onChange={(event) => onChangeStartDate(event.target.value)}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
          />
        </label>
        <label className="block text-white/70">
          Data final
          <input
            type="date"
            value={pendingEndDate}
            onChange={(event) => onChangeEndDate(event.target.value)}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onClear}
          className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80"
        >
          Limpar
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onApply}
            className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black"
          >
            Aplicar
          </button>
        </div>
      </div>
    </Modal>
  );
}
