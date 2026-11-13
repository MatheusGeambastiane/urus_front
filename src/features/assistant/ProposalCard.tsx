import { AlertTriangle, CalendarClock, Check } from "lucide-react";
import { messageFields } from "./MessageContent";
import styles from "./chat.module.css";

export type ProposalSummary = {
  operation?: string;
  fields: { label: string; value: string }[];
  record_id?: number;
  overbooking?: boolean;
};

function formatField(label: string, value: string) {
  if (["Valor", "Gorjeta", "Preço"].includes(label) && /^-?\d+(\.\d+)?$/.test(value)) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value));
  }
  if (label === "Data e hora" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Bahia" }).format(date);
  }
  if (label === "Pagamento") return ({pix:"Pix",dinheiro:"Dinheiro",money:"Dinheiro",credit:"Cartão de crédito",debit:"Cartão de débito"} as Record<string,string>)[value] ?? value;
  return value;
}

export function ProposalCard({ summary, state, content }: { summary: ProposalSummary; state?: string; content: string }) {
  const labels = new Set(summary.fields.map(field => field.label.toLocaleLowerCase("pt-BR")));
  const extra = messageFields(content).filter(field => field.label === "Alteração" && !labels.has(field.label.toLocaleLowerCase("pt-BR")));
  const pending = state === "pending";
  return <section aria-label="Resumo da proposta" className={`${styles.responseEnter} mt-4 overflow-hidden rounded-2xl border border-[#c8ba9a]/25 bg-[#191c18]`}>
    <header className="flex items-center gap-3 border-b border-white/[.07] px-5 py-4">
      <span className="rounded-xl bg-[#c8ba9a]/10 p-2 text-[#ddd3bd]">{state === "completed" ? <Check size={20}/> : <CalendarClock size={20}/>}</span>
      <div><h3 className="text-sm font-semibold text-stone-100">{summary.operation || "Resumo da proposta"}</h3><p className="mt-1 text-xs text-stone-400">{pending ? "Aguardando sua confirmação · nada foi gravado" : state === "completed" ? "Operação concluída" : state ? "Proposta encerrada" : "Verificando o estado da proposta"}</p></div>
    </header>
    <dl className="grid sm:grid-cols-2">
      {[...extra, ...summary.fields].map((field, i) => <div key={i} className={`min-w-0 border-b border-white/[.06] px-5 py-3.5 ${field.label === "Alteração" ? "bg-[#c8ba9a]/[.06] sm:col-span-2" : ""}`}><dt className="text-[11px] text-stone-500">{field.label}</dt><dd className="mt-1 break-words text-sm font-medium text-stone-100">{formatField(field.label, String(field.value))}</dd></div>)}
    </dl>
    {summary.overbooking && <div className="flex items-start gap-2.5 bg-amber-400/[.07] px-5 py-4 text-xs leading-5 text-amber-200"><AlertTriangle size={17} className="mt-0.5 shrink-0"/><p><strong>Encaixe solicitado.</strong> Há indicação de sobreposição de horário. Revise os dados antes de confirmar.</p></div>}
  </section>;
}
