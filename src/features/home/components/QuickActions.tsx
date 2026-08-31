"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
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
        <h2 className="text-sm font-medium tracking-tight text-white/55 lg:text-[#e5e7eb]/75">Ações Rápidas</h2>
        <span className="text-[11px] uppercase tracking-[0.18em] text-white/30 lg:text-white/25">Fluxo</span>
      </div>

      <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1 lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-5 lg:overflow-visible lg:px-0 2xl:grid-cols-4">
        {actions.map((action) => (
          <button
            key={action.key}
            type="button"
            onClick={() => onAction(action.key)}
            className={`group relative min-h-[164px] min-w-[82%] shrink-0 overflow-hidden rounded-[26px] border p-5 text-left transition-transform active:scale-[0.98] sm:min-w-[280px] lg:col-span-1 lg:min-h-[176px] lg:min-w-0 lg:rounded-[20px] lg:duration-300 lg:hover:-translate-y-1 lg:hover:shadow-[0_24px_50px_rgba(0,0,0,0.32)] ${action.className}`}
          >
            <div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-white/10 to-transparent opacity-60" />
            <span className="absolute right-4 top-4 hidden h-8 w-8 items-center justify-center rounded-full border border-current/15 opacity-55 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 lg:flex">
              <ArrowUpRight className="h-4 w-4" />
            </span>
            <div className="relative flex min-h-[144px] items-start gap-4 lg:min-h-[134px] 2xl:min-h-[144px]">
              <div className="relative mt-1 h-20 w-20 shrink-0 lg:h-16 lg:w-16 2xl:h-[4.5rem] 2xl:w-[4.5rem]">
                <Image
                  src={action.image}
                  alt={action.title}
                  fill
                  sizes="80px"
                  className={`object-contain transition-transform duration-300 group-hover:scale-105 ${action.imageClassName ?? ""}`}
                />
              </div>

              <div className="min-w-0 lg:flex-1">
                <p className="text-sm font-medium uppercase tracking-[0.18em] opacity-60">
                  Atalho
                </p>
                <p className="home-display mt-3 text-xl font-semibold tracking-tight lg:pr-7 lg:text-2xl lg:leading-none 2xl:text-[1.7rem]">{action.title}</p>
                <p className="mt-2 max-w-[180px] text-sm opacity-75 lg:max-w-none lg:leading-relaxed">{action.subtitle}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
