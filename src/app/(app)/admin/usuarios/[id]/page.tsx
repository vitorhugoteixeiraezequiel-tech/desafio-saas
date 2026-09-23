import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteUserButton, EditUserForm } from "@/components/admin-forms";
import { Card } from "@/components/ui";
import { requireAdmin } from "@/lib/dal";
import { findUserById } from "@/lib/db";

export const metadata = { title: "Editar usuário — Respondi" };

export default async function EditUserPage(props: PageProps<"/admin/usuarios/[id]">) {
  const admin = await requireAdmin();
  const { id } = await props.params;
  const user = findUserById(Number(id));
  if (!user) notFound();

  const isSelf = user.id === admin.id;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link href="/admin" className="text-sm text-indigo-600 hover:underline">
          ← Voltar para a lista
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">{user.name}</h1>
        <p className="mt-1 text-sm text-slate-600">
          Cadastrado em {new Date(user.created_at + "Z").toLocaleDateString("pt-BR")}
        </p>
      </div>

      <EditUserForm user={{ id: user.id, name: user.name, email: user.email, role: user.role }} />

      <Card className="border-red-200">
        <h2 className="font-semibold text-red-700">Excluir usuário</h2>
        {isSelf ? (
          <p className="mt-1 text-sm text-slate-600">
            Para excluir a sua própria conta, use a página{" "}
            <Link href="/perfil" className="text-indigo-600 hover:underline">
              Meu perfil
            </Link>
            .
          </p>
        ) : (
          <>
            <p className="mt-1 mb-4 text-sm text-slate-600">
              A conta, as informações do negócio e todo o histórico de atendimentos serão apagados.
            </p>
            <DeleteUserButton id={user.id} name={user.name} />
          </>
        )}
      </Card>
    </div>
  );
}
