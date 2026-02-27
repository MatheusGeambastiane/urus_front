"use client";

type Props = { title: string; description?: string };

export function EmptyState({ title, description }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm font-medium">{title}</div>
      {description ? <div className="mt-1 text-sm text-white/60">{description}</div> : null}
    </div>
  );
}
