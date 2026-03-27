"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  currentCount: number;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  pageSize: number;
  pageSizeOptions?: readonly number[];
  onPageSizeChange?: (size: number) => void;
  itemLabel?: string;
};

export function Pagination({
  currentCount,
  totalCount,
  hasNext,
  hasPrevious,
  onNext,
  onPrevious,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  itemLabel = "resultados",
}: PaginationProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-white/60">
        Mostrando <span className="text-white">{currentCount}</span> de{" "}
        <span className="text-white">{totalCount}</span> {itemLabel}
      </p>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="flex items-center gap-1 rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/70 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </button>
        {pageSizeOptions && onPageSizeChange ? (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm text-white/70 outline-none"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size} className="bg-[#050505]">
                {size} por página
              </option>
            ))}
          </select>
        ) : null}
        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext}
          className="flex items-center gap-1 rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/70 disabled:opacity-40"
        >
          Próximo
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
