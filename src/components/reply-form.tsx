"use client";

import { useActionState, useState } from "react";
import { answerCustomer } from "@/app/actions/reply";
import { CHANNEL_OPTIONS, EXAMPLE_MESSAGES } from "@/lib/labels";
import { AnalysisView } from "./analysis-view";
import { Alert, Button, Card, Select, TextArea } from "./ui";

export function ReplyForm({ showExamples }: { showExamples: boolean }) {
  const [state, action, pending] = useActionState(answerCustomer, undefined);
  // Campos controlados para não perder o que foi digitado após o envio.
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState("whatsapp");
  const fe = state?.fieldErrors;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <form action={action} className="space-y-4">
          <TextArea
            label="Mensagem do cliente"
            name="message"
            rows={7}
            placeholder="Cole aqui a mensagem que o cliente enviou..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            errors={fe?.message}
          />
          {showExamples && (
            <div className="space-y-1">
              <span className="text-xs text-slate-500">Testar com uma mensagem de exemplo:</span>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_MESSAGES.map(([label, text]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setMessage(text)}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-indigo-300 hover:text-indigo-700"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <Select label="Canal" name="channel" value={channel} onChange={(e) => setChannel(e.target.value)} errors={fe?.channel}>
            {CHANNEL_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          {state?.error && <Alert type="error">{state.error}</Alert>}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Analisando e escrevendo..." : "Gerar resposta"}
          </Button>
        </form>
      </Card>

      <Card>
        <h3 className="mb-4 font-semibold">Resultado</h3>
        {pending ? (
          <div className="animate-pulse space-y-3">
            <div className="flex gap-2">
              <div className="h-5 w-20 rounded-full bg-slate-200" />
              <div className="h-5 w-16 rounded-full bg-slate-200" />
              <div className="h-5 w-24 rounded-full bg-slate-200" />
            </div>
            <div className="h-4 w-3/4 rounded bg-slate-200" />
            <div className="h-28 w-full rounded-xl bg-slate-200" />
          </div>
        ) : state?.result ? (
          <AnalysisView {...state.result} />
        ) : (
          <p className="text-sm text-slate-400">
            A IA vai classificar a mensagem e sugerir uma resposta pronta para enviar.
          </p>
        )}
      </Card>
    </div>
  );
}
