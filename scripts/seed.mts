// Cria contas de demonstração para testar o sistema rapidamente.
// Uso: npm run seed            (só contas e negócios)
//      npm run seed -- --com-ia (também gera atendimentos reais com o Gemini)
import bcrypt from "bcryptjs";
import {
  createReply,
  createUser,
  findUserByEmail,
  getBusiness,
  saveBusiness,
  type Role,
} from "../src/lib/db.ts";
import { analyzeCustomerMessage, type Channel } from "../src/lib/gemini.ts";
import { EXAMPLE_BUSINESS, EXAMPLE_MESSAGES } from "../src/lib/labels.ts";

const PASSWORD = "demo1234";

const ACCOUNTS: { name: string; email: string; role: Role; business?: typeof EXAMPLE_BUSINESS }[] = [
  { name: "Mariana Alves", email: "admin@respondi.dev", role: "admin", business: EXAMPLE_BUSINESS },
  {
    name: "Carla Mendes",
    email: "carla@respondi.dev",
    role: "user",
    business: {
      name: "Clínica Sorriso Pleno",
      segment: "Clínica odontológica",
      tone: "formal",
      info: `Horário: segunda a sexta, das 8h às 19h. Sábado, das 8h às 12h.
Endereço: Av. Brasil, 900, sala 12 - Campinas/SP.
Serviços: limpeza (R$ 180), clareamento a laser (R$ 900), restauração (a partir de R$ 250), aparelho ortodôntico (avaliação gratuita).
Convênios aceitos: Amil Dental, OdontoPrev e SulAmérica Odonto.
Agendamento: pelo WhatsApp (19) 98888-0000. Cancelamentos com no mínimo 24h de antecedência.
Pagamento: Pix, cartão em até 10x sem juros.`,
    },
  },
  { name: "Rafael Lima", email: "rafael@respondi.dev", role: "user" },
];

for (const acc of ACCOUNTS) {
  let id = findUserByEmail(acc.email)?.id;
  if (!id) {
    id = createUser(acc.name, acc.email, await bcrypt.hash(PASSWORD, 10), acc.role);
    console.log(`Conta criada: ${acc.email}`);
  } else {
    console.log(`Conta já existia: ${acc.email}`);
  }
  if (acc.business && !getBusiness(id)) saveBusiness({ user_id: id, ...acc.business });
}

if (process.argv.includes("--com-ia")) {
  const admin = findUserByEmail(ACCOUNTS[0].email)!;
  const business = getBusiness(admin.id)!;
  const channels: Channel[] = ["whatsapp", "instagram", "whatsapp", "email"];

  for (const [i, [label, message]] of EXAMPLE_MESSAGES.entries()) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const r = await analyzeCustomerMessage({ business, message, channel: channels[i] });
        createReply({
          user_id: admin.id,
          channel: channels[i],
          customer_message: message,
          intent: r.intent,
          sentiment: r.sentiment,
          urgency: r.urgency,
          summary: r.summary,
          reply: r.reply,
          missing_info: JSON.stringify(r.missingInfo),
        });
        console.log(`Atendimento gerado: ${label}`);
        break;
      } catch {
        console.log(`Falha ao gerar "${label}" (tentativa ${attempt}/3)`);
      }
    }
  }
}

console.log(`\nPronto! Entre com qualquer conta acima usando a senha: ${PASSWORD}`);
console.log("A conta admin@respondi.dev tem acesso ao painel de administração.");
