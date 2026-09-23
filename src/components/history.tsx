import { removeReply } from "@/app/actions/reply";
import type { Reply } from "@/lib/db";
import { BADGE_COLOR, CHANNEL_LABEL, INTENT_LABEL } from "@/lib/labels";
import { AnalysisView } from "./analysis-view";
import { Badge, Button } from "./ui";

export function History({ items }: { items: Reply[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">Nenhum atendimento ainda.</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((r) => (
        <li key={r.id} className="rounded-2xl border border-slate-200 bg-white">
          <details>
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 px-5 py-4">
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{r.summary}</span>
              <span className="flex items-center gap-2 text-xs text-slate-500">
                <Badge className={BADGE_COLOR[r.intent]}>{INTENT_LABEL[r.intent] ?? r.intent}</Badge>
                <Badge>{CHANNEL_LABEL[r.channel] ?? r.channel}</Badge>
                {new Date(r.created_at + "Z").toLocaleString("pt-BR")}
              </span>
            </summary>
            <div className="space-y-4 border-t border-slate-100 px-5 py-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Mensagem do cliente
                </span>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{r.customer_message}</p>
              </div>
              <AnalysisView
                intent={r.intent}
                sentiment={r.sentiment}
                urgency={r.urgency}
                summary={r.summary}
                reply={r.reply}
                missingInfo={JSON.parse(r.missing_info) as string[]}
              />
              <form action={removeReply.bind(null, r.id)}>
                <Button type="submit" variant="ghost" className="text-red-600 hover:bg-red-50">
                  Excluir do histórico
                </Button>
              </form>
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
