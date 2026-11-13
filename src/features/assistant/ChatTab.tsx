"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Archive, ArrowUp, Check, ChevronLeft, LoaderCircle, MessageSquare, Mic, Pencil, Plus, Square, X } from "lucide-react";
import { DashboardShell } from "@/src/features/dashboard/components/DashboardShell";
import { useAuth } from "@/src/features/shared/hooks/useAuth";
import { env } from "@/lib/env";
import { MessageContent, visibleMessageText } from "./MessageContent";
import { ProposalCard, type ProposalSummary } from "./ProposalCard";
import { QuestionFlow, type ChatQuestion } from "./QuestionFlow";
import styles from "./chat.module.css";
import { useDictation } from "./useDictation";

type Chat = { id: string; title: string; archived: boolean; processing_until: string | null };
type Summary = ProposalSummary;
type Block = { type: string; questions?: ChatQuestion[]; options?: { id: number; name: string; phone_hint: string }[]; query?: string; action_id?: string; summary?: Summary; entity?: string; id?: number };
type Message = { id: number; role: string; content: string; blocks: Block[]; status: string };
type Action = { id: string; state: string; summary: Summary };
type Page<T> = { results: T[]; next: string | null };
const base = `${env.apiBaseUrl.replace(/\/+$/, "")}/dashboard/assistant/chats/`;
const destinations: Record<string, string> = { appointment: "/dashboard/agenda", sale: "/dashboard/produtos/vendas", client: "/dashboard/usuarios" };

