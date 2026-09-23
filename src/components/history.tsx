import { removeGeneration } from "@/app/actions/generate";
import type { Generation } from "@/lib/db";
import { CopyButton } from "./copy-button";
import { Button } from "./ui";

const TONE_LABEL: Record<string, string> = {
  profissional: "Profissional",
  descontraido: "Descontraído",
  luxo: "Luxo",
  tecnico: "Técnico",
  persuasivo: "Persuasivo",
};

export function History({ items }: { items: Generation[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">Nenhuma descrição gerada ainda.</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((g) => (
        <li key={g.id} className="rounded-2xl border border-slate-200 bg-white">
          <details>
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 px-5 py-4">
              <span className="font-medium">{g.product_name}</span>
              <span className="flex items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-700">
                  {TONE_LABEL[g.tone] ?? g.tone}
                </span>
                {new Date(g.created_at + "Z").toLocaleString("pt-BR")}
              </span>
            </summary>
            <div className="border-t border-slate-100 px-5 py-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{g.result}</p>
              <div className="mt-4 flex gap-2">
                <CopyButton text={g.result} />
                <form action={removeGeneration.bind(null, g.id)}>
                  <Button type="submit" variant="ghost" className="text-red-600 hover:bg-red-50">
                    Excluir
                  </Button>
                </form>
              </div>
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
