"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup } from "@/app/actions/auth";
import { Alert, Button, Card, Field } from "./ui";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const isSignup = mode === "signup";
  const [state, action, pending] = useActionState(isSignup ? signup : login, undefined);
  const fe = state?.fieldErrors;

  return (
    <Card className="w-full max-w-sm">
      <h1 className="text-xl font-semibold">{isSignup ? "Criar conta" : "Entrar"}</h1>
      <p className="mt-1 text-sm text-slate-600">
        {isSignup ? "Comece a gerar descrições em segundos." : "Bem-vindo de volta!"}
      </p>

      <form action={action} className="mt-6 space-y-4">
        {isSignup && <Field label="Nome" name="name" autoComplete="name" required errors={fe?.name} />}
        <Field label="E-mail" name="email" type="email" autoComplete="email" required errors={fe?.email} />
        <Field
          label="Senha"
          name="password"
          type="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          required
          errors={fe?.password}
        />
        {state?.error && <Alert type="error">{state.error}</Alert>}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Aguarde..." : isSignup ? "Criar conta" : "Entrar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        {isSignup ? "Já tem conta? " : "Ainda não tem conta? "}
        <Link href={isSignup ? "/login" : "/cadastro"} className="font-medium text-indigo-600 hover:underline">
          {isSignup ? "Entrar" : "Criar conta"}
        </Link>
      </p>
    </Card>
  );
}
