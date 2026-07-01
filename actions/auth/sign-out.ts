"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";

/**
 * Server Action de déconnexion.
 * Invalide la session côté serveur (suppression du cookie via le plugin
 * `nextCookies`) puis redirige vers la page de connexion.
 */
export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}
