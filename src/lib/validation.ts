import { z } from "zod";

export type FormState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[] | undefined>;
} | undefined;

const email = z.email("E-mail inválido").trim().toLowerCase();
const name = z.string().trim().min(2, "Nome precisa ter pelo menos 2 caracteres").max(80);
const password = z
  .string()
  .min(8, "Senha precisa ter pelo menos 8 caracteres")
  .max(72, "Senha muito longa");

export const signupSchema = z.object({ name, email, password });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Informe a senha"),
});

export const profileSchema = z.object({ name, email });

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Informe a senha atual"),
  newPassword: password,
});

export const businessSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da empresa").max(100),
  segment: z.string().trim().min(2, "Informe o ramo de atuação").max(100),
  tone: z.enum(["formal", "amigavel", "descontraido"], { error: "Escolha um tom de voz" }),
  info: z
    .string()
    .trim()
    .min(30, "Descreva o negócio com pelo menos 30 caracteres")
    .max(6000, "Máximo de 6000 caracteres"),
});

export const replySchema = z.object({
  message: z
    .string()
    .trim()
    .min(3, "Cole a mensagem do cliente")
    .max(3000, "Máximo de 3000 caracteres"),
  channel: z.enum(["whatsapp", "email", "instagram"], { error: "Escolha o canal" }),
});

export function fieldErrors(error: z.ZodError) {
  return z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
}