export function ChatTab() {
  const { accessToken, fetchWithAuth, profilePic, userRole } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [next, setNext] = useState<string | null>(null);
  const [chatNext, setChatNext] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState("");
  const [optimistic, setOptimistic] = useState<string | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const turn = useRef<HTMLDivElement>(null);
  const sending = useRef(false);
  const tail = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  const retry = useRef<{ text: string; id: string } | null>(null);
  const dictation = useDictation(setDraft);
  const current = chats.find(c => c.id === active);

  const api = useCallback(async (url: string, init?: RequestInit) => {
    const response = await fetchWithAuth(url, { ...init, headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", Accept: "application/json", ...init?.headers } });
    const text = await response.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      const status = `HTTP ${response.status}`;
      const hint = response.status === 404
        ? "A rota do assistente não foi encontrada. Verifique a publicação do backend."
        : [502, 503, 504].includes(response.status)
          ? "O serviço do assistente está indisponível ou demorou para responder."
          : response.status >= 500
            ? "O servidor encontrou um erro ao atender o chat."
            : "O endereço da API retornou uma página em vez dos dados do chat. Verifique a configuração da API e os redirecionamentos.";
      throw new Error(`${hint} (${status}). Não foi possível verificar o resultado da solicitação. Reabra a conversa para conferir o estado antes de repetir.`);
    }
    if (!response.ok) throw new Error(typeof body?.detail === "string" ? body.detail : `Não foi possível concluir a solicitação (HTTP ${response.status}).`);
    return body;
  }, [accessToken, fetchWithAuth]);
  const loadChats = useCallback(async () => {
    const data: Page<Chat> = await api(base);
    setChats(data.results); setChatNext(data.next);
  }, [api]);
  const loadConversation = useCallback(async (id: string) => {
    const [page, proposals]: [Page<Message>, Action[]] = await Promise.all([api(`${base}${id}/messages/`), api(`${base}${id}/actions/`)]);
    if (activeRef.current !== id) return;
    setMessages([...page.results].reverse()); setNext(page.next); setActions(proposals);
  }, [api]);
  useEffect(() => {
    if (accessToken) void loadChats().catch(e => setError(e.message));
  }, [accessToken, loadChats]);
  useEffect(() => {
    activeRef.current = active;
    setMessages([]); setActions([]); setNext(null); setError(""); setRenaming(false);
    if (!active) return;
    setLoading(true);
    void loadConversation(active).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [active, loadConversation]);
  useEffect(() => {
    const element = scroll.current;
    if (!element) return;
    const update = () => element.style.setProperty("--chat-height", `${element.clientHeight}px`);
    update();
    const observer = new ResizeObserver(update); observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
    if (optimistic) turn.current?.scrollIntoView({ behavior, block: "start" });
    else if (pinned === null) tail.current?.scrollIntoView({ behavior, block: "end" });
  }, [optimistic, pinned, messages.length]);
  // Recover a response if the page was refreshed while the server was working.
  useEffect(() => {
    if (!active || !current?.processing_until || new Date(current.processing_until) < new Date()) return;
    const timer = setInterval(() => { void Promise.all([loadConversation(active), loadChats()]).catch(() => {}); }, 2500);
    return () => clearInterval(timer);
  }, [active, current?.processing_until, loadConversation, loadChats]);
  const working = busy || Boolean(current?.processing_until && new Date(current.processing_until) > new Date());

  const sendAnswers = async (text = draft, selectedClient?: number) => {
    if (!text.trim() || working || sending.current) return;
    sending.current = true;
    setPinned(messages.length); setOptimistic(text); setDraft("");
    dictation.stop(); setBusy(true); setError("");
    let id = active;
    try {
      if (!id) {
        const chat: Chat = await api(base, { method: "POST", body: JSON.stringify({}) });
        id = chat.id; activeRef.current = id; setActive(id);
      }
      if (retry.current?.text !== text) retry.current = { text, id: crypto.randomUUID() };
      await api(`${base}${id}/messages/`, { method: "POST", body: JSON.stringify({ content: text, request_id: retry.current.id, ...(selectedClient ? { selected_client_id: selectedClient } : {}) }) });
      retry.current = null;
      await Promise.all([loadConversation(id), loadChats()]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível enviar. Tente novamente.");
      setDraft(text);
      setPinned(null);
      if (id) await loadConversation(id).catch(() => {});
      throw e;
    } finally { setOptimistic(null); setBusy(false); sending.current = false; }
  };
  const send = (text = draft, selectedClient?: number) => sendAnswers(text, selectedClient).catch(() => {});
  const decide = async (actionId: string, decision: "confirm" | "cancel") => {
    if (!active || working) return;
    setBusy(true); setError("");
    try {
      await api(`${base}${active}/actions/${actionId}/${decision}/`, { method: "POST", body: "{}" });
      await Promise.all([loadConversation(active), loadChats()]);
    } catch (e) { setError(e instanceof Error ? e.message : "Não foi possível concluir."); }
    finally { setBusy(false); }
  };
  const changeChat = async (data: Partial<Chat>) => {
    if (!active) return;
    try { await api(`${base}${active}/`, { method: "PATCH", body: JSON.stringify(data) }); await loadChats(); setRenaming(false); }
    catch (e) { setError(e instanceof Error ? e.message : "Não foi possível atualizar a conversa."); }
  };
  const pickChat = (id: string | null) => { if (working) return; setPinned(null); setOptimistic(null); dictation.stop(); setDraft(""); retry.current = null; setActive(id); setShowHistory(false); };

  const visibleMessages = optimistic && pinned !== null ? messages.slice(0, pinned) : messages;
  const pendingAction = actions.find(action => action.state === "pending");
  const latestAssistantId = messages.findLast(message => message.role === "assistant")?.id;
  const lastMessage = messages.at(-1);
  const lastProposal = lastMessage?.blocks.find(block => block.type === "proposal");
  const knownProposal = actions.find(action => action.id === lastProposal?.action_id);
  const showConfirmationReply = !pendingAction && !knownProposal && lastMessage?.role === "assistant"
    && (Boolean(lastProposal) || /(?:proposta preparada|confirme.{0,80}confirmar|confirma(?:ção|r) explícita)/i.test(visibleMessageText(lastMessage.content)));

  return <DashboardShell activeTab="chat" profilePic={profilePic} userRole={userRole}>
    <div className="mx-auto flex h-[calc(100dvh-12rem)] min-h-[360px] max-w-7xl overflow-hidden rounded-2xl border border-white/10 bg-[#101110] text-stone-100 lg:h-[calc(100dvh-8rem)]">
      <aside className={`${showHistory ? "flex" : "hidden"} w-full shrink-0 flex-col border-r border-white/10 bg-[#0b0c0b] p-4 md:flex md:w-60`} aria-label="Conversas">
        <div className="mb-8 flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-[.25em] text-stone-500">Seu assistente</span><button onClick={() => setShowHistory(false)} className="p-2 md:hidden" aria-label="Fechar histórico"><X size={18}/></button></div>
        <button disabled={working} onClick={() => pickChat(null)} className="flex items-center gap-3 rounded-xl border border-white/15 px-4 py-3 text-sm hover:bg-white/5 disabled:opacity-40"><Plus size={17}/> Nova conversa</button>
        <button onClick={() => setShowArchived(!showArchived)} className="mt-7 text-left text-xs text-stone-500 hover:text-white">{showArchived ? "Mostrar conversas ativas" : "Histórico · ver arquivadas"}</button>
        <nav className="mt-3 flex-1 space-y-1 overflow-y-auto">
          {chats.filter(c => c.archived === showArchived).map(chat => <button key={chat.id} disabled={working} onClick={() => pickChat(chat.id)} className={`flex w-full items-center gap-2 rounded-lg px-3 py-3 text-left text-sm ${active === chat.id ? "bg-white/10 text-white" : "text-stone-400 hover:bg-white/5"}`}><MessageSquare size={14} className="shrink-0"/><span className="truncate">{chat.title}</span></button>)}
          {chatNext && <button className="p-3 text-xs text-stone-400" onClick={() => void api(chatNext).then((p: Page<Chat>) => { setChats(old => [...old, ...p.results]); setChatNext(p.next); }).catch(e => setError(e.message))}>Mais conversas</button>}
        </nav>
        <p className="pt-4 text-xs leading-5 text-stone-600">Agenda, vendas e clientes.<br/>Você confirma cada alteração.</p>
      </aside>
      <section className={`${showHistory ? "hidden md:flex" : "flex"} min-w-0 flex-1 flex-col`}>
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-3"><button className="md:hidden" aria-label="Abrir histórico" onClick={() => setShowHistory(true)}><ChevronLeft size={20}/></button>
            {renaming ? <form onSubmit={e => { e.preventDefault(); if (title.trim()) void changeChat({ title: title.trim() }); }}><input aria-label="Título da conversa" maxLength={160} value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded bg-white/10 p-2 text-sm" autoFocus/><button className="text-xs text-stone-400" type="submit">Salvar título</button></form> : <div className="min-w-0"><h1 className="truncate text-sm font-medium">{current?.title || "Urus Assistente"}</h1><p className="mt-1 flex items-center gap-1.5 text-[10px] text-stone-500"><span className={`size-1.5 rounded-full ${working ? "bg-[#c8ba9a] motion-safe:animate-pulse" : "bg-emerald-400/70"}`}/>{working ? "Preparando sua resposta" : "Agenda, clientes e vendas em uma conversa"}</p></div>}
          </div>
          {active && <div className="flex gap-1"><button disabled={working} onClick={() => { setTitle(current?.title || ""); setRenaming(!renaming); }} aria-label="Renomear conversa" className="p-2 text-stone-400 hover:text-white"><Pencil size={16}/></button><button disabled={working} onClick={() => void changeChat({ archived: !current?.archived })} aria-label={current?.archived ? "Reabrir conversa" : "Arquivar conversa"} className="p-2 text-stone-400 hover:text-white"><Archive size={16}/></button></div>}
        </header>
        <div ref={scroll} className="min-h-0 flex-1 overflow-y-auto px-4 py-8 [overflow-anchor:none] sm:px-8" aria-live="polite" aria-busy={working}>
          {next && <button className="mx-auto mb-6 block text-xs text-stone-400" onClick={() => void api(next).then((p: Page<Message>) => { setMessages(old => [...p.results.reverse(), ...old]); setPinned(old => old === null ? null : old + p.results.length); setNext(p.next); }).catch(e => setError(e.message))}>Carregar mensagens anteriores</button>}
          {!messages.length && !loading && !optimistic && <div className="mx-auto flex h-full max-w-xl flex-col justify-center pb-10">
            <span className="mb-5 text-xs font-medium uppercase tracking-[.3em] text-stone-500">Mais tempo para atender</span><h2 className="text-3xl font-light leading-tight tracking-tight sm:text-4xl">O que vamos<br/><span className="text-stone-500">organizar hoje?</span></h2>
            <div className="mt-8 grid gap-2"><button onClick={() => setDraft("Mostre meus agendamentos de hoje")} className="rounded-xl border border-white/10 p-4 text-left text-sm text-stone-300 hover:border-white/30">Consultar minha agenda de hoje <span className="float-right text-stone-500">↗</span></button><button onClick={() => setDraft("Liste as vendas de hoje")} className="rounded-xl border border-white/10 p-4 text-left text-sm text-stone-300 hover:border-white/30">Ver as vendas do dia <span className="float-right text-stone-500">↗</span></button></div>
          </div>}
          <div className="mx-auto max-w-3xl space-y-7">
            {visibleMessages.map((message, messageIndex) => <div key={message.id} ref={messageIndex === pinned ? turn : undefined} className={messageIndex === pinned ? "scroll-mt-8" : undefined}><article className={message.role === "user" ? `${styles.messageEnter} ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-[#252724] px-5 py-3` : `${styles.responseEnter} pr-2`}>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.18em] text-stone-500">{message.role === "user" ? "Você" : "Urus"}</p>
              {message.role === "user" ? <div className="whitespace-pre-wrap break-words text-sm leading-7">{message.content}</div> : <MessageContent content={message.content} hasProposal={message.blocks.some(block => block.type === "proposal") || Boolean(message.id === latestAssistantId && pendingAction)}/>}
              {(message.role === "assistant" && message.id === latestAssistantId && pendingAction && !message.blocks.some(block => block.type === "proposal")
                ? [...message.blocks, { type: "proposal", action_id: pendingAction.id, summary: pendingAction.summary }]
                : message.blocks).map((block, index) => <div key={index}>
                {block.type === "clients" && Boolean(block.options?.length) && <QuestionFlow
                  questions={[{ id: "client", title: `Qual cliente deseja selecionar para “${block.query}”?`, options: block.options!.map(option => ({ label: option.name, value: String(option.id), description: `#${option.id} ${option.phone_hint}` })) }]}
                  disabled={working || Boolean(current?.archived) || message.id !== latestAssistantId}
                  onSubmit={async answers => {
                    const selected = block.options?.find(option => String(option.id) === answers[0].value);
                    await sendAnswers(selected ? `Seleciono o cliente ${selected.name} (#${selected.id}). Continue com os dados já informados.` : `Sobre o cliente: ${answers[0].value}`, selected?.id);
                  }}
                />}
                {block.type === "questions" && Boolean(block.questions?.length) && <QuestionFlow questions={block.questions!}
                  disabled={working || Boolean(current?.archived) || message.id !== latestAssistantId}
                  onSubmit={async answers => { await sendAnswers(answers.map(({ question, value }) => `${question.title}: ${question.options.find(option => option.value === value)?.label ?? value}`).join("\n")); }}
                />}
                {block.type === "proposal" && (() => {
                  const proposal = actions.find(a => a.id === block.action_id);
                  const summary = proposal?.summary ?? block.summary;
                  return summary ? <ProposalCard summary={summary} state={proposal?.state} content={message.content}/> : null;
                })()}
                {block.type === "result" && block.entity && <Link href={block.entity === "appointment" ? `/dashboard/agenda/${block.id}` : destinations[block.entity] || "/dashboard/home"} className="mt-3 inline-flex rounded-lg border border-white/15 px-4 py-2 text-sm text-[#ddd3bd]">Ver {block.entity === "appointment" ? "agenda" : block.entity === "sale" ? "vendas" : "clientes"} · #{block.id} ↗</Link>}
                {block.type === "result" && block.entity === "client" && <button disabled={working} onClick={() => void send("Continue o agendamento com o cliente cadastrado e os dados já informados.")} className="ml-3 text-sm text-stone-300 underline">Continuar agendamento</button>}
              </div>)}
              {message.status === "failed" && message.role === "assistant" && <button disabled={working} onClick={() => void send("Continue a solicitação anterior usando os dados já informados.")} className="mt-3 text-xs underline">Tentar novamente</button>}
            </article></div>)}
            <div ref={optimistic ? turn : undefined} className={pinned !== null ? "min-h-[calc(var(--chat-height,500px)-4rem)] scroll-mt-8 space-y-7" : "space-y-7"}>
              {optimistic && <article className={`${styles.messageEnter} ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-[#252724] px-5 py-3`}>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.18em] text-stone-500">Você</p>
                <p className="whitespace-pre-wrap break-words text-sm leading-7">{optimistic}</p>
              </article>}
              {working && <div role="status" aria-label="Urus está preparando a resposta" className={`${styles.responseEnter} flex items-center gap-3 py-3`}>
                <span className="flex size-8 items-center justify-center rounded-xl border border-[#c8ba9a]/20 bg-[#c8ba9a]/10 text-xs font-semibold text-[#ddd3bd]">U</span>
                <div><p className="mb-2 text-[10px] font-semibold uppercase tracking-[.16em] text-stone-500">Urus está pensando</p><div className="flex h-4 items-center gap-1.5" aria-hidden="true">{[0,1,2].map(dot => <span key={dot} className={`${styles.dot} size-1.5 rounded-full bg-[#ddd3bd]`}/>)}</div></div>
              </div>}
              {loading && !optimistic && <div className="flex items-center gap-3 text-sm text-stone-500"><LoaderCircle size={16} className="animate-spin"/>Abrindo conversa…</div>}
            </div>
            <div ref={tail}/>
          </div>
        </div>
        <div className="mx-auto w-full max-w-3xl px-4 pb-4 sm:px-6">
          {(error || dictation.error) && <p role="alert" aria-label="Erro do chat" className="mb-3 max-h-32 overflow-y-auto rounded-lg bg-red-950/40 px-4 py-3 text-sm text-red-200">{error || dictation.error}</p>}
          {pendingAction && !current?.archived && <section key={pendingAction.id} aria-label="Confirmar proposta pendente" className={`${styles.confirmEnter} mb-3 rounded-2xl border border-[#c8ba9a]/30 bg-[#24261f] p-3 sm:p-4`}>
            <div className="mb-3 flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-[#eee6d5]">{pendingAction.summary.operation || "Proposta pronta para confirmar"}</p><p className="mt-1 text-xs text-stone-400">{pendingAction.summary.overbooking ? "Inclui encaixe. Confira o aviso e os horários acima." : "Confira os dados acima. A alteração só acontece ao confirmar."}</p></div><Check size={18} className="shrink-0 text-[#c8ba9a]"/></div>
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={working} onClick={() => void decide(pendingAction.id, "confirm")} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#ddd3bd] px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-[#eee6d5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ddd3bd] disabled:opacity-40"><Check size={16}/>Confirmar</button>
              <button type="button" disabled={working} onClick={() => { setDraft("Quero corrigir a proposta: "); document.getElementById("assistant-composer")?.focus(); }} className="rounded-xl border border-white/15 px-3 py-2 text-xs text-stone-300 disabled:opacity-40">Corrigir</button>
              <button type="button" disabled={working} onClick={() => void decide(pendingAction.id, "cancel")} className="rounded-xl px-3 py-2 text-xs text-stone-400 disabled:opacity-40">Cancelar</button>
            </div>
          </section>}
          {showConfirmationReply && !current?.archived && !loading && !working && <div key={`reply-${lastMessage?.id}`} className={`${styles.confirmEnter} mb-3`}>
            <p className="mb-2 text-xs text-stone-400">Responder à proposta</p>
            <button type="button" onClick={() => void send("Confirmo a proposta apresentada.")} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#c8ba9a]/30 bg-[#ddd3bd] px-5 py-2 text-sm font-semibold text-stone-950 transition hover:bg-[#eee6d5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ddd3bd]"><Check size={16}/>Confirmar</button>
          </div>}
          {current?.archived ? <p className="py-4 text-center text-sm text-stone-500">Conversa arquivada. Use o botão no topo para reabri-la.</p> : <form onSubmit={e => { e.preventDefault(); void send(); }} className="rounded-2xl border border-white/15 bg-[#1a1c19] p-3 shadow-[0_12px_40px_-16px_rgba(0,0,0,.5)] transition-all focus-within:border-[#c8ba9a]/50 focus-within:ring-4 focus-within:ring-[#c8ba9a]/5">
            <textarea maxLength={12000} id="assistant-composer" aria-label="Mensagem" rows={2} value={draft} onChange={e => { if (dictation.listening) dictation.stop(); setDraft(e.target.value); }} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(); } }} placeholder="Peça um agendamento, consulte vendas…" className="w-full resize-none bg-transparent px-2 py-1 text-sm leading-6 outline-none placeholder:text-stone-600"/>
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><button type="button" disabled={!dictation.supported || working} onClick={() => dictation.listening ? dictation.stop() : dictation.start(draft)} aria-label={dictation.listening ? "Parar ditado" : "Ditar mensagem"} className={`rounded-lg p-2 disabled:opacity-30 ${dictation.listening ? "bg-red-500/20 text-red-300" : "text-stone-400 hover:bg-white/5"}`}>{dictation.listening ? <Square size={18}/> : <Mic size={18}/>}</button><span className="text-[11px] text-stone-600">{dictation.listening ? "Ouvindo… revise antes de enviar" : dictation.supported ? "Digite ou dite sua mensagem" : "Ditado indisponível neste navegador"}</span></div><button aria-label="Enviar mensagem" type="submit" disabled={!draft.trim() || working} className="rounded-xl bg-[#ddd3bd] p-2 text-stone-950 disabled:opacity-25"><ArrowUp size={20}/></button></div>
          </form>}
          <p className="mt-2 text-center text-[10px] text-stone-600">Revise nomes, datas e valores antes de confirmar.</p>
        </div>
      </section>
    </div>
  </DashboardShell>;
}
