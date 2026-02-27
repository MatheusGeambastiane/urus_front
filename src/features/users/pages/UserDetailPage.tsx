"use client";

import { useEffect, useState } from "react";

import { EmptyState } from "@/src/features/dashboard/components/EmptyState";
import { LoadingBlock } from "@/src/features/dashboard/components/LoadingBlock";
import { Section } from "@/src/features/dashboard/components/Section";

type Props = { id: string };

type UserDetailData = { id: string };

export function UserDetailPage({ id }: Props) {
  const [data, setData] = useState<UserDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        if (mounted) {
          setData({ id });
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Erro ao carregar usuário");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <LoadingBlock label="Carregando usuário..." />;
  if (error) return <EmptyState title="Falha ao carregar" description={error} />;

  return (
    <div className="space-y-6">
      <Section title="Usuário" subtitle={`ID: ${id}`}>
        <pre className="overflow-auto rounded-2xl border border-white/10 bg-white/5 p-4 text-xs">
          {JSON.stringify(data, null, 2)}
        </pre>
      </Section>
    </div>
  );
}
