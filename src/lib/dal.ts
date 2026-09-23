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
  const user = session ? findUserById(session.userId) : undefined;
  if (!user) redirect("/login");
  return user;
});

/** Versão sem o hash de senha, segura para passar a componentes. */
export async function getCurrentUser() {
  const { id, name, email, created_at } = await requireUser();
  return { id, name, email, created_at };
}
