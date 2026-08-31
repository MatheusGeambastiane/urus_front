"use client";

import { ChangeEvent, DragEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  File,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  Filter,
  LoaderCircle,
  Eye,
  Info,
  Plus,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import { env } from "@/lib/env";
import { DashboardShell } from "@/src/features/dashboard/components/DashboardShell";
import { useAuth } from "@/src/features/shared/hooks/useAuth";

type DocumentItem = {
  id: number;
  file: string;
  name: string;
  comment: string;
  file_size: number;
  file_type: string;
  category: string;
  category_display: string;
  created_at: string;
  created_by_name: string | null;
};

type DocumentsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: DocumentItem[];
};

type Choices = {
  categories: Array<{ value: string; label: string }>;
  file_types: string[];
};

const FALLBACK_CATEGORIES = [
  { value: "document", label: "Documento" },
  { value: "contract", label: "Contrato" },
  { value: "invoice", label: "Nota fiscal" },
  { value: "report", label: "Relatório" },
  { value: "other", label: "Outros" },
];

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const PAGE_SIZE = 12;

function fileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function documentIcon(fileType: string) {
  if (["xls", "xlsx", "csv", "ods"].includes(fileType)) return FileSpreadsheet;
  if (["jpg", "jpeg", "png", "webp"].includes(fileType)) return FileImage;
  if (fileType === "zip") return FileArchive;
  if (["pdf", "doc", "docx", "odt", "rtf", "txt"].includes(fileType)) return FileText;
  return File;
}

async function responseMessage(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { detail?: string; file?: string[]; files?: string[] };
    return payload.detail ?? payload.file?.[0] ?? payload.files?.[0] ?? fallback;
  } catch {
    return fallback;
  }
}

