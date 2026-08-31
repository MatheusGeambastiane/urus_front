"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileWarning,
  MousePointerClick,
  SlidersHorizontal,
} from "lucide-react";
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

import { DashboardShell } from "@/src/features/dashboard/components/DashboardShell";
import { useAuth } from "@/src/features/shared/hooks/useAuth";
import { env } from "@/lib/env";
import { Modal } from "@/components/ui/Modal";

type AnalyticsData = {
  period: { start: string; end: string };
  totals: {
    accesses: number;
    accesses_with_appointment: number;
    accesses_with_errors: number;
    errors: number;
  };
  utm_origins: Array<{ origin: string; count: number }>;
  error_kinds: Array<{ kind: string; count: number }>;
  by_day: Array<{ date: string; accesses: number; appointments: number; errors: number }>;
};

type AccessError = {
  id: number;
  visit_id: string;
  path: string;
  kind: string;
  message: string;
  status_code: number | null;
  log: unknown;
  created_at: string;
};

type PaginatedErrors = {
  count: number;
  next: string | null;
  results: AccessError[];
};

const quickFilters = [7, 30, 90] as const;

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));

const formatShortDate = (date: string) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`),
  );

const formatOrigin = (origin: string) => {
  if (origin === "Direto" || origin === "Referência externa") return origin;
  return origin
    .replace(/[_-]+/g, " ")
    .replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase("pt-BR"));
};

const formatCapturedAt = (date: string) => {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return date;

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(parsedDate);
};

const formatLog = (log: unknown) => {
  if (log === null || log === undefined || log === "") return "Nenhum log detalhado foi enviado.";
  if (typeof log === "string") return log;

  try {
    return JSON.stringify(log, null, 2);
  } catch {
    return String(log);
  }
};

export function AccessAnalyticsPage() {
  const { accessToken, fetchWithAuth, profilePic, userRole } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [query, setQuery] = useState("days=30");
  const [activeDays, setActiveDays] = useState<number | null>(30);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedErrorKind, setSelectedErrorKind] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<AccessError[]>([]);
  const [errorDetailsCount, setErrorDetailsCount] = useState(0);
  const [errorDetailsNext, setErrorDetailsNext] = useState<string | null>(null);
  const [errorDetailsLoading, setErrorDetailsLoading] = useState(false);
  const [errorDetailsError, setErrorDetailsError] = useState<string | null>(null);
  const errorDetailsRequestId = useRef(0);

  const loadAnalytics = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth(
        `${env.apiBaseUrl}/dashboard/analytics/accesses/?${query}`,
        {
          cache: "no-store",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      if (!response.ok) throw new Error("Não foi possível carregar os dados de acesso.");
      setData((await response.json()) as AnalyticsData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Falha ao carregar analytics.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, fetchWithAuth, query]);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const loadErrorDetails = useCallback(async (kind: string, pageUrl?: string) => {
    if (!accessToken) return;

    const requestId = ++errorDetailsRequestId.current;
    const append = Boolean(pageUrl);
    setErrorDetailsLoading(true);
    setErrorDetailsError(null);

    try {
      const url = pageUrl ?? `${env.apiBaseUrl}/dashboard/analytics/accesses/errors/?${query}&kind=${encodeURIComponent(kind)}&page_size=20`;
      const response = await fetchWithAuth(url, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) throw new Error("Não foi possível carregar os logs deste erro.");

      const payload = (await response.json()) as PaginatedErrors;
      if (requestId !== errorDetailsRequestId.current) return;
      setErrorDetails((current) => append ? [...current, ...payload.results] : payload.results);
      setErrorDetailsCount(payload.count);
      setErrorDetailsNext(payload.next);
    } catch (loadError) {
      if (requestId !== errorDetailsRequestId.current) return;
      setErrorDetailsError(loadError instanceof Error ? loadError.message : "Falha ao carregar os logs.");
    } finally {
      if (requestId === errorDetailsRequestId.current) setErrorDetailsLoading(false);
    }
  }, [accessToken, fetchWithAuth, query]);

  const openErrorDetails = (kind: string) => {
    setSelectedErrorKind(kind);
    setErrorDetails([]);
    setErrorDetailsCount(0);
    setErrorDetailsNext(null);
    void loadErrorDetails(kind);
  };

  const closeErrorDetails = () => {
    errorDetailsRequestId.current += 1;
    setSelectedErrorKind(null);
    setErrorDetailsLoading(false);
    setErrorDetailsError(null);
  };

  const selectDays = (days: number) => {
    setActiveDays(days);
    setQuery(`days=${days}`);
    setFiltersOpen(false);
  };

  const applyCustomPeriod = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!startDate || !endDate || startDate > endDate) {
      setError("Informe um período válido.");
      return;
    }
    setActiveDays(null);
    setQuery(`start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`);
    setFiltersOpen(false);
  };

  const cards = data
    ? [
        { label: "Total de acessos", value: data.totals.accesses, icon: MousePointerClick },
        { label: "Marcaram atendimento", value: data.totals.accesses_with_appointment, icon: CheckCircle2 },
        { label: "Acessos com erro", value: data.totals.accesses_with_errors, icon: AlertTriangle },
        { label: "Erros registrados", value: data.totals.errors, icon: BarChart3 },
      ]
    : [];

  return (
    <DashboardShell activeTab="analytics" profilePic={profilePic} userRole={userRole} desktopVariant="luxury">
      <section className="space-y-6 [font-family:var(--font-dashboard-body)]">
        <header className="flex items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#e5e7eb]">Aquisição do portal</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Analytics de acessos</h1>
            {data ? (
              <p className="flex items-center gap-2 text-xs text-white/45">
                <CalendarDays className="h-4 w-4 text-[#e5e7eb]" />
                {formatDate(data.period.start)} — {formatDate(data.period.end)}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            aria-expanded={filtersOpen}
            aria-controls="analytics-filters"
            onClick={() => setFiltersOpen((open) => !open)}
            className={`flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition ${
              filtersOpen
                ? "border-[#e5e7eb]/45 bg-[#e5e7eb]/15 text-[#f4f4f5]"
                : "border-white/10 bg-white/[0.035] text-white/70 hover:border-white/20 hover:text-white"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
          </button>
        </header>

        {loading && !data ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Carregando contagens">
            {cards.length === 0
              ? Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className="h-32 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]" />
                ))
              : null}
          </div>
        ) : null}

        {data ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {cards.map(({ label, value, icon: Icon }) => (
              <article key={label} className="relative overflow-hidden rounded-2xl border border-[#e5e7eb]/15 bg-[linear-gradient(145deg,rgba(255,255,255,0.09),rgba(255,255,255,0.025)_55%)] p-4 lg:p-5">
                <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-[#e5e7eb]/[0.06] blur-2xl" />
                <Icon className="relative h-5 w-5 text-[#e5e7eb]" />
                <strong className="relative mt-3 block text-4xl font-semibold leading-none tabular-nums text-white lg:text-5xl">{value}</strong>
                <span className="relative mt-2 block text-xs font-medium text-white/50">{label}</span>
              </article>
            ))}
          </div>
        ) : null}

        {error ? (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
            <span>{error}</span>
            <button type="button" onClick={() => void loadAnalytics()} className="font-semibold underline">Tentar novamente</button>
          </div>
        ) : null}

        {filtersOpen ? <div id="analytics-filters" className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => selectDays(days)}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  activeDays === days
                    ? "border-[#e5e7eb]/50 bg-[#e5e7eb]/15 text-[#f4f4f5]"
                    : "border-white/10 text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                {days} dias
              </button>
            ))}
          </div>
          <form onSubmit={applyCustomPeriod} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <label className="space-y-1 text-xs text-white/55">
              Data inicial
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="block w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white [color-scheme:dark]"
              />
            </label>
            <label className="space-y-1 text-xs text-white/55">
              Data final
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="block w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white [color-scheme:dark]"
              />
            </label>
            <button type="submit" className="rounded-xl bg-[#e5e7eb] px-5 py-2.5 text-sm font-bold text-black hover:bg-[#f4f4f5]">
              Aplicar
            </button>
          </form>
        </div> : null}

        {data ? (
          <>
            <div className="grid gap-5 xl:grid-cols-2">
              <CountTable title="Origem / UTM" empty="Nenhuma origem no período" rows={data.utm_origins.map((row) => ({ label: formatOrigin(row.origin), count: row.count }))} />
              <CountTable
                title="Erros por tipo"
                description="Clique em um tipo para consultar os logs capturados."
                empty="Nenhum erro no período"
                rows={data.error_kinds.map((row) => ({ label: row.kind, count: row.count }))}
                onRowClick={(row) => openErrorDetails(row.label)}
              />
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
              <div className="border-b border-white/10 px-5 py-4">
                <h2 className="font-semibold text-white">Acessos por dia</h2>
                <p className="mt-1 text-xs text-white/40">Distribuição diária das contagens no período selecionado.</p>
              </div>
              <div
                className="overflow-x-auto px-2 pb-3 pt-5 sm:px-5"
                role="img"
                aria-label="Histograma diário de acessos, atendimentos marcados e erros"
              >
                <div
                  className="h-[320px]"
                  style={{
                    minWidth: "100%",
                    width: data.by_day.length > 31 ? `${data.by_day.length * 20}px` : "100%",
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.by_day.map((row) => ({ ...row, day: formatShortDate(row.date) }))}
                      margin={{ top: 6, right: 8, left: -18, bottom: 4 }}
                      barCategoryGap="20%"
                    >
                      <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "rgba(255,255,255,0.42)", fontSize: 11 }}
                        interval="preserveStartEnd"
                        minTickGap={20}
                      />
                      <YAxis
                        allowDecimals={false}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "rgba(255,255,255,0.38)", fontSize: 11 }}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(255,255,255,0.06)" }}
                        contentStyle={{
                          background: "#0a0a0a",
                          border: "1px solid rgba(255,255,255,0.22)",
                          borderRadius: 12,
                          color: "white",
                          boxShadow: "0 18px 45px rgba(0,0,0,0.35)",
                        }}
                        labelStyle={{ color: "rgba(255,255,255,0.55)", marginBottom: 6 }}
                      />
                      <Legend
                        iconType="circle"
                        iconSize={7}
                        wrapperStyle={{ color: "rgba(255,255,255,0.62)", fontSize: 12 }}
                      />
                      <Bar dataKey="accesses" name="Acessos" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="appointments" name="Atendimentos" fill="#5fa57d" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="errors" name="Erros" fill="#b85c62" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        ) : null}

        <Modal
          open={selectedErrorKind !== null}
          onClose={closeErrorDetails}
          title={selectedErrorKind ?? "Logs de erro"}
          subtitle={errorDetailsCount === 1 ? "1 erro capturado" : `${errorDetailsCount} erros capturados`}
          maxWidth="lg"
        >
          <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
            {errorDetails.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]">
                <div className="flex items-start gap-3 border-b border-white/[0.07] px-4 py-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-300/15 bg-red-400/10 text-red-200">
                    <FileWarning className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-semibold leading-5 text-white">{item.message}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-[11px] text-white/45">
                      <Clock3 className="h-3.5 w-3.5" />
                      Capturado em {formatCapturedAt(item.created_at)}
                    </p>
                  </div>
                  {item.status_code ? (
                    <span className="shrink-0 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-[11px] font-semibold tabular-nums text-white/60">
                      HTTP {item.status_code}
                    </span>
                  ) : null}
                </div>
                <div className="space-y-3 px-4 py-3">
                  <p className="truncate text-xs text-white/45" title={item.path}>Página: <span className="text-white/70">{item.path}</span></p>
                  <div>
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">Log</p>
                    <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-white/[0.07] bg-black/35 p-3 font-mono text-[11px] leading-5 text-white/65">
                      {formatLog(item.log)}
                    </pre>
                  </div>
                </div>
              </article>
            ))}

            {errorDetailsLoading && errorDetails.length === 0 ? (
              <div className="space-y-3" aria-label="Carregando logs">
                {Array.from({ length: 2 }, (_, index) => <div key={index} className="h-40 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]" />)}
              </div>
            ) : null}

            {errorDetailsError ? (
              <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                <p>{errorDetailsError}</p>
                <button type="button" onClick={() => selectedErrorKind && void loadErrorDetails(selectedErrorKind)} className="mt-2 font-semibold underline">
                  Tentar novamente
                </button>
              </div>
            ) : null}

            {!errorDetailsLoading && !errorDetailsError && errorDetails.length === 0 ? (
              <p className="py-8 text-center text-sm text-white/40">Nenhum log encontrado para este tipo.</p>
            ) : null}

            {errorDetailsNext ? (
              <button
                type="button"
                disabled={errorDetailsLoading}
                onClick={() => selectedErrorKind && void loadErrorDetails(selectedErrorKind, errorDetailsNext)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-wait disabled:opacity-50"
              >
                {errorDetailsLoading ? "Carregando..." : "Carregar mais logs"}
              </button>
            ) : null}
          </div>
        </Modal>
      </section>
    </DashboardShell>
  );
}

