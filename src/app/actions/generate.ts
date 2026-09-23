"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal";
import { createGeneration, deleteGeneration } from "@/lib/db";
import { generateProductDescription } from "@/lib/gemini";
import { fieldErrors, generateSchema } from "@/lib/validation";

export type GenerateState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  result?: string;
} | undefined;

export async function generate(_: GenerateState, formData: FormData): Promise<GenerateState> {
  const user = await requireUser();
  const parsed = generateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  let result: string;
  try {
    result = await generateProductDescription(parsed.data);
  } catch (err) {
    console.error("Erro ao chamar o Gemini:", err);
    return { error: friendlyError(err) };
  }

  createGeneration({
    user_id: user.id,
    product_name: parsed.data.productName,
    details: parsed.data.details,
    tone: parsed.data.tone,
    result,
  });
  revalidatePath("/dashboard");
  return { result };
}

export async function removeGeneration(id: number) {
  const user = await requireUser();
  deleteGeneration(id, user.id);
  revalidatePath("/dashboard");
}

function friendlyError(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("GEMINI_API_KEY")) return "Chave da API do Gemini não configurada no servidor.";
  if (msg.includes("429") || /quota|rate/i.test(msg))
    return "Limite gratuito da API atingido. Aguarde um minuto e tente novamente.";
  if (/503|UNAVAILABLE|high demand/i.test(msg))
    return "A IA está sobrecarregada no momento. Tente novamente em alguns segundos.";
  if (msg.includes("API key") || msg.includes("401") || msg.includes("403"))
    return "Chave da API do Gemini inválida.";
  return "Não foi possível gerar a descrição agora. Tente novamente.";
}
