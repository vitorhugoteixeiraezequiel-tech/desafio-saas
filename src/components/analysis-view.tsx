import {
  BADGE_COLOR,
  INTENT_LABEL,
  SENTIMENT_LABEL,
  URGENCY_LABEL,
} from "@/lib/labels";
import { CopyButton } from "./copy-button";
import { Badge } from "./ui";

type Props = {
  intent: string;
  sentiment: string;
  urgency: string;
  summary: string;
  reply: string;
  missingInfo: string[];
};

/** Classificação da mensagem + resposta sugerida pela IA. */
export function AnalysisView({ intent, sentiment, urgency, summary, reply, missingInfo }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge className={BADGE_COLOR[intent]}>{INTENT_LABEL[intent] ?? intent}</Badge>
        <Badge className={BADGE_COLOR[sentiment]}>{SENTIMENT_LABEL[sentiment] ?? sentiment}</Badge>
        <Badge className={BADGE_COLOR[urgency]}>{URGENCY_LABEL[urgency] ?? urgency}</Badge>
      </div>
      <p className="text-sm text-slate-500">
        <span className="font-medium text-slate-700">Cliente quer:</span> {summary}
      </p>

      <div className="rounded-xl bg-slate-50 p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Resposta sugerida</span>
          <CopyButton text={reply} />
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{reply}</p>
      </div>

      {missingInfo.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">Informações que faltam no cadastro do negócio:</p>
          <ul className="mt-1 list-disc pl-5">
            {missingInfo.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs">Adicione em &quot;Meu negócio&quot; para a IA responder isso da próxima vez.</p>
        </div>
      )}
    </div>
  );
}
