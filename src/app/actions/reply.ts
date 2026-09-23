"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal";
import { createReply, deleteReply, getBusiness } from "@/lib/db";
import { analyzeCustomerMessage, type Analysis } from "@/lib/gemini";
import { fieldErrors, replySchema } from "@/lib/validation";

export type ReplyState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  result?: Analysis;
} | undefined;

export async function answerCustomer(_: ReplyState, formData: FormData): Promise<ReplyState> {
  const user = await requireUser();
  const business = getBusiness(user.id);
  if (!business) return { error: "Cadastre as informações do seu negócio antes de responder clientes." };

  const parsed = replySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  let result: Analysis;
  try {
    result = await analyzeCustomerMessage({ business, ...parsed.data });
  } catch (err) {
    console.error("Erro ao chamar o Gemini:", err);
    return { error: friendlyError(err) };
  }

  createReply({
    user_id: user.id,
    channel: parsed.data.channel,
    customer_message: parsed.data.message,
    intent: result.intent,
    sentiment: result.sentiment,
    urgency: result.urgency,
    summary: result.summary,
    reply: result.reply,
    missing_info: JSON.stringify(result.missingInfo),
  });
  revalidatePath("/dashboard");
  return { result };
}

export async function removeReply(id: number) {
  const user = await requireUser();
  deleteReply(id, user.id);
  revalidatePath("/dashboard");
}

function friendlyError(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("GEMINI_API_KEY")) return "Chave da API do Gemini não configurada no servidor.";
  if (msg.includes("429") || /quota|rate/i.test(msg))
    return "Limite gratuito da API atingido. Aguarde um minuto e tente novamente.";
  if (/503|504|UNAVAILABLE|high demand|Deadline|abort/i.test(msg))
    return "A IA está sobrecarregada no momento. Tente novamente em alguns segundos.";
  if (msg.includes("API key") || msg.includes("401") || msg.includes("403"))
    return "Chave da API do Gemini inválida.";
  return "Não foi possível gerar a resposta agora. Tente novamente.";
}
