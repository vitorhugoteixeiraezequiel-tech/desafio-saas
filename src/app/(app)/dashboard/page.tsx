import { GenerateForm } from "@/components/generate-form";
import { History } from "@/components/history";
import { requireUser } from "@/lib/dal";
import { listGenerations } from "@/lib/db";

export const metadata = { title: "Gerador — Descritiva" };

export default async function DashboardPage() {
  const user = await requireUser();
  const generations = listGenerations(user.id);

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-2xl font-bold tracking-tight">Gerar descrição de produto</h1>
        <p className="mt-1 text-slate-600">
          Preencha os dados do produto e a IA escreve a descrição para você.
        </p>
        <div className="mt-6">
          <GenerateForm />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Histórico</h2>
        <div className="mt-4">
          <History items={generations} />
        </div>
      </section>
    </div>
  );
}
