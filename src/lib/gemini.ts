import "server-only";
import { GoogleGenAI } from "@google/genai";

// Modelos tentados em ordem. No plano gratuito é comum um modelo ficar
// sobrecarregado (503/504), então passamos para o próximo da lista.
const MODELS = (
  process.env.GEMINI_MODELS || "gemini-3-flash-preview,gemini-flash-latest,gemini-flash-lite-latest"
)
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

// Tempo máximo de espera por modelo antes de tentar o próximo.
const TIMEOUT_PER_MODEL_MS = 12_000;

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

  let lastError: unknown;
  for (const model of MODELS) {
    try {
      const response = await getClient().models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.8,
          // Sem isso o SDK repete a chamada várias vezes com espera crescente
          // e o usuário pode aguardar mais de um minuto.
          httpOptions: { timeout: TIMEOUT_PER_MODEL_MS, retryOptions: { attempts: 1 } },
        },
      });
      const text = response.text?.trim();
      if (text) return text;
      lastError = new Error("A IA não retornou nenhum texto.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Erro de chave não adianta tentar outro modelo.
      if (/API key|401|403/i.test(msg)) throw err;
      console.warn(`Modelo ${model} falhou: ${msg.slice(0, 100)}`);
      lastError = err;
    }
  }
  throw lastError;
}
