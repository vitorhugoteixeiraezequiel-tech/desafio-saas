import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { Button, Logo } from "@/components/ui";
import { getCurrentUser } from "@/lib/dal";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <Link href="/dashboard">
            <Logo />
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link href="/dashboard" className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">
              Atendimento
            </Link>
            <Link href="/negocio" className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">
              Meu negócio
            </Link>
            {user.role === "admin" && (
              <Link href="/admin" className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">
                Admin
              </Link>
            )}
            <Link href="/perfil" className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">
              {user.name.split(" ")[0]}
            </Link>
            <form action={logout}>
              <Button variant="ghost" type="submit">
                Sair
              </Button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
