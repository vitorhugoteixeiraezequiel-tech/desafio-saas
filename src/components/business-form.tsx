"use client";

import { useActionState, useState } from "react";
import { updateBusiness } from "@/app/actions/business";
import { EXAMPLE_BUSINESS, TONE_OPTIONS } from "@/lib/labels";
import { Alert, Button, Card, Field, Select, TextArea } from "./ui";

type Values = { name: string; segment: string; tone: string; info: string };

export function BusinessForm({ initial }: { initial?: Values }) {
  const [state, action, pending] = useActionState(updateBusiness, undefined);
  const [values, setValues] = useState<Values>(
    initial ?? { name: "", segment: "", tone: "amigavel", info: "" },
  );
  const fe = state?.fieldErrors;

  const set = (key: keyof Values) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  return (
    <Card>
      <form action={action} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome da empresa" name="name" value={values.name} onChange={set("name")} errors={fe?.name} />
          <Field
            label="Ramo de atuação"
            name="segment"
            placeholder="Ex.: Pizzaria com delivery"
            value={values.segment}
            onChange={set("segment")}
            errors={fe?.segment}
          />
        </div>
        <Select label="Tom de voz da marca" name="tone" value={values.tone} onChange={set("tone")} errors={fe?.tone}>
          {TONE_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <TextArea
          label="Informações que a IA pode usar nas respostas"
          name="info"
          rows={12}
          placeholder="Horários, endereço, formas de pagamento, entrega, preços, produtos, políticas de troca, perguntas frequentes..."
          value={values.info}
          onChange={set("info")}
          errors={fe?.info}
        />
        <p className="text-xs text-slate-500">
          A IA responde usando <strong>somente</strong> o que estiver aqui. Quando o cliente perguntar algo que
          não está descrito, ela avisa que vai verificar com a equipe e mostra o que está faltando.
        </p>
        {state?.success && <Alert type="success">{state.success}</Alert>}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar informações"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="border border-slate-200"
            onClick={() => setValues(EXAMPLE_BUSINESS)}
          >
            Preencher com exemplo
          </Button>
        </div>
      </form>
    </Card>
  );
}
