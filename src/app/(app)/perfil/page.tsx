import { DeleteAccountForm, PasswordForm, ProfileForm } from "@/components/profile-forms";
import { getCurrentUser } from "@/lib/dal";

export const metadata = { title: "Meu perfil — Descritiva" };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const since = new Date(user.created_at + "Z").toLocaleDateString("pt-BR");

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meu perfil</h1>
        <p className="mt-1 text-sm text-slate-600">Membro desde {since}</p>
      </div>
      <ProfileForm name={user.name} email={user.email} />
      <PasswordForm />
      <DeleteAccountForm />
    </div>
  );
}
