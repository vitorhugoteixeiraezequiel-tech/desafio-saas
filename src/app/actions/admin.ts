"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/dal";
import {
  countAdmins,
  createUser,
  deleteUser,
  findUserByEmail,
  findUserById,
  updateUser,
  updateUserPassword,
  updateUserRole,
} from "@/lib/db";
import {
  adminCreateUserSchema,
  adminUpdateUserSchema,
  fieldErrors,
  type FormState,
} from "@/lib/validation";

export async function adminCreateUser(_: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = adminCreateUserSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const { name, email, password, role } = parsed.data;
  if (findUserByEmail(email)) {
    return { fieldErrors: { email: ["Este e-mail já está cadastrado"] } };
  }

  createUser(name, email, await bcrypt.hash(password, 10), role);
  revalidatePath("/admin");
  return { success: `Usuário ${name} criado com sucesso` };
}

export async function adminUpdateUser(
  id: number,
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await requireAdmin();
  const target = findUserById(id);
  if (!target) return { error: "Usuário não encontrado" };

  const parsed = adminUpdateUserSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const { name, email, role, password } = parsed.data;
  const existing = findUserByEmail(email);
  if (existing && existing.id !== id) {
    return { fieldErrors: { email: ["Este e-mail já está em uso"] } };
  }

  // Impede que o sistema fique sem nenhum administrador.
  if (target.role === "admin" && role === "user" && countAdmins() <= 1) {
    return { fieldErrors: { role: ["Este é o único administrador. Promova outro usuário antes."] } };
  }
  if (target.id === admin.id && role === "user") {
    return { fieldErrors: { role: ["Você não pode remover o seu próprio acesso de administrador."] } };
  }

  updateUser(id, name, email);
  updateUserRole(id, role);
  if (password) updateUserPassword(id, await bcrypt.hash(password, 10));

  revalidatePath("/", "layout");
  return { success: "Usuário atualizado com sucesso" };
}

export async function adminDeleteUser(id: number) {
  const admin = await requireAdmin();
  // Para excluir a própria conta existe a página de perfil (que pede a senha).
  if (id === admin.id) return;

  deleteUser(id); // negócio e histórico são apagados junto (ON DELETE CASCADE)
  revalidatePath("/admin");
  redirect("/admin");
}
