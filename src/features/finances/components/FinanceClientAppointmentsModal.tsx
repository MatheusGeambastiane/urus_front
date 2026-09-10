"use client";

import { CalendarDays, Mail, Phone, Scissors, UserRound } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency } from "@/src/features/shared/utils/money";
import type {
  FinanceClientAppointmentsResponse,
  FinanceClientGroup,
} from "@/src/features/finances/types";

type FinanceClientAppointmentsModalProps = {
  open: boolean;
  group: FinanceClientGroup | null;
  data: FinanceClientAppointmentsResponse | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
};

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Bahia",
});

export function FinanceClientAppointmentsModal({
  open,
  group,
  data,
  loading,
  error,
  onClose,
}: FinanceClientAppointmentsModalProps) {
  const isNewClients = group === "new";
  const title = isNewClients ? "Novos clientes" : "Clientes recorrentes";
  const subtitle = isNewClients ? "Primeiro atendimento no mês" : "Dois ou mais atendimentos no mês";

  return (
    <Modal open={open} onClose={onClose} title={title} subtitle={subtitle} maxWidth="lg">
      <div className="max-h-[70vh] overflow-y-auto pr-1 [scrollbar-color:rgba(255,255,255,0.18)_transparent]">
        {loading ? (
          <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-white/55">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-white/75" />
            <p className="text-sm">Carregando atendimentos...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-300/20 bg-rose-300/8 p-4 text-sm text-rose-100">
            {error}
          </div>
        ) : data?.clients.length ? (
          <div className="space-y-3">
            <div className="flex gap-2 pb-1">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/65">
                {data.clients_count} {data.clients_count === 1 ? "cliente" : "clientes"}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/65">
                {data.appointments_count} {data.appointments_count === 1 ? "atendimento" : "atendimentos"}
              </span>
            </div>

            {data.clients.map((client) => (
              <article
                key={client.id}
                className="overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.035]"
              >
                <header className="flex items-start justify-between gap-4 border-b border-white/8 p-4">
                  <div className="flex min-w-0 gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-white/60">
                      <UserRound className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-white">{client.name}</h3>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/45">
                        {client.phone ? (
                          <a className="inline-flex items-center gap-1 hover:text-white/75" href={`tel:${client.phone}`}>
                            <Phone className="h-3 w-3" />
                            {client.phone}
                          </a>
                        ) : null}
                        {client.email ? (
                          <a className="inline-flex items-center gap-1 hover:text-white/75" href={`mailto:${client.email}`}>
                            <Mail className="h-3 w-3" />
                            <span className="max-w-48 truncate">{client.email}</span>
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-white">{client.appointments_count}x</p>
                    <p className="mt-0.5 text-xs text-emerald-200/80">{formatCurrency(client.total_spent)}</p>
                  </div>
                </header>

                <div className="divide-y divide-white/[0.06]">
                  {client.appointments.map((appointment) => (
                    <div key={appointment.id} className="grid grid-cols-[1fr_auto] gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <p className="inline-flex items-center gap-1.5 text-sm font-medium text-white/82">
                          <CalendarDays className="h-3.5 w-3.5 text-white/40" />
                          {dateTimeFormatter.format(new Date(appointment.date_time))}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-white/45">
                          <Scissors className="h-3 w-3 shrink-0" />
                          {appointment.services.length ? appointment.services.join(" · ") : "Serviço não informado"}
                          {appointment.professional_name ? ` · ${appointment.professional_name}` : ""}
                        </p>
                      </div>
                      <p className="self-center text-sm font-medium text-white/72">
                        {formatCurrency(appointment.price_paid)}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex min-h-52 flex-col items-center justify-center rounded-[22px] border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
            <UserRound className="h-8 w-8 text-white/25" />
            <p className="mt-3 text-sm font-medium text-white/70">Nenhum cliente neste período</p>
            <p className="mt-1 text-xs text-white/40">Selecione outro mês para consultar.</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
