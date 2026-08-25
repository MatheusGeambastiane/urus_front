"use client";

import type { ComponentType } from "react";
import { Plus } from "lucide-react";

type FabOption = {
  label: string;
  icon: ComponentType<{ className?: string }>;
  onClick: () => void;
};

type FabMenuProps = {
  open: boolean;
  onToggle: () => void;
  options: FabOption[];
  variant?: "default" | "luxury";
};

export function FabMenu({ open, onToggle, options, variant = "default" }: FabMenuProps) {
  const isLuxury = variant === "luxury";

  return (
    <div className="fixed bottom-24 right-6 z-40 flex flex-col items-end gap-3">
      {open
        ? options.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={opt.onClick}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold shadow-lg ${
                  isLuxury ? "border border-[#c6a56b]/35 bg-[#c6a56b] text-[#090806]" : "bg-white text-black"
                }`}
              >
                <Icon className="h-4 w-4" />
                {opt.label}
              </button>
            );
          })
        : null}
      <button
        type="button"
        onClick={onToggle}
        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition duration-200 focus-visible:outline-none focus-visible:ring-2 ${
          isLuxury
            ? "border border-[#c6a56b]/45 bg-[#c6a56b] text-[#090806] shadow-[0_15px_35px_rgba(0,0,0,0.4)] hover:scale-105 focus-visible:ring-[#c6a56b]/60"
            : "bg-white text-black focus-visible:ring-white/50"
        }`}
        aria-label={open ? "Fechar opções" : "Abrir opções"}
      >
        <Plus
          className={`h-6 w-6 transition-transform duration-200 ${open ? "rotate-45" : ""}`}
        />
      </button>
    </div>
  );
}
