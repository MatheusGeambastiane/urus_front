"use client";

import { useState } from "react";

export function FailureActions({ messageId, log, disabled, onRetry }: {
  messageId: number;
  log?: string;
  disabled: boolean;
  onRetry: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const panelId = `error-log-${messageId}`;

  async function copyLog() {
    if (!log) return;
    try {
      await navigator.clipboard.writeText(log);
      setCopyStatus("Log copiado.");
    } catch {
      setCopyStatus("Não foi possível copiar. Selecione o texto do log e copie manualmente.");
    }
  }

  return <div className="mt-3">
    <div className="flex items-center gap-4 text-xs">
      <button type="button" disabled={disabled} onClick={onRetry} className="underline disabled:opacity-40">Tentar novamente</button>
      <button type="button" aria-expanded={expanded} aria-controls={panelId} onClick={() => setExpanded(value => !value)} className="text-stone-400 underline hover:text-white">Ver log</button>
    </div>
    <div id={panelId} hidden={!expanded} className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
      {log ? <>
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-xs text-stone-400">Diagnóstico do erro</span>
          <button type="button" onClick={() => void copyLog()} className="rounded-lg border border-white/15 px-3 py-1.5 text-xs hover:bg-white/5">Copiar log</button>
        </div>
        <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-stone-300">{log}</pre>
        <p role="status" className="mt-2 text-xs text-stone-400">{copyStatus}</p>
      </> : <p className="text-xs text-stone-400">O log não foi registrado para esta mensagem.</p>}
    </div>
  </div>;
}
