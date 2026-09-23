import "server-only";
import { GoogleGenAI } from "@google/genai";

const MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";
// Usado quando o modelo principal está sobrecarregado (erro 503), comum no plano gratuito.
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || "gemini-flash-lite-latest";

export const TONES = {
  profissional: "profissional e confiável",
  descontraido: "descontraído e amigável",
  luxo: "sofisticado, premium e exclusivo",
  tecnico: "técnico, objetivo e detalhado",
  persuasivo: "persuasivo, focado em conversão e benefícios",
} as const;

export type Tone = keyof typeof TONES;

const SYSTEM_INSTRUCTION = `Você é um copywriter especialista em e-commerce brasileiro.
Escreva descrições de produto em português do Brasil, prontas para publicar em lojas virtuais e marketplaces.
Regras:
- Use apenas as informações fornecidas; nunca invente especificações técnicas, certificações, números, prazos de entrega, frete, garantia ou preço.
- Estrutura: um título chamativo em uma linha, um parágrafo de apresentação, uma lista de 3 a 5 benefícios (com "- " no início) e uma frase final de chamada para ação.
- Não use markdown além dos hífens da lista. Não use emojis.
- Máximo de 180 palavras.`;

let client: GoogleGenAI | null = null;

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não definida no arquivo .env");
  }
  client ??= new GoogleGenAI({ apiKey });
  return client;
}

export async function generateProductDescription(input: {
  productName: string;
  details: string;
  tone: Tone;
}) {
  const prompt = `Produto: ${input.productName}
Características e informações: ${input.details}
Tom de voz desejado: ${TONES[input.tone]}`;

  const request = (model: string) =>
    getClient().models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8,
      },
    });

  let response;
  try {
    response = await request(MODEL);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!/503|UNAVAILABLE|overloaded|high demand/i.test(msg)) throw err;
    console.warn(`Modelo ${MODEL} indisponível, usando ${FALLBACK_MODEL}`);
    response = await request(FALLBACK_MODEL);
  }

  const text = response.text?.trim();
  if (!text) throw new Error("A IA não retornou nenhum texto.");
  return text;
}