type CountRow = { label: string; count: number };

function CountTable({
  title,
  description,
  rows,
  empty,
  onRowClick,
}: {
  title: string;
  description?: string;
  rows: CountRow[];
  empty: string;
  onRowClick?: (row: CountRow) => void;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
      <div className="border-b border-white/10 px-5 py-4">
        <h2 className="font-semibold text-white">{title}</h2>
        {description ? <p className="mt-1 text-xs text-white/40">{description}</p> : null}
      </div>
      {rows.length ? (
        <ul className="divide-y divide-white/[0.06]">
          {rows.map((row) => (
            <li key={row.label}>
              {onRowClick ? (
                <button
                  type="button"
                  onClick={() => onRowClick(row)}
                  className="group flex w-full items-center gap-4 px-5 py-3 text-left text-sm transition hover:bg-white/[0.045] focus-visible:bg-white/[0.045] focus-visible:outline-none"
                  aria-label={`Ver ${row.count} ${row.count === 1 ? "erro" : "erros"} do tipo ${row.label}`}
                >
                  <span className="min-w-0 flex-1 truncate text-white/65 transition group-hover:text-white">{row.label}</span>
                  <strong className="tabular-nums text-white">{row.count}</strong>
                  <ChevronRight className="h-4 w-4 text-white/25 transition group-hover:translate-x-0.5 group-hover:text-white/65" />
                </button>
              ) : (
                <div className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                  <span className="truncate text-white/65">{row.label}</span>
                  <strong className="tabular-nums text-white">{row.count}</strong>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : <p className="px-5 py-8 text-center text-sm text-white/40">{empty}</p>}
    </section>
  );
}
