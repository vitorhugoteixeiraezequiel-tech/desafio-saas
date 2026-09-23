// Testa a IA com o negócio e as mensagens de exemplo, sem precisar abrir o site.
// Uso: npm run testar-ia
import { analyzeCustomerMessage } from "../src/lib/gemini.ts";
import { EXAMPLE_BUSINESS, EXAMPLE_MESSAGES } from "../src/lib/labels.ts";

const business = { user_id: 0, updated_at: "", ...EXAMPLE_BUSINESS };

for (const [label, message] of EXAMPLE_MESSAGES) {
  const start = Date.now();
  try {
    const r = await analyzeCustomerMessage({ business, message, channel: "whatsapp" });
    console.log(`\n=== ${label} (${Date.now() - start} ms) ===`);
    console.log(`Cliente: ${message}`);
    console.log(`Classificação: ${r.intent} | ${r.sentiment} | urgência ${r.urgency}`);
    console.log(`Resumo: ${r.summary}`);
    console.log(`Resposta:\n${r.reply}`);
    if (r.missingInfo.length) console.log(`Falta na base: ${r.missingInfo.join("; ")}`);
  } catch (err) {
    console.log(`\n=== ${label}: ERRO ===`, err instanceof Error ? err.message.slice(0, 200) : err);
  }
}
