"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { pieChartColors } from "@/src/features/finances/utils/finances";
import { formatCurrency } from "@/src/features/shared/utils/money";

type PaymentDistributionItem = {
  name: string;
  raw: string;
  value: number;
};

type PaymentDistributionCardProps = {
  title: string;
  subtitle: string;
  data: PaymentDistributionItem[];
};

export function PaymentDistributionCard({
  title,
  subtitle,
  data,
}: PaymentDistributionCardProps) {
  if (data.length === 0) {
    return (
      <article className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 text-sm text-white/60">
        <p className="text-base font-semibold text-white">{title}</p>
        <p>{subtitle}</p>
        <p className="mt-4 rounded-2xl border border-dashed border-white/10 px-4 py-5 text-center text-xs">
          Nenhum dado disponível para o período.
        </p>
      </article>
    );
  }

  return (
    <article className="relative overflow-hidden rounded-[30px] border border-white/8 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5">
      <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-white/[0.03] blur-3xl" />
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">{subtitle}</p>
        <p className="text-lg font-semibold text-white">{title}</p>
      </div>
      <div className="relative mt-4 grid gap-4 sm:grid-cols-2">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={4}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${entry.raw}`} fill={pieChartColors[index % pieChartColors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(Number(value).toFixed(2))}
                contentStyle={{
                  backgroundColor: "#111",
                  borderRadius: 12,
                  border: "1px solid #333",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3 text-sm text-white/80">
          {data.map((item, index) => (
            <div key={item.raw} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-3 py-2">
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: pieChartColors[index % pieChartColors.length] }}
                />
                <p>{item.name}</p>
              </div>
              <span className="font-semibold text-white">
                {formatCurrency(item.value.toFixed(2))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
