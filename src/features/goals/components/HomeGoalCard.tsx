"use client";

import { ArrowRight, CheckCircle2, Target, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

import type { HomeGoalProgress } from "@/src/features/goals/types";
import { formatCurrency } from "@/src/features/shared/utils/money";


const money = (value: string) => formatCurrency(value);

function Rhythm({ label, actual, required, onTrack }: { label: string; actual: string; required: string; onTrack: boolean }) {
  const ratio = Number(required) > 0 ? Math.min(100, (Number(actual) / Number(required)) * 100) : 100;
  return (
    <div className="min-w-0 flex-1 rounded-[18px] border border-white/[0.07] bg-black/15 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/36">{label}</p>
        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${onTrack ? "text-emerald-300" : "text-amber-200"}`}>
          {onTrack ? <CheckCircle2 className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
          {onTrack ? "No ritmo" : "Atenção"}
        </span>
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <strong className="text-lg tracking-tight text-white">{money(actual)}</strong>
        <span className="text-[10px] text-white/32">de {money(required)}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.055]">
        <div className={`h-full rounded-full ${onTrack ? "bg-emerald-400" : "bg-[#d8b873]"}`} style={{ width: `${ratio}%` }} />
      </div>
    </div>
  );
}

export function HomeGoalCard({
  goal,
  periodLabel = "Semana até hoje",
}: {
  goal: HomeGoalProgress;
  periodLabel?: string;
}) {
  const router = useRouter();
  return (
    <section className="lg:col-span-12">
      <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(145deg,rgba(216,184,115,0.055),rgba(255,255,255,0.018))] p-4 lg:flex lg:items-center lg:gap-5">
        <div className="mb-4 flex items-center justify-between gap-4 lg:mb-0 lg:w-64 lg:shrink-0">
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d8b873]/75"><Target className="h-3.5 w-3.5" /> {goal.goal_label}</p>
            <p className="mt-2 text-lg font-semibold text-white">{money(goal.target_amount)}</p>
            <p className="mt-1 text-[11px] text-white/35">{Number(goal.progress_percent).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% concluído</p>
          </div>
          <button type="button" onClick={() => router.push("/dashboard/metas")} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/50 transition hover:border-white/25 hover:text-white" aria-label="Abrir metas"><ArrowRight className="h-4 w-4" /></button>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-2.5">
          <Rhythm label="Hoje" actual={goal.today.actual} required={goal.today.required} onTrack={goal.today.on_track} />
          <Rhythm label={periodLabel} actual={goal.week.actual} required={goal.week.required} onTrack={goal.week.on_track} />
        </div>
      </div>
    </section>
  );
}
