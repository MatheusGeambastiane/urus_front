"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { pieChartColors } from "@/src/features/finances/utils/finances";
import type { ServiceProfessionalDistribution } from "@/src/features/finances/types";

type ServicesProfessionalDistributionCardProps = {
  items: ServiceProfessionalDistribution[];
  loading: boolean;
};

export function ServicesProfessionalDistributionCard({
  items,
  loading,
}: ServicesProfessionalDistributionCardProps) {
  const data = items.map((item) => ({
    name: item.professional_name,
    value: item.count,
    percentage: item.percentage,
    id: item.professional_id,
  }));

  return (
    <article className="relative overflow-hidden rounded-[30px] border border-white/8 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 text-white shadow-card">
      <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-white/[0.03] blur-3xl" />
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Serviços por profissional</p>
        <p className="text-lg font-semibold text-white">Distribuição de serviços</p>
      </div>

      {loading ? (
        <p className="mt-4 rounded-2xl border border-dashed border-white/10 px-4 py-5 text-center text-sm text-white/60">
          Carregando...
        </p>
      ) : data.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-white/10 px-4 py-5 text-center text-sm text-white/60">
          Nenhum serviço encontrado para o período.
        </p>
      ) : (
        <div className="relative mt-4 grid gap-4 sm:grid-cols-2">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={4}>
                  {data.map((entry, index) => (
                    <Cell key={`professional-service-${entry.id}`} fill={pieChartColors[index % pieChartColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, _name, payload) => {
                    const percentage = payload?.payload?.percentage ?? "0";
                    return `${value} serviços • ${percentage}%`;
                  }}
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
              <div key={`professional-service-legend-${item.id}`} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/10 px-3 py-2">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: pieChartColors[index % pieChartColors.length] }}
                  />
                  <p className="truncate">{item.name}</p>
                </div>
                <span className="shrink-0 font-semibold text-white">
                  {item.value} | {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