export function DocumentsPage() {
  const { accessToken, fetchWithAuth, profilePic, userRole } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [choices, setChoices] = useState<Choices>({ categories: FALLBACK_CATEGORIES, file_types: [] });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [fileType, setFileType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadCategory, setUploadCategory] = useState("document");
  const [fileCategories, setFileCategories] = useState<Record<string, string>>({});
  const [uploadName, setUploadName] = useState("");
  const [comment, setComment] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), page_size: String(PAGE_SIZE) });
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (fileType) params.set("file_type", fileType);
    if (startDate) params.set("start_date", startDate);
    if (endDate) params.set("end_date", endDate);
    return params.toString();
  }, [category, endDate, fileType, page, search, startDate]);

  const loadDocuments = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth(`${env.apiBaseUrl}/dashboard/documents/?${query}`, {
        cache: "no-store",
        headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) throw new Error(await responseMessage(response, "Não foi possível carregar os documentos."));
      const payload = (await response.json()) as DocumentsResponse;
      setDocuments(payload.results);
      setTotal(payload.count);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Falha ao carregar documentos.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, fetchWithAuth, query]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    if (!accessToken) return;
    const controller = new AbortController();
    void fetchWithAuth(`${env.apiBaseUrl}/dashboard/documents/choices/`, {
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
    }).then(async (response) => {
      if (response.ok) setChoices((await response.json()) as Choices);
    }).catch(() => undefined);
    return () => controller.abort();
  }, [accessToken, fetchWithAuth]);

  const addFiles = (incomingFiles: File[]) => {
    const validFiles = incomingFiles.filter((item) => item.size <= MAX_FILE_BYTES);
    if (validFiles.length !== incomingFiles.length) setError("Cada arquivo deve ter no máximo 25 MB.");
    setFileCategories((current) => {
      const next = { ...current };
      validFiles.forEach((item) => {
        if (!next[fileKey(item)]) next[fileKey(item)] = uploadCategory;
      });
      return next;
    });
    setFiles((current) => {
      const known = new Set(current.map(fileKey));
      return [...current, ...validFiles.filter((item) => !known.has(fileKey(item)))];
    });
  };

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    addFiles(Array.from(event.dataTransfer.files));
  };

  const closeUpload = (force = false) => {
    if (uploading && !force) return;
    setUploadOpen(false);
    setFiles([]);
    setFileCategories({});
    setUploadName("");
    setComment("");
  };

  const uploadFiles = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken || files.length === 0) return;
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.set("category", uploadCategory);
    formData.set("comment", comment);
    let endpoint = `${env.apiBaseUrl}/dashboard/documents/bulk-upload/`;
    if (files.length === 1) {
      endpoint = `${env.apiBaseUrl}/dashboard/documents/`;
      formData.set("file", files[0]);
      if (uploadName.trim()) formData.set("name", uploadName.trim());
    } else {
      files.forEach((item) => {
        formData.append("files", item);
        formData.append("categories", fileCategories[fileKey(item)] ?? uploadCategory);
      });
    }

    try {
      const response = await fetchWithAuth(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });
      if (!response.ok) throw new Error(await responseMessage(response, "Não foi possível enviar os arquivos."));
      const uploadedCount = files.length;
      closeUpload(true);
      setFeedback(`${uploadedCount} ${uploadedCount === 1 ? "documento enviado" : "documentos enviados"} com sucesso.`);
      setPage(1);
      await loadDocuments();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Falha no upload.");
    } finally {
      setUploading(false);
    }
  };

  const previewLocalPdf = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    window.open(previewUrl, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(previewUrl), 60_000);
  };

  const applyCategoryToAll = (value: string) => {
    setUploadCategory(value);
    setFileCategories(Object.fromEntries(files.map((item) => [fileKey(item), value])));
  };

  const deleteDocument = async (document: DocumentItem) => {
    if (!accessToken || !window.confirm(`Excluir “${document.name}”?`)) return;
    const response = await fetchWithAuth(`${env.apiBaseUrl}/dashboard/documents/${document.id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      setError(await responseMessage(response, "Não foi possível excluir o documento."));
      return;
    }
    setFeedback("Documento excluído.");
    await loadDocuments();
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setCategory("");
    setFileType("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = Boolean(search || category || fileType || startDate || endDate);

  return (
    <DashboardShell activeTab="documents" profilePic={profilePic} userRole={userRole} desktopVariant="luxury">
      <section className="space-y-4 [font-family:var(--font-dashboard-body)]">
        <div className="flex justify-end">
          <button type="button" onClick={() => setUploadOpen(true)} className="flex items-center justify-center gap-2 rounded-xl bg-[#f3f3f1] px-4 py-2.5 text-sm font-bold text-[#090909] transition hover:bg-white">
            <Plus className="h-4 w-4" /> Adicionar
          </button>
        </div>

        {feedback ? <div className="flex items-center justify-between rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100"><span>{feedback}</span><button type="button" onClick={() => setFeedback(null)} aria-label="Fechar aviso"><X className="h-4 w-4" /></button></div> : null}
        {error ? <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-300/20 bg-red-300/10 px-4 py-3 text-sm text-red-100"><span>{error}</span><button type="button" onClick={() => setError(null)} aria-label="Fechar erro"><X className="h-4 w-4" /></button></div> : null}

        <div className="relative rounded-[24px] border border-white/10 bg-white/[0.025] p-4 lg:p-5">
          <form onSubmit={(event) => { event.preventDefault(); setPage(1); setSearch(searchInput.trim()); }} className="grid gap-3 lg:grid-cols-[minmax(240px,1.5fr)_repeat(4,minmax(130px,0.7fr))_auto]">
            <label className="relative">
              <span className="sr-only">Pesquisar pelo nome do arquivo</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Pesquisar pelo nome..." className="h-11 w-full rounded-xl border border-white/10 bg-black/25 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/28 focus:border-white/30" />
            </label>
            <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }} aria-label="Filtrar por categoria" className="h-11 rounded-xl border border-white/10 bg-[#111] px-3 text-sm text-white/75 outline-none focus:border-white/30">
              <option value="">Todas as categorias</option>
              {choices.categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            <select value={fileType} onChange={(event) => { setFileType(event.target.value); setPage(1); }} aria-label="Filtrar por tipo" className="h-11 rounded-xl border border-white/10 bg-[#111] px-3 text-sm uppercase text-white/75 outline-none focus:border-white/30">
              <option value="">Todos os tipos</option>
              {choices.file_types.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <label className="relative"><span className="sr-only">Data inicial</span><input type="date" value={startDate} onChange={(event) => { setStartDate(event.target.value); setPage(1); }} className="h-11 w-full rounded-xl border border-white/10 bg-[#111] px-3 text-sm text-white/65 outline-none [color-scheme:dark] focus:border-white/30" /></label>
            <label className="relative"><span className="sr-only">Data final</span><input type="date" value={endDate} min={startDate || undefined} onChange={(event) => { setEndDate(event.target.value); setPage(1); }} className="h-11 w-full rounded-xl border border-white/10 bg-[#111] px-3 text-sm text-white/65 outline-none [color-scheme:dark] focus:border-white/30" /></label>
            <button type="submit" className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.075] px-4 text-sm font-semibold text-white hover:bg-white/[0.12]"><Filter className="h-4 w-4" /> Filtrar</button>
          </form>
          {hasFilters ? <button type="button" onClick={clearFilters} className="mt-3 text-xs font-semibold text-white/45 underline decoration-white/20 underline-offset-4 hover:text-white">Limpar todos os filtros</button> : null}
        </div>

        <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.02]">
          <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
            <div><h2 className="font-semibold text-white">Biblioteca</h2><p className="mt-0.5 text-xs text-white/38">{total} {total === 1 ? "arquivo" : "arquivos"}</p></div>
            <CalendarDays className="h-5 w-5 text-white/30" />
          </div>

          {loading ? <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-40 animate-pulse rounded-2xl bg-white/[0.035]" />)}</div> : null}
          {!loading && documents.length === 0 ? <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]"><FileText className="h-6 w-6 text-white/45" /></div><h3 className="mt-4 font-semibold text-white">Nenhum documento encontrado</h3><p className="mt-1 max-w-sm text-sm text-white/40">Ajuste os filtros ou adicione o primeiro arquivo ao acervo.</p></div> : null}
          {!loading && documents.length > 0 ? <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">{documents.map((document) => {
            const Icon = documentIcon(document.file_type);
            return <article key={document.id} onClick={() => setSelectedDocument(document)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedDocument(document); }} role="button" tabIndex={0} className="group flex min-h-44 cursor-pointer flex-col rounded-[20px] border border-white/[0.08] bg-[linear-gradient(150deg,rgba(255,255,255,0.048),rgba(255,255,255,0.014))] p-4 text-left transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 [content-visibility:auto]">
              <div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/25"><Icon className="h-5 w-5 text-white/65" /></span><div className="min-w-0 flex-1"><h3 title={document.name} className="truncate text-sm font-semibold text-white/88">{document.name}</h3><div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/38"><span>{document.file_type}</span><span>·</span><span>{formatBytes(document.file_size)}</span></div></div><button type="button" onClick={(event) => { event.stopPropagation(); void deleteDocument(document); }} aria-label={`Excluir ${document.name}`} className="rounded-lg p-2 text-white/25 opacity-100 transition hover:bg-red-400/10 hover:text-red-200 lg:opacity-0 lg:group-hover:opacity-100"><Trash2 className="h-4 w-4" /></button></div>
              {document.comment ? <p className="mt-3 line-clamp-2 text-xs leading-5 text-white/40">{document.comment}</p> : <div className="flex-1" />}
              <div className="mt-auto flex items-end justify-between gap-3 pt-4"><div className="min-w-0"><span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold text-white/55">{document.category_display}</span><p className="mt-2 truncate text-[10px] text-white/28">{formatDate(document.created_at)}{document.created_by_name ? ` · ${document.created_by_name}` : ""}</p></div><a href={document.file} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} aria-label={`Baixar ${document.name}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-white/55 transition hover:border-white/25 hover:bg-white/10 hover:text-white"><Download className="h-4 w-4" /></a></div>
            </article>;
          })}</div> : null}

          {totalPages > 1 ? <div className="flex items-center justify-between border-t border-white/[0.08] px-5 py-4"><button type="button" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/65 disabled:cursor-not-allowed disabled:opacity-30"><ChevronLeft className="h-4 w-4" /> Anterior</button><span className="text-xs text-white/38">Página {page} de {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/65 disabled:cursor-not-allowed disabled:opacity-30">Próxima <ChevronRight className="h-4 w-4" /></button></div> : null}
        </div>
      </section>

      {uploadOpen ? <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="upload-title"><form onSubmit={(event) => void uploadFiles(event)} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[28px] border border-white/12 bg-[#11110f] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.8)] sm:rounded-[28px] sm:p-6"><div className="flex items-start justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.27em] text-white/38">Novo envio</p><h2 id="upload-title" className="mt-1 text-2xl font-semibold tracking-tight text-white">Adicionar documentos</h2></div><button type="button" onClick={() => closeUpload()} aria-label="Fechar" className="rounded-xl border border-white/10 p-2 text-white/50 hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button></div>
        <input ref={fileInputRef} type="file" multiple className="sr-only" onChange={handleFileInput} accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.rtf,.odt,.ods,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.xml,.zip" />
        <div onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false); }} onDrop={handleDrop} className={`mt-6 flex min-h-48 flex-col items-center justify-center rounded-[22px] border border-dashed px-6 text-center transition ${dragging ? "border-white/55 bg-white/[0.09]" : "border-white/16 bg-black/20 hover:border-white/30"}`}><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.07]"><UploadCloud className="h-6 w-6 text-white/65" /></div><p className="mt-4 text-sm font-semibold text-white">Arraste os arquivos para cá</p><p className="mt-1 text-xs text-white/38">ou selecione no dispositivo · até 25 MB cada</p><button type="button" onClick={() => fileInputRef.current?.click()} className="mt-4 rounded-xl border border-white/12 bg-white/[0.055] px-4 py-2 text-xs font-semibold text-white/75 hover:bg-white/10">Selecionar arquivos</button></div>
        {files.length > 0 ? <div className="mt-4 space-y-2"><div className="flex items-center justify-between text-xs"><span className="font-semibold text-white/65">{files.length} {files.length === 1 ? "arquivo selecionado" : "arquivos selecionados"}</span><button type="button" onClick={() => { setFiles([]); setFileCategories({}); }} className="text-white/38 underline hover:text-white">Limpar</button></div>
          {files.length > 1 ? <label className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-xs font-medium text-white/55"><span>Categoria para todos</span><select value={uploadCategory} onChange={(event) => applyCategoryToAll(event.target.value)} className="h-9 min-w-40 rounded-lg border border-white/10 bg-[#171715] px-2 text-xs text-white outline-none focus:border-white/30">{choices.categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label> : null}
          <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">{files.map((item, index) => {
            const isPdf = item.type === "application/pdf" || item.name.toLocaleLowerCase().endsWith(".pdf");
            return <div key={fileKey(item)} className="grid items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto_auto]"><File className="h-4 w-4 shrink-0 text-white/42" /><div className="min-w-0"><p className="truncate text-xs text-white/68">{item.name}</p><p className="mt-0.5 text-[10px] text-white/30">{formatBytes(item.size)}</p></div>{files.length > 1 ? <select value={fileCategories[fileKey(item)] ?? uploadCategory} onChange={(event) => setFileCategories((current) => ({ ...current, [fileKey(item)]: event.target.value }))} aria-label={`Categoria de ${item.name}`} className="h-8 min-w-36 rounded-lg border border-white/10 bg-[#171715] px-2 text-[11px] text-white/70 outline-none focus:border-white/30">{choices.categories.map((categoryItem) => <option key={categoryItem.value} value={categoryItem.value}>{categoryItem.label}</option>)}</select> : null}{isPdf ? <button type="button" onClick={() => previewLocalPdf(item)} className="flex h-8 items-center gap-1.5 rounded-lg border border-white/10 px-2.5 text-[11px] font-semibold text-white/55 hover:bg-white/[0.07] hover:text-white"><Eye className="h-3.5 w-3.5" /> Preview</button> : <span /> }<button type="button" onClick={() => { setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index)); setFileCategories((current) => { const next = { ...current }; delete next[fileKey(item)]; return next; }); }} aria-label={`Remover ${item.name}`} className="justify-self-end text-white/30 hover:text-white"><X className="h-4 w-4" /></button></div>;
          })}</div></div> : null}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">{files.length <= 1 ? <label className="space-y-1.5 text-xs font-medium text-white/48">Categoria<select value={uploadCategory} onChange={(event) => setUploadCategory(event.target.value)} className="block h-11 w-full rounded-xl border border-white/10 bg-[#171715] px-3 text-sm text-white outline-none focus:border-white/30">{choices.categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label> : <div className="flex items-end pb-2 text-xs leading-5 text-white/30">Cada arquivo pode ter sua própria categoria.</div>}{files.length === 1 ? <label className="space-y-1.5 text-xs font-medium text-white/48">Nome opcional<input value={uploadName} onChange={(event) => setUploadName(event.target.value)} placeholder={files[0]?.name} maxLength={255} className="block h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/30" /></label> : <div className="flex items-end pb-2 text-xs leading-5 text-white/30">Os nomes serão preenchidos automaticamente.</div>}</div>
        <label className="mt-4 block space-y-1.5 text-xs font-medium text-white/48">Comentário opcional<textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={3} maxLength={2000} placeholder="Adicione uma observação para este envio..." className="block w-full resize-none rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/30" /></label>
        <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => closeUpload()} disabled={uploading} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/55 hover:bg-white/5">Cancelar</button><button type="submit" disabled={files.length === 0 || uploading} className="flex min-w-32 items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-40">{uploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}{uploading ? "Enviando..." : "Enviar"}</button></div></form></div> : null}

      {selectedDocument ? <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="document-detail-title"><div className="w-full max-w-lg rounded-t-[28px] border border-white/12 bg-[#11110f] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.8)] sm:rounded-[28px] sm:p-6"><div className="flex items-start gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]"><Info className="h-5 w-5 text-white/55" /></span><div className="min-w-0 flex-1"><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">Detalhes do arquivo</p><h2 id="document-detail-title" className="mt-1 truncate text-xl font-semibold text-white">{selectedDocument.name}</h2><p className="mt-1 text-xs uppercase tracking-[0.08em] text-white/35">{selectedDocument.file_type} · {formatBytes(selectedDocument.file_size)}</p></div><button type="button" onClick={() => setSelectedDocument(null)} aria-label="Fechar detalhes" className="rounded-xl border border-white/10 p-2 text-white/45 hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button></div>
        <dl className="mt-6 divide-y divide-white/[0.07] rounded-2xl border border-white/[0.08] bg-black/15 px-4"><div className="flex items-center justify-between gap-4 py-3"><dt className="text-xs text-white/38">Categoria</dt><dd className="text-sm font-medium text-white/75">{selectedDocument.category_display}</dd></div><div className="flex items-center justify-between gap-4 py-3"><dt className="text-xs text-white/38">Criado por</dt><dd className="text-right text-sm font-medium text-white/75">{selectedDocument.created_by_name ?? "Não informado"}</dd></div><div className="flex items-center justify-between gap-4 py-3"><dt className="text-xs text-white/38">Criado em</dt><dd className="text-right text-sm font-medium text-white/75">{formatDate(selectedDocument.created_at)}</dd></div></dl>
        {selectedDocument.comment ? <div className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/32">Comentário</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/65">{selectedDocument.comment}</p></div> : null}
        <div className="mt-5 flex justify-end gap-2">{selectedDocument.file_type === "pdf" ? <a href={selectedDocument.file} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl border border-white/12 px-4 py-2.5 text-sm font-semibold text-white/65 hover:bg-white/[0.06] hover:text-white"><Eye className="h-4 w-4" /> Visualizar</a> : null}<a href={selectedDocument.file} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black"><Download className="h-4 w-4" /> Baixar</a></div></div></div> : null}
    </DashboardShell>
  );
}
