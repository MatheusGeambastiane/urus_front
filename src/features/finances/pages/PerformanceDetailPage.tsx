"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/src/features/dashboard/components/DashboardShell";
import { useAuth } from "@/src/features/shared/hooks/useAuth";
import { useRepasses } from "@/src/features/finances/hooks/useRepasses";
import { RepasseAnalyticsPanel } from "@/src/features/finances/components/RepasseAnalyticsPanel";
import { formatMonthParam } from "@/src/features/finances/utils/finances";
import type { ProfessionalServiceSummary, RepasseDetail } from "@/src/features/repasses/types";

export function PerformanceDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { accessToken, fetchWithAuth, profilePic, userRole } = useAuth();
  const repasses = useRepasses({ accessToken, fetchWithAuth, month: formatMonthParam(new Date()), userRole });
  const { fetchDetail, fetchAnalytics } = repasses;
  const [detail, setDetail] = useState<RepasseDetail | null>(null);
  const [analytics, setAnalytics] = useState<ProfessionalServiceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalysis = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchDetail(Number(id));
      setDetail(data);
      const result = await fetchAnalytics(data);
      setAnalytics(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar análise.");
    } finally {
      setLoading(false);
    }
  }, [fetchAnalytics, fetchDetail, id]);

  useEffect(() => {
    void loadAnalysis();
  }, [loadAnalysis]);

  return (
    <DashboardShell activeTab="performance" profilePic={profilePic} userRole={userRole}>
      <div className="space-y-5 pb-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60">Desempenho</p>
            <p className="text-2xl font-semibold">Análise do profissional</p>
          </div>
          <button type="button" onClick={() => router.push("/dashboard/desempenho")} className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80">
            Voltar
          </button>
        </header>
        {detail ? <RepasseAnalyticsPanel detail={detail} analytics={analytics} loading={loading} error={error} /> : <p className="rounded-3xl border border-white/10 px-4 py-6 text-center text-sm text-white/60">Carregando...</p>}
      </div>
    </DashboardShell>
  );
}
