// Dados das contas de demonstração (usados por `npm run seed` e pelo site online).
import { EXAMPLE_BUSINESS } from "./labels.ts";

export const DEMO_PASSWORD = "demo1234";

export const DEMO_ACCOUNTS = [
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
  { name: "Rafael Lima", email: "rafael@respondi.dev", role: "user", business: undefined },
] as const;

/**
 * Atendimentos de exemplo da conta admin. São respostas reais geradas pelo
 * Gemini com as mensagens de exemplo, salvas para o histórico já começar preenchido.
 */
export const DEMO_REPLIES = [
  {
    channel: "whatsapp",
    customer_message: "Oi! Vocês entregam no bairro Taquaral? Quanto fica a taxa? E aceita pix?",
    intent: "duvida",
    sentiment: "neutro",
    urgency: "media",
    summary: "O cliente quer saber se entregamos no bairro Taquaral, o valor da taxa e se aceitamos Pix.",
    reply:
      "Olá! Aceitamos Pix sim. Sobre a entrega no Taquaral, vou verificar com a equipe e retorno em breve por aqui! 🍕",
    missing_info: ["Entrega no bairro Taquaral"],
  },
  {
    channel: "instagram",
    customer_message: "Pedi uma calabresa há 1h40 e até agora NADA. Pedido #4821. Péssimo, nunca mais peço aí!!",
    intent: "reclamacao",
    sentiment: "negativo",
    urgency: "alta",
    summary: "Cliente reclama de atraso de 1h40 no pedido #4821 e demonstra grande insatisfação.",
    reply:
      "Sinto muito pelo atraso do pedido #4821! 😔 Como ultrapassou o prazo, podemos refazer sua pizza ou reembolsar o valor. Por favor, nos chame no WhatsApp (19) 99999-0000 para resolvermos agora. 🙏",
    missing_info: [],
  },
  {
    channel: "whatsapp",
    customer_message: "Boa noite, vocês têm pizza vegana? E fazem pizza meio a meio?",
    intent: "duvida",
    sentiment: "neutro",
    urgency: "baixa",
    summary: "O cliente perguntou sobre opções de pizza vegana e se fazemos pizza meio a meio.",
    reply:
      "Olá! No momento não temos opções veganas disponíveis no cardápio. 🍕 Vou verificar com a nossa equipe sobre a opção de pizza meio a meio e retorno em breve!",
    missing_info: ["pizza meio a meio"],
  },
  {
    channel: "email",
    customer_message: "Queria dizer que a pizza de quatro queijos de ontem estava perfeita, parabéns pra equipe!",
    intent: "elogio",
    sentiment: "positivo",
    urgency: "baixa",
    summary: "O cliente enviou um elogio sobre a qualidade da pizza de quatro queijos e parabenizou a equipe.",
    reply:
      "Olá,\n\nAgradecemos imensamente pelo seu contato e pelo feedback positivo. Ficamos muito felizes em saber que a pizza de quatro queijos estava do seu agrado. Com certeza compartilharemos o seu elogio com toda a nossa equipe.\n\nEsperamos atendê-lo novamente em breve.\n\nAtenciosamente,\nPizzaria Forno de Pedra",
    missing_info: [],
  },
];
