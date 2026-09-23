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

export const generateSchema = z.object({
  productName: z.string().trim().min(2, "Informe o nome do produto").max(120),
  details: z
    .string()
    .trim()
    .min(10, "Descreva o produto com pelo menos 10 caracteres")
    .max(1500, "Máximo de 1500 caracteres"),
  tone: z.enum(["profissional", "descontraido", "luxo", "tecnico", "persuasivo"], {
    error: "Escolha um tom de voz",
  }),
});

export function fieldErrors(error: z.ZodError) {
  return z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
}
