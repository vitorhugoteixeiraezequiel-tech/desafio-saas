import Link from "next/link";
import { Logo } from "@/components/ui";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5">
        <Logo />
        <nav className="flex gap-2 text-sm">
          <Link href="/login" className="rounded-lg px-4 py-2 font-medium text-slate-700 hover:bg-slate-100">
            Entrar
          </Link>
          <Link href="/cadastro" className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700">
            Criar conta
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <span className="mb-4 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
          Powered by Google Gemini
        </span>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Descrições de produto que vendem, em segundos.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-slate-600">
          Informe o nome e as características do produto, escolha o tom de voz e a IA
          escreve um texto pronto para sua loja virtual ou marketplace.
        </p>
        <Link
          href="/cadastro"
          className="mt-8 rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
        >
          Começar grátis
        </Link>

        <div className="mt-16 grid w-full gap-4 text-left sm:grid-cols-3">
          {[
            ["1. Descreva", "Nome do produto e suas características principais."],
            ["2. Escolha o tom", "Profissional, descontraído, luxo, técnico ou persuasivo."],
            ["3. Copie e publique", "Texto estruturado com título, benefícios e chamada para ação."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
