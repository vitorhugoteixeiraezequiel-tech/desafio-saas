"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { createUser, findUserByEmail } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";
import {
  fieldErrors,
  loginSchema,
  signupSchema,
  type FormState,
} from "@/lib/validation";

export async function signup(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const { name, email, password } = parsed.data;
  if (findUserByEmail(email)) {
    return { fieldErrors: { email: ["Este e-mail já está cadastrado"] } };
  }

  const hash = await bcrypt.hash(password, 10);
  const userId = createUser(name, email, hash);
  await createSession(userId);
  redirect("/dashboard");
}

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const user = findUserByEmail(parsed.data.email);
  const ok = user && (await bcrypt.compare(parsed.data.password, user.password_hash));
  if (!ok) return { error: "E-mail ou senha incorretos" };

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
