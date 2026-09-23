import Link from "next/link";
import { History } from "@/components/history";
import { ReplyForm } from "@/components/reply-form";
import { Card } from "@/components/ui";
import { requireUser } from "@/lib/dal";
import { getBusiness, listReplies } from "@/lib/db";
import { EXAMPLE_BUSINESS } from "@/lib/labels";

export const metadata = { title: "Atendimento — Respondi" };

export default async function DashboardPage() {
  const user = await requireUser();
  const business = getBusiness(user.id);

  if (!business) {
    return (
      <Card className="mx-auto max-w-lg text-center">
        <h1 className="text-xl font-semibold">Primeiro, conte sobre o seu negócio</h1>
        <p className="mt-2 text-sm text-slate-600">
          A IA precisa saber horários, preços, formas de pagamento e políticas da sua empresa para
          responder os clientes sem inventar nada.
        </p>
        <Link
          href="/negocio"
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Cadastrar meu negócio
        </Link>
      </Card>
    );
  }

  const replies = listReplies(user.id);

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-2xl font-bold tracking-tight">Responder cliente</h1>
        <p className="mt-1 text-slate-600">
          Cole a mensagem que chegou e a IA sugere a resposta como{" "}
          <span className="font-medium text-slate-800">{business.name}</span>.
        </p>
        <div className="mt-6">
          <ReplyForm showExamples={business.name === EXAMPLE_BUSINESS.name} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Histórico de atendimentos</h2>
        <div className="mt-4">
          <History items={replies} />
        </div>
      </section>
    </div>
  );
}
