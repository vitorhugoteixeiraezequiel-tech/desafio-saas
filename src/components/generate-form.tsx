"use client";

import { useActionState, useState } from "react";
import { generate } from "@/app/actions/generate";
import { CopyButton } from "./copy-button";
import { Alert, Button, Card, Field, Select, TextArea } from "./ui";

const TONE_OPTIONS = [
  ["profissional", "Profissional"],
  ["descontraido", "Descontraído"],
  ["luxo", "Luxo / Premium"],
  ["tecnico", "Técnico"],
  ["persuasivo", "Persuasivo"],
] as const;

export function GenerateForm() {
  const [state, action, pending] = useActionState(generate, undefined);
  // Campos controlados para não perder o que foi digitado após o envio.
  const [values, setValues] = useState({ productName: "", details: "", tone: "profissional" });
  const fe = state?.fieldErrors;

  const set = (key: keyof typeof values) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <form action={action} className="space-y-4">
          <Field
            label="Nome do produto"
            name="productName"
            placeholder="Ex.: Caneca térmica de inox 500ml"
            value={values.productName}
            onChange={set("productName")}
            errors={fe?.productName}
          />
          <TextArea
            label="Características"
            name="details"
            placeholder="Ex.: mantém a bebida quente por 6h, tampa antivazamento, disponível em 4 cores, livre de BPA"
            value={values.details}
            onChange={set("details")}
            errors={fe?.details}
          />
          <Select label="Tom de voz" name="tone" value={values.tone} onChange={set("tone")} errors={fe?.tone}>
            {TONE_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          {state?.error && <Alert type="error">{state.error}</Alert>}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Gerando com IA..." : "Gerar descrição"}
          </Button>
        </form>
      </Card>

      <Card className="flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Resultado</h3>
          {state?.result && !pending && <CopyButton text={state.result} />}
        </div>
        <div className="mt-4 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
          {pending ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 w-2/3 rounded bg-slate-200" />
              <div className="h-4 w-full rounded bg-slate-200" />
              <div className="h-4 w-5/6 rounded bg-slate-200" />
              <div className="h-4 w-3/4 rounded bg-slate-200" />
            </div>
          ) : state?.result ? (
            state.result
          ) : (
            <p className="text-slate-400">A descrição gerada aparecerá aqui.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
