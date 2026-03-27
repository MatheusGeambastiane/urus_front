"use client";

import type { FormEvent } from "react";
import { Search, X } from "lucide-react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onClear: () => void;
  placeholder?: string;
  submitLabel?: string;
};

export function SearchBar({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = "Buscar...",
  submitLabel = "Buscar",
}: SearchBarProps) {
  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-transparent py-3 pl-9 pr-9 text-sm outline-none focus:border-white/40"
          placeholder={placeholder}
        />
        {value ? (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
            aria-label="Limpar busca"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      <button
        type="submit"
        className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-black"
      >
        {submitLabel}
      </button>
    </form>
  );
}
