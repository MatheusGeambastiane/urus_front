"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/src/features/shared/utils/money";

type PaymentDistributionItem = {
  name: string;
  raw: string;
  value: number;
};

type PaymentDistributionCardProps = {
  servicesData: PaymentDistributionItem[];
  salesData: PaymentDistributionItem[];
};

export function PaymentDistributionCard({
  servicesData,
  salesData,
}: PaymentDistributionCardProps) {
  const payments = new Map<string, { payment: string; services: number; sales: number }>();

  servicesData.forEach((item) => {
    payments.set(item.name.toLocaleLowerCase("pt-BR"), { payment: item.name, services: item.value, sales: 0 });
  });
  salesData.forEach((item) => {
    const paymentKey = item.name.toLocaleLowerCase("pt-BR");
    const current = payments.get(paymentKey);
    payments.set(paymentKey, {
      payment: current?.payment ?? item.name,
      services: current?.services ?? 0,
      sales: item.value,
    });
  });

  const data = Array.from(payments.values());

  return (
    <section className="relative overflow-hidden rounded-[30px] border border-white/8 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 shadow-card">
      <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-white/[0.03] blur-3xl" />
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Distribuição por forma</p>
        <h2 className="mt-1 text-lg font-semibold text-white">Pagamentos de serviços e vendas</h2>
        <p className="mt-1 text-xs text-white/40">Comparativo do valor recebido por forma de pagamento.</p>
      </div>

      {data.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-white/10 px-4 py-5 text-center text-xs text-white/60">
          Nenhum dado disponível para o período.
        </p>
      ) : (
        <div className="mt-5 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={5} barCategoryGap="24%">
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.07)" />
              <XAxis
                dataKey="payment"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(255,255,255,0.48)", fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={72}
                tick={{ fill: "rgba(255,255,255,0.38)", fontSize: 10 }}
                tickFormatter={(value: number) => `R$ ${value}`}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.035)" }}
                formatter={(value: number, name: string) => [
                  formatCurrency(Number(value).toFixed(2)),
                  name === "services" ? "Serviços" : "Vendas",
                ]}
                contentStyle={{
                  backgroundColor: "#111",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              />
              <Legend
                formatter={(value: string) => value === "services" ? "Serviços" : "Vendas"}
                wrapperStyle={{ color: "rgba(255,255,255,0.72)", fontSize: 12 }}
              />
              <Bar dataKey="services" fill="#6ee7b7" radius={[7, 7, 2, 2]} maxBarSize={46} />
              <Bar dataKey="sales" fill="#d4d4d8" radius={[7, 7, 2, 2]} maxBarSize={46} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
