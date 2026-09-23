"use client";

import { useActionState, useState } from "react";
import { adminCreateUser, adminDeleteUser, adminUpdateUser } from "@/app/actions/admin";
import { Alert, Button, Card, Field, Select } from "./ui";

function RoleSelect({ errors, defaultValue }: { errors?: string[]; defaultValue?: string }) {
  return (
    <Select label="Tipo de acesso" name="role" defaultValue={defaultValue ?? "user"} errors={errors}>
      <option value="user">Usuário</option>
      <option value="admin">Administrador</option>
    </Select>
  );
}

export function CreateUserForm() {
  const [state, action, pending] = useActionState(adminCreateUser, undefined);
  const fe = state?.fieldErrors;

  return (
    <Card>
      <h2 className="font-semibold">Novo usuário</h2>
      {/* key muda a cada sucesso para limpar o formulário */}
      <form key={state?.success} action={action} className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Nome" name="name" errors={fe?.name} />
        <Field label="E-mail" name="email" type="email" errors={fe?.email} />
        <Field label="Senha" name="password" type="password" autoComplete="new-password" errors={fe?.password} />
        <RoleSelect errors={fe?.role} />
        <div className="space-y-3 sm:col-span-2">
          {state?.success && <Alert type="success">{state.success}</Alert>}
          <Button type="submit" disabled={pending}>
            {pending ? "Criando..." : "Criar usuário"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

type EditableUser = { id: number; name: string; email: string; role: string };

export function EditUserForm({ user }: { user: EditableUser }) {
  const [state, action, pending] = useActionState(adminUpdateUser.bind(null, user.id), undefined);
  const [values, setValues] = useState({ name: user.name, email: user.email, role: user.role });
  const fe = state?.fieldErrors;

  return (
    <Card>
      <h2 className="font-semibold">Dados do usuário</h2>
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
        <Select
          label="Tipo de acesso"
          name="role"
          value={values.role}
          onChange={(e) => setValues({ ...values, role: e.target.value })}
          errors={fe?.role}
        >
          <option value="user">Usuário</option>
          <option value="admin">Administrador</option>
        </Select>
        <Field
          label="Nova senha (deixe em branco para manter a atual)"
          name="password"
          type="password"
          autoComplete="new-password"
          errors={fe?.password}
        />
        {state?.error && <Alert type="error">{state.error}</Alert>}
        {state?.success && <Alert type="success">{state.success}</Alert>}
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar alterações"}
        </Button>
      </form>
    </Card>
  );
}

export function DeleteUserButton({ id, name }: { id: number; name: string }) {
  return (
    <form
      action={adminDeleteUser.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm(`Excluir ${name}? A conta, o negócio e todo o histórico serão apagados.`)) {
          e.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="danger">
        Excluir usuário
      </Button>
    </form>
  );
}
