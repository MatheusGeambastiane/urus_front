"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/src/features/shared/utils/money";

type ResourceDistributionItem = {
  key: string;
  label: string;
  total: number;
  count: number;
  color: string;
};

type ResourceDistributionChartProps = {
  items: ResourceDistributionItem[];
};

export function ResourceDistributionChart({ items }: ResourceDistributionChartProps) {
  const [selectedResourceCount, setSelectedResourceCount] = useState<{
    label: string;
    count: number;
  } | null>(null);

  return (
    <section className="relative overflow-hidden rounded-[30px] border border-white/8 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 shadow-card text-white">
      <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-white/[0.03] blur-3xl" />
      <div>
        <p className="text-xs uppercase tracking-wide text-white/50">Origem dos recursos</p>
        <p className="text-lg font-semibold">Distribuição por origem</p>
      </div>
      {items.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-white/10 px-4 py-5 text-center text-sm text-white/60">
          Nenhuma transação encontrada para o período.
        </p>
      ) : (
        <>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={items}>
                <XAxis dataKey="label" tick={{ fill: "#A1A1AA", fontSize: 12 }} />
                <YAxis tick={{ fill: "#A1A1AA", fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number, _name, payload) => {
                    const count = payload?.payload?.count ?? 0;
                    return `${formatCurrency(Number(value).toFixed(2))} • ${count} transações`;
                  }}
                  contentStyle={{
                    backgroundColor: "#111",
                    borderRadius: 12,
                    border: "1px solid #333",
                  }}
                />
                <Bar
                  dataKey="total"
                  radius={[8, 8, 0, 0]}
                  onClick={(data) => {
                    const payload = (data as { payload?: { label?: string; count?: number } })?.payload;
                    if (payload?.label) {
                      setSelectedResourceCount({
                        label: payload.label,
                        count: payload.count ?? 0,
                      });
                    }
                  }}
                >
                  {items.map((entry) => (
                    <Cell key={`resource-bar-${entry.key}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {selectedResourceCount ? (
            <p className="mt-2 text-xs text-white/60">
              {selectedResourceCount.label}: {selectedResourceCount.count} transações
            </p>
          ) : null}
          <div className="mt-4 space-y-2 text-sm text-white/80">
            {items.map((entry) => (
              <div
                key={`resource-legend-${entry.key}`}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <p>{entry.label}</p>
                </div>
                <span className="font-semibold text-white">
                  {formatCurrency(entry.total.toFixed(2))} | {entry.count}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
