"use client";

import type { ProductSalesDashboard } from "@/src/features/products/types";

type ProductSalesHeatmapProps = {
  startDate: string;
  endDate: string;
  entries: ProductSalesDashboard["sales_by_day_hour"];
};

const MAX_DAYS = 92;

function periodDays(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T12:00:00Z`);
  const end = new Date(`${endDate}T12:00:00Z`);
  const days: string[] = [];
  for (let current = start; current <= end && days.length < MAX_DAYS; current = new Date(current.getTime() + 86_400_000)) {
    days.push(current.toISOString().slice(0, 10));
  }
  return days;
}

function shortDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" })
    .format(new Date(`${date}T12:00:00Z`))
    .replace(" de ", " ");
}

const intensityClasses = [
  "border-white/[0.055] bg-white/[0.035]",
  "border-sky-300/10 bg-sky-950",
  "border-sky-300/15 bg-sky-800",
  "border-cyan-200/20 bg-cyan-600",
  "border-cyan-100/25 bg-cyan-300",
];

export function ProductSalesHeatmap({ startDate, endDate, entries }: ProductSalesHeatmapProps) {
  const days = periodDays(startDate, endDate);
  const visibleDays = new Set(days);
  const visibleEntries = entries.filter((entry) => visibleDays.has(entry.date));
  const totalPeriodDays = Math.floor((new Date(`${endDate}T12:00:00Z`).getTime() - new Date(`${startDate}T12:00:00Z`).getTime()) / 86_400_000) + 1;
  const isTruncated = totalPeriodDays > MAX_DAYS;
  const hours = Array.from({ length: 24 }, (_, hour) => hour);
  const countByCell = new Map(visibleEntries.map((entry) => [`${entry.date}-${entry.hour}`, entry.count]));
  const maxCount = Math.max(0, ...visibleEntries.map((entry) => entry.count));
  const totalCount = visibleEntries.reduce((total, entry) => total + entry.count, 0);
  const cellSize = days.length > 31 ? 11 : 14;
  const cellGap = 3;

  const intensityLevel = (count: number) => {
    if (count === 0 || maxCount === 0) return 0;
    const ratio = count / maxCount;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  };

  return (
    <section className="overflow-hidden rounded-[30px] border border-white/8 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.06),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] shadow-card">
      <div className="flex flex-col gap-3 border-b border-white/8 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-200/45">Fluxo de vendas</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Vendas por dia e hora</h2>
          <p className="mt-1 text-xs text-white/40">Células mais claras indicam horários com mais transações registradas.{isTruncated ? ` Exibindo os primeiros ${MAX_DAYS} dias.` : ""}</p>
        </div>
        <p className="text-xs text-white/45">
          <strong className="font-semibold tabular-nums text-white/80">{totalCount}</strong>{" "}
          {totalCount === 1 ? "venda" : "vendas"}
        </p>
      </div>

      <div className="overflow-x-auto px-4 pb-5 pt-4 sm:px-5">
        <div className="min-w-max lg:w-full lg:min-w-0">
          <div className="mb-2 ml-10 grid w-max lg:w-auto lg:justify-between" style={{ gridTemplateColumns: `repeat(${days.length}, ${cellSize}px)`, gap: cellGap }} aria-hidden="true">
            {days.map((day, index) => (
              <span key={day} className="block text-center text-[9px] text-white/35">
                {index === 0 || index === days.length - 1 || index % 4 === 0 ? shortDate(day) : ""}
              </span>
            ))}
          </div>

          <div className="flex gap-2.5">
            <div className="grid shrink-0" style={{ gap: cellGap }} aria-hidden="true">
              {hours.map((hour) => (
                <span key={hour} className="flex w-7 items-center justify-end text-[9px] tabular-nums text-white/30" style={{ height: cellSize }}>
                  {hour % 3 === 0 ? `${String(hour).padStart(2, "0")}h` : ""}
                </span>
              ))}
            </div>
            <div
              className="grid lg:flex-1 lg:justify-between"
              style={{ gridTemplateColumns: `repeat(${days.length}, ${cellSize}px)`, gridTemplateRows: `repeat(24, ${cellSize}px)`, gridAutoFlow: "column", gap: cellGap }}
              role="img"
              aria-label="Mapa de calor da quantidade de vendas por dia e hora"
            >
              {days.flatMap((day) => hours.map((hour) => {
                const count = countByCell.get(`${day}-${hour}`) ?? 0;
                const label = `${shortDate(day)}, ${String(hour).padStart(2, "0")}:00 — ${count} ${count === 1 ? "venda" : "vendas"}`;
                return <span key={`${day}-${hour}`} className={`block rounded-[3px] border transition duration-150 hover:scale-125 hover:ring-1 hover:ring-white/70 ${intensityClasses[intensityLevel(count)]}`} title={label} aria-label={label} />;
              }))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-1.5 text-[10px] text-white/35" aria-hidden="true">
            <span>Menos</span>
            {intensityClasses.map((className, level) => <span key={level} className={`h-3 w-3 rounded-[3px] border ${className}`} />)}
            <span>Mais</span>
          </div>
        </div>
      </div>
    </section>
  );
}
