import Link from "next/link";
import { CreateUserForm } from "@/components/admin-forms";
import { Badge, Card } from "@/components/ui";
import { requireAdmin } from "@/lib/dal";
import { listUsersWithStats } from "@/lib/db";

export const metadata = { title: "Administração — Respondi" };

export default async function AdminPage() {
  const admin = await requireAdmin();
  const users = await listUsersWithStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Administração</h1>
        <p className="mt-1 text-sm text-slate-600">
          {users.length} {users.length === 1 ? "usuário cadastrado" : "usuários cadastrados"} na plataforma.
        </p>
      </div>

      <CreateUserForm />

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Usuário</th>
              <th className="px-5 py-3 font-medium">Acesso</th>
              <th className="px-5 py-3 font-medium">Negócio</th>
              <th className="px-5 py-3 font-medium">Atendimentos</th>
              <th className="px-5 py-3 font-medium">Cadastro</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-5 py-3">
                  <div className="font-medium">
                    {u.name} {u.id === admin.id && <span className="text-xs text-slate-400">(você)</span>}
                  </div>
                  <div className="text-xs text-slate-500">{u.email}</div>
                </td>
                <td className="px-5 py-3">
                  {u.role === "admin" ? (
                    <Badge className="bg-indigo-50 text-indigo-700">Admin</Badge>
                  ) : (
                    <Badge>Usuário</Badge>
                  )}
                </td>
                <td className="px-5 py-3 text-slate-600">{u.business_name ?? "—"}</td>
                <td className="px-5 py-3 text-slate-600">{u.replies_count}</td>
                <td className="px-5 py-3 text-slate-600">
                  {new Date(u.created_at + "Z").toLocaleDateString("pt-BR")}
                </td>
                <td className="px-5 py-3 text-right">
                  <Link href={`/admin/usuarios/${u.id}`} className="font-medium text-indigo-600 hover:underline">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
