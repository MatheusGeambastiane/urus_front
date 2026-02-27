"use client";

import type { ReactNode } from "react";

type Props = {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
};

export function Section({ title, subtitle, right, children }: Props) {
  return (
    <section className="space-y-3">
      {(title || subtitle || right) && (
        <div className="flex items-start justify-between gap-3">
          <div>
            {title ? <h2 className="text-lg font-semibold">{title}</h2> : null}
            {subtitle ? <p className="text-sm text-white/60">{subtitle}</p> : null}
          </div>
          {right}
        </div>
      )}
      <div>{children}</div>
    </section>
  );
}
