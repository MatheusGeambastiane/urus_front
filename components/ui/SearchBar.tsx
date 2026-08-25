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
  variant?: "default" | "luxury";
};

export function SearchBar({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = "Buscar...",
  submitLabel = "Buscar",
  variant = "default",
}: SearchBarProps) {
  const isLuxury = variant === "luxury";

  return (
    <form onSubmit={onSubmit} className="flex min-w-0 gap-2">
      <div className="relative flex-1">
        <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${isLuxury ? "text-[#c6a56b]/55" : "text-white/40"}`} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-2xl border py-3 pl-9 pr-9 text-sm outline-none transition ${
            isLuxury
              ? "border-[#c6a56b]/15 bg-black/30 placeholder:text-white/30 focus:border-[#c6a56b]/45 focus:ring-2 focus:ring-[#c6a56b]/10 lg:rounded-[14px]"
              : "border-white/10 bg-transparent focus:border-white/40"
          }`}
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
        className={`rounded-2xl px-4 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 ${
          isLuxury
            ? "bg-[#c6a56b] text-[#090806] shadow-[0_9px_24px_rgba(198,165,107,0.14)] hover:bg-[#d1b477] focus-visible:ring-[#c6a56b]/55 lg:rounded-[14px]"
            : "bg-white text-black focus-visible:ring-white/50"
        }`}
      >
        {submitLabel}
      </button>
    </form>
  );
}
