"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { deleteUser, findUserByEmail, updateUser, updateUserPassword } from "@/lib/db";
import { deleteSession } from "@/lib/session";
import {
  fieldErrors,
  passwordSchema,
  profileSchema,
  type FormState,
} from "@/lib/validation";

export async function updateProfile(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const { name, email } = parsed.data;
  const existing = await findUserByEmail(email);
  if (existing && existing.id !== user.id) {
    return { fieldErrors: { email: ["Este e-mail já está em uso"] } };
  }

  await updateUser(user.id, name, email);
  revalidatePath("/", "layout");
  return { success: "Dados atualizados com sucesso" };
}

export async function changePassword(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = passwordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const ok = await bcrypt.compare(parsed.data.currentPassword, user.password_hash);
  if (!ok) return { fieldErrors: { currentPassword: ["Senha atual incorreta"] } };

  await updateUserPassword(user.id, await bcrypt.hash(parsed.data.newPassword, 10));
  return { success: "Senha alterada com sucesso" };
}

export async function deleteAccount(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const password = String(formData.get("password") ?? "");

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return { error: "Senha incorreta" };

  await deleteUser(user.id); // o negócio e o histórico são apagados junto
  await deleteSession();
  redirect("/");
}
