"use client";

import { ChevronLeft, Loader2 } from "lucide-react";
import { ProfileMenu } from "@/components/ui/ProfileMenu";
import type { ClientHistorySummary, UserDetail } from "@/src/features/users/types";

type ClientHistoryScreenProps = {
  userDetail: UserDetail | null;
  clientHistoryData: ClientHistorySummary | null;
  clientHistoryLoading: boolean;
  clientHistoryError: string | null;
  profilePic: string | null;
  onBack: () => void;
  onLogout: () => void;
};

export function ClientHistoryScreen({
  userDetail,
  clientHistoryData,
  clientHistoryLoading,
  clientHistoryError,
  profilePic,
  onBack,
  onLogout,
}: ClientHistoryScreenProps) {
  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center justify-between">
        <button
          type="button"
          className="mr-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-white/40 hover:text-white"
          onClick={onBack}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 text-center">
          <p className="text-sm text-white/60">Cliente</p>
          <p className="text-xl font-semibold">
            Histórico de {userDetail?.first_name} {userDetail?.last_name}
          </p>
        </div>
        <ProfileMenu profilePicUrl={profilePic} onLogout={onLogout} />
      </header>

      {clientHistoryLoading ? (
        <div className="flex min-h-[200px] flex-1 items-center justify-center rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 text-white/70">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="ml-2 text-sm">Carregando histórico...</p>
        </div>
      ) : clientHistoryError ? (
        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
          {clientHistoryError}
        </div>
      ) : clientHistoryData ? (
        <>
          <section className="grid gap-4 min-[320px]:grid-cols-2">
            <article className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
              <p className="text-sm text-white/60">Total de serviços</p>
              <p className="mt-2 text-xl font-semibold">{clientHistoryData.total_appointments}</p>
            </article>
            <article className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
              <p className="text-sm text-white/60">Total gasto</p>
              <p className="mt-2 text-xl font-semibold">
                R$ {Number(clientHistoryData.total_paid_completed).toFixed(2)}
              </p>
            </article>
          </section>

          <section className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
            <h3 className="text-lg font-semibold">Atendimentos por profissional</h3>
            <ul className="mt-4 space-y-2">
              {clientHistoryData.appointments_by_professional.length === 0 ? (
                <li className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/60">
                  Nenhum atendimento encontrado.
                </li>
              ) : (
                clientHistoryData.appointments_by_professional.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3"
                  >
                    <span className="text-sm text-white/80">{item.name}</span>
                    <span className="text-sm font-semibold text-white">{item.count}</span>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
            <h3 className="text-lg font-semibold">Atendimentos por serviço</h3>
            <ul className="mt-4 space-y-2">
              {clientHistoryData.appointments_by_service.length === 0 ? (
                <li className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/60">
                  Nenhum serviço encontrado.
                </li>
              ) : (
                clientHistoryData.appointments_by_service.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3"
                  >
                    <span className="text-sm text-white/80">{item.name}</span>
                    <span className="text-sm font-semibold text-white">{item.count}</span>
                  </li>
                ))
              )}
            </ul>
          </section>
        </>
      ) : null}
    </div>
  );
}
