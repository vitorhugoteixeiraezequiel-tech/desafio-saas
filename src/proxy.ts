import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED = ["/dashboard", "/perfil"];
const AUTH_PAGES = ["/login", "/cadastro"];

// Checagem otimista: só valida o cookie, sem consultar o banco.
// A verificação definitiva acontece em src/lib/dal.ts.
async function hasValidSession(token: string | undefined) {
  if (!token || !process.env.SESSION_SECRET) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.SESSION_SECRET));
    return true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const loggedIn = await hasValidSession(req.cookies.get("session")?.value);

  if (!loggedIn && PROTECTED.some((p) => path.startsWith(p))) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  if (loggedIn && AUTH_PAGES.includes(path)) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
