"use client";

type Props = { label?: string };

export function LoadingBlock({ label = "Carregando..." }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">{label}</div>
  );
}
