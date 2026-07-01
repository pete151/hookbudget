import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Middleware d'authentification (convention « proxy » de Next.js 16, qui
 * remplace l'ancien fichier `middleware.ts`).
 *
 * Vérifie de façon « optimiste » la présence du cookie de session (sans appel
 * à la base de données — compatible Edge Runtime). Si le cookie est absent,
 * l'accès au dashboard est redirigé vers `/login` (avec l'URL d'origine dans
 * `?callbackUrl=` pour un retour après connexion).
 *
 * ⚠️ Vérification optimiste : la validité réelle de la session est confirmée
 * côté serveur par `requireAuth()` (dashboard) et `requireAdmin()` (Back Office).
 * Le contrôle du RÔLE d'administration se fait dans le layout `/admin` (il
 * nécessite un accès base de données, impossible au niveau Edge).
 */
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

/** N'applique le proxy qu'aux routes protégées (espace applicatif + Back Office). */
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
