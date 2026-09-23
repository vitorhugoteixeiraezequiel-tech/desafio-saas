import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Criar conta — Descritiva" };

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
