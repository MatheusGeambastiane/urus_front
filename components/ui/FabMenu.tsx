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
};

export function FabMenu({ open, onToggle, options }: FabMenuProps) {
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
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black shadow-lg"
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
        className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-xl transition-transform duration-200"
        aria-label={open ? "Fechar opções" : "Abrir opções"}
      >
        <Plus
          className={`h-6 w-6 transition-transform duration-200 ${open ? "rotate-45" : ""}`}
        />
      </button>
    </div>
  );
}
