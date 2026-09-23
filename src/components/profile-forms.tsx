"use client";

import { useActionState, useState } from "react";
import { changePassword, deleteAccount, updateProfile } from "@/app/actions/user";
import { Alert, Button, Card, Field } from "./ui";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, action, pending] = useActionState(updateProfile, undefined);
  const [values, setValues] = useState({ name, email });
  const fe = state?.fieldErrors;

  return (
    <Card>
      <h2 className="font-semibold">Dados pessoais</h2>
      <form action={action} className="mt-4 space-y-4">
        <Field
          label="Nome"
          name="name"
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          errors={fe?.name}
        />
        <Field
          label="E-mail"
          name="email"
          type="email"
          value={values.email}
          onChange={(e) => setValues({ ...values, email: e.target.value })}
          errors={fe?.email}
        />
        {state?.success && <Alert type="success">{state.success}</Alert>}
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar alterações"}
        </Button>
      </form>
    </Card>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined);
  const fe = state?.fieldErrors;

  return (
    <Card>
      <h2 className="font-semibold">Alterar senha</h2>
      <form action={action} className="mt-4 space-y-4">
        <Field
          label="Senha atual"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          errors={fe?.currentPassword}
        />
        <Field
          label="Nova senha"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          errors={fe?.newPassword}
        />
        {state?.success && <Alert type="success">{state.success}</Alert>}
        <Button type="submit" disabled={pending}>
          {pending ? "Alterando..." : "Alterar senha"}
        </Button>
      </form>
    </Card>
  );
}

export function DeleteAccountForm() {
  const [state, action, pending] = useActionState(deleteAccount, undefined);
  const [open, setOpen] = useState(false);

  return (
    <Card className="border-red-200">
      <h2 className="font-semibold text-red-700">Excluir conta</h2>
      <p className="mt-1 text-sm text-slate-600">
        Sua conta e todo o histórico de descrições serão apagados permanentemente.
      </p>
      {open ? (
        <form action={action} className="mt-4 space-y-4">
          <Field label="Confirme sua senha" name="password" type="password" required />
          {state?.error && <Alert type="error">{state.error}</Alert>}
          <div className="flex gap-2">
            <Button type="submit" variant="danger" disabled={pending}>
              {pending ? "Excluindo..." : "Excluir definitivamente"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <Button type="button" variant="danger" className="mt-4" onClick={() => setOpen(true)}>
          Excluir minha conta
        </Button>
      )}
    </Card>
  );
}
