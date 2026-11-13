"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

export type ChatQuestion = {
  id: string;
  title: string;
  options: { label: string; value: string; description?: string }[];
};

export function QuestionFlow({ questions, disabled, onSubmit }: {
  questions: ChatQuestion[];
  disabled: boolean;
  onSubmit: (answers: { question: ChatQuestion; value: string }[]) => Promise<void>;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [custom, setCustom] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const question = questions[step];
  if (!question) return null;
  const valueFor = (q: ChatQuestion) => answers[q.id] === "__custom__" || !q.options.length
    ? (custom[q.id] ?? "").trim() : answers[q.id] ?? "";
  const value = valueFor(question);
  const last = step === questions.length - 1;
  const locked = disabled || submitted;

  async function advance() {
    if (!value || locked) return;
    if (!last) { setStep(step + 1); return; }
    if (questions.some(q => !valueFor(q))) return;
    setSubmitted(true);
    try { await onSubmit(questions.map(q => ({ question: q, value: valueFor(q) }))); }
    catch { setSubmitted(false); }
  }

  return <section className="mt-5 overflow-hidden rounded-2xl border border-[#c8ba9a]/25 bg-[#191c18]" aria-label="Perguntas do assistente">
    <div className="flex items-center justify-between gap-3 border-b border-white/[.07] px-5 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-[#d4c7ac]" aria-live="polite">Pergunta {step + 1} de {questions.length}</p>
      <span className="flex gap-1" aria-hidden="true">{questions.map((q, i) => <span key={q.id} className={`h-1 w-5 rounded-full ${i <= step ? "bg-[#c8ba9a]" : "bg-white/10"}`}/>)}</span>
    </div>
    <form onSubmit={e => { e.preventDefault(); void advance(); }} className="p-5">
      <fieldset disabled={locked}>
        <legend className="mb-4 text-sm font-medium leading-6 text-stone-100">{question.title}</legend>
        <div className="grid gap-2">
          {question.options.map((option, index) => <label key={option.value} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 transition-colors focus-within:ring-2 focus-within:ring-[#c8ba9a]/60 ${answers[question.id] === option.value ? "border-[#c8ba9a]/60 bg-[#c8ba9a]/10" : "border-white/10 hover:bg-white/5"}`}>
            <input type="radio" name={question.id} value={option.value} checked={answers[question.id] === option.value} onChange={() => setAnswers({ ...answers, [question.id]: option.value })} className="accent-[#c8ba9a]"/>
            <span className="min-w-0 flex-1"><span className="block text-sm">{option.label}</span>{option.description && <span className="mt-1 block text-xs text-stone-400">{option.description}</span>}</span>
            <span className="text-[10px] tabular-nums text-stone-500">{index + 1}</span>
          </label>)}
          {question.options.length > 0 && <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 px-3.5 py-3 text-sm text-stone-400 focus-within:ring-2 focus-within:ring-[#c8ba9a]/60">
            <input type="radio" name={question.id} checked={answers[question.id] === "__custom__"} onChange={() => setAnswers({ ...answers, [question.id]: "__custom__" })} className="accent-[#c8ba9a]"/>Outra resposta
          </label>}
          {(!question.options.length || answers[question.id] === "__custom__") && <input aria-label={`Resposta: ${question.title}`} placeholder="Digite sua resposta…" maxLength={1000} value={custom[question.id] ?? ""} onChange={e => setCustom({ ...custom, [question.id]: e.target.value })} className="min-w-0 rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm outline-none focus:border-[#c8ba9a]"/>}
        </div>
      </fieldset>
      <div className="mt-5 flex items-center justify-between gap-3">
        <button type="button" disabled={!step || locked} onClick={() => setStep(step - 1)} className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-stone-400 disabled:opacity-25"><ArrowLeft size={14}/>Voltar</button>
        <button type="submit" disabled={!value || locked} className="inline-flex items-center gap-2 rounded-xl bg-[#ddd3bd] px-4 py-2.5 text-xs font-semibold text-stone-950 transition hover:bg-[#eee6d5] disabled:opacity-35">{submitted ? "Respostas enviadas" : last ? "Enviar respostas" : "Próxima"}{submitted ? <Check size={14}/> : <ArrowRight size={14}/>}</button>
      </div>
    </form>
  </section>;
}
