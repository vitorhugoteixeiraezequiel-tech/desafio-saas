// Rótulos exibidos na interface (podem ser usados no cliente e no servidor).

export const TONE_OPTIONS = [
  ["amigavel", "Amigável"],
  ["formal", "Formal"],
  ["descontraido", "Descontraído"],
] as const;

export const CHANNEL_OPTIONS = [
  ["whatsapp", "WhatsApp"],
  ["email", "E-mail"],
  ["instagram", "Instagram"],
] as const;

export const CHANNEL_LABEL: Record<string, string> = Object.fromEntries(CHANNEL_OPTIONS);

export const INTENT_LABEL: Record<string, string> = {
  duvida: "Dúvida",
  reclamacao: "Reclamação",
  pedido: "Pedido",
  elogio: "Elogio",
  outro: "Outro",
};

export const SENTIMENT_LABEL: Record<string, string> = {
  positivo: "Positivo",
  neutro: "Neutro",
  negativo: "Negativo",
};

export const URGENCY_LABEL: Record<string, string> = {
  baixa: "Urgência baixa",
  media: "Urgência média",
  alta: "Urgência alta",
};

export const BADGE_COLOR: Record<string, string> = {
  reclamacao: "bg-red-50 text-red-700",
  negativo: "bg-red-50 text-red-700",
  alta: "bg-red-50 text-red-700",
  media: "bg-amber-50 text-amber-700",
  pedido: "bg-sky-50 text-sky-700",
  elogio: "bg-emerald-50 text-emerald-700",
  positivo: "bg-emerald-50 text-emerald-700",
};

export const EXAMPLE_BUSINESS = {
  name: "Pizzaria Forno de Pedra",
  segment: "Pizzaria com delivery",
  tone: "amigavel",
  info: `Horário: terça a domingo, das 18h às 23h30. Fechado às segundas.
Endereço: Rua das Flores, 120 - Centro, Campinas/SP.
Delivery: raio de 6 km, taxa de R$ 7,00. Grátis em pedidos acima de R$ 90,00. Tempo médio de 40 a 60 minutos.
Pedidos: pelo WhatsApp (19) 99999-0000 ou pelo iFood.
Pagamento: Pix, cartão de crédito/débito e dinheiro (troco até R$ 100).
Cardápio e preços (pizza grande, 8 fatias): Mussarela R$ 49,90 | Calabresa R$ 52,90 | Portuguesa R$ 59,90 | Frango com catupiry R$ 59,90 | Quatro queijos R$ 62,90. Pizza broto (4 fatias) custa 40% a menos.
Opções: massa sem glúten para qualquer sabor (+ R$ 10,00). Não temos opções veganas no momento.
Promoção: terça e quarta, na compra de 2 pizzas grandes, ganhe um refrigerante de 2L.
Política: pedido com problema (errado, frio ou atrasado mais de 30 min do previsto) é refeito ou reembolsado. O cliente deve enviar foto e número do pedido.`,
};

export const EXAMPLE_MESSAGES = [
  ["Entrega e pagamento", "Oi! Vocês entregam no bairro Taquaral? Quanto fica a taxa? E aceita pix?"],
  ["Reclamação de atraso", "Pedi uma calabresa há 1h40 e até agora NADA. Pedido #4821. Péssimo, nunca mais peço aí!!"],
  ["Pergunta fora da base", "Boa noite, vocês têm pizza vegana? E fazem pizza meio a meio?"],
  ["Elogio", "Queria dizer que a pizza de quatro queijos de ontem estava perfeita, parabéns pra equipe!"],
] as const;
