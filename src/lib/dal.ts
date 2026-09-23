import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { findUserById } from "./db";
import { getSession } from "./session";

/**
 * Verificação de autenticação real (a do proxy é apenas otimista).
 * Deve ser chamada em toda página protegida e em toda Server Action.
 * Retorna o usuário completo (incluindo o hash) para uso apenas no servidor.
 */
export const requireUser = cache(async () => {
  const session = await getSession();
  if (!session) redirect("/login");
  const user = await findUserById(session.userId);
  // Sessão válida de um usuário que não existe mais: limpa o cookie.
  if (!user) redirect("/sair");
  return user;
});

/** Igual a requireUser, mas só deixa passar administradores. */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}

/** Versão sem o hash de senha, segura para passar a componentes. */
export async function getCurrentUser() {
  const { id, name, email, role, created_at } = await requireUser();
  return { id, name, email, role, created_at };
}
