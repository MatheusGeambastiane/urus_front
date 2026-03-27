"use client";

import Image from "next/image";
import type { QuickActionKey } from "@/src/features/home/types";

type QuickAction = {
  key: QuickActionKey;
  title: string;
  subtitle: string;
  image: string;
  className: string;
  imageClassName?: string;
};

type QuickActionsProps = {
  actions: QuickAction[];
  onAction: (action: QuickActionKey) => void;
};

export function QuickActions({ actions, onAction }: QuickActionsProps) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between px-1">
        <h2 className="text-sm font-medium tracking-tight text-white/55">Ações Rápidas</h2>
        <span className="text-[11px] uppercase tracking-[0.18em] text-white/30">Fluxo</span>
      </div>

      <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
        {actions.map((action) => (
          <button
            key={action.key}
            type="button"
            onClick={() => onAction(action.key)}
            className={`group relative min-h-[164px] min-w-[82%] shrink-0 overflow-hidden rounded-[26px] border p-5 text-left transition-transform active:scale-[0.98] sm:min-w-[280px] ${action.className}`}
          >
            <div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-white/10 to-transparent opacity-60" />
            <div className="relative flex min-h-[144px] items-start gap-4">
              <div className="relative mt-1 h-20 w-20 shrink-0">
                <Image
                  src={action.image}
                  alt={action.title}
                  fill
                  sizes="80px"
                  className={`object-contain transition-transform duration-300 group-hover:scale-105 ${action.imageClassName ?? ""}`}
                />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium uppercase tracking-[0.18em] opacity-60">
                  Atalho
                </p>
                <p className="mt-3 text-xl font-semibold tracking-tight">{action.title}</p>
                <p className="mt-2 max-w-[180px] text-sm opacity-75">{action.subtitle}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
