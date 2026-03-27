"use client";

import { TrendingUp, Zap } from "lucide-react";

type HighlightCard = {
  title: string;
  label: string;
  value: string;
  accent?: "light" | "muted";
};

type HighlightsRowProps = {
  loading: boolean;
  error: string | null;
  cards: HighlightCard[];
};

export function HighlightsRow({ loading, error, cards }: HighlightsRowProps) {
  if (loading) {
    return (
      <section className="grid grid-cols-2 gap-3">
        {Array.from({ length: cards.length || 2 }).map((_, index) => (
          <div
            key={`highlight-loading-${index}`}
            className="rounded-[26px] border border-white/8 bg-[#090909] p-5"
          >
            <div className="h-4 w-24 rounded bg-white/10" />
            <div className="mt-4 h-8 w-20 rounded bg-white/10" />
            <div className="mt-3 h-3 w-28 rounded bg-white/10" />
          </div>
        ))}
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-[26px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
        {error}
      </section>
    );
  }

  return (
    <section className={`grid gap-3 ${cards.length > 1 ? "grid-cols-2" : ""}`}>
      {cards.map((card, index) => {
        const Icon = index === 0 ? TrendingUp : Zap;
        return (
          <article
            key={`${card.title}-${card.label}`}
            className="rounded-[26px] border border-white/8 bg-[#090909] p-5 shadow-card"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/40">
                {card.title}
              </p>
              <Icon className="h-4 w-4 text-white/45" />
            </div>
            <p
              className={`mt-5 text-3xl font-semibold tracking-tight ${
                card.accent === "muted" ? "text-white" : "text-white"
              }`}
            >
              {card.value}
            </p>
            <p className="mt-2 text-sm text-white/55">{card.label}</p>
          </article>
        );
      })}
    </section>
  );
}
