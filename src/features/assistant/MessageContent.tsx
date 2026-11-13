import { Fragment } from "react";
import { AlertTriangle } from "lucide-react";

export function visibleMessageText(content: string) {
  return content.split(/Dados estruturados do sistema\s*:/i)[0].trim();
}

export function messageFields(content: string) {
  return visibleMessageText(content).split("\n").flatMap(line => {
    const match = line.match(/^\s*[-*]\s+\*\*([^*]+?):?\*\*\s*:?\s*(.+)$/);
    return match ? [{ label: match[1].replace(/:$/, ""), value: match[2] }] : [];
  });
}

function InlineText({ text }: { text: string }) {
  return <>{text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => part.startsWith("**") && part.endsWith("**")
    ? <strong key={index} className="font-semibold text-stone-100">{part.slice(2, -2)}</strong>
    : <Fragment key={index}>{part}</Fragment>)}</>;
}

export function MessageContent({ content, hasProposal = false }: { content: string; hasProposal?: boolean }) {
  const text = visibleMessageText(content);
  const sections = text.split(/\n\s*\n/).filter(Boolean);
  return <div className="space-y-3 text-sm leading-7">
    {sections.map((section, index) => {
      const fields = messageFields(section);
      const remaining = section.split("\n").filter(line => !messageFields(line).length).join("\n").trim();
      return <Fragment key={index}>
        {remaining && <div className={remaining.includes("⚠") ? "flex items-start gap-2.5 rounded-xl border border-amber-400/20 bg-amber-400/[.06] px-4 py-3 text-amber-100/90" : "whitespace-pre-wrap break-words text-stone-300"}>
          {remaining.includes("⚠") && <AlertTriangle size={17} className="mt-1 shrink-0 text-amber-300" aria-hidden="true"/>}
          <div><InlineText text={remaining.replace(/^⚠️?\s*/, "")}/></div>
        </div>}
        {!!fields.length && !hasProposal && <dl className="overflow-hidden rounded-xl border border-white/10 bg-white/[.025]">
          {fields.map((field, i) => <div key={i} className="grid gap-1 border-b border-white/[.06] px-4 py-3 last:border-0 sm:grid-cols-[140px_1fr] sm:gap-4"><dt className="text-xs text-stone-500">{field.label}</dt><dd className="min-w-0 break-words text-sm text-stone-100"><InlineText text={field.value}/></dd></div>)}
        </dl>}
      </Fragment>;
    })}
  </div>;
}
