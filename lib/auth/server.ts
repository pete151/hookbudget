import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";

/**
 * Récupère la session complète côté serveur (utilisateur + session) ou `null`.
 *
 * S'appuie sur les en-têtes de la requête courante ; son utilisation rend la
 * page/layout appelant dynamique (rendu à la demande), ce qui évite tout appel
 * à la base de données au moment du build.
 */
export async function authServer() {
  return auth.api.getSession({ headers: await headers() });
}

/**
 * Retourne l'utilisateur connecté, ou `null` s'il n'y a pas de session.
 * À utiliser dans les Server Components pour un affichage conditionnel.
 */
export async function getCurrentUser() {
  const session = await authServer();
  return session?.user ?? null;
}

/**
 * Garde-fou serveur : exige une session valide.
 * Redirige vers `/login` si l'utilisateur n'est pas connecté, sinon renvoie
 * l'utilisateur. Utilisé par le layout du dashboard (défense en profondeur,
 * en complément du middleware).
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/** Type de l'utilisateur renvoyé par Better Auth. */
export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
