"use client";

import { Section } from "@/src/features/dashboard/components/Section";

export function ServiceDetailPage({ id }: { id: string }) {
  return (
    <div className="space-y-6">
      <Section title="Serviço" subtitle={`ID: ${id}`}>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
          TODO: buscar e renderizar detalhes do serviço via service existente.
        </div>
      </Section>
    </div>
  );
}
