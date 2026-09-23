import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME } from "@/lib/session";

// Encerra a sessão e volta para o login. Usado quando o cookie ainda é válido
// mas o usuário não existe mais (ex.: conta excluída pelo admin), o que
// causaria um loop entre /login e /dashboard.
export function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/login", req.url));
  res.cookies.delete(COOKIE_NAME);
  return res;
}
