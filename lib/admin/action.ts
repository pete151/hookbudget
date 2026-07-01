import "server-only";

import { headers } from "next/headers";

/**
 * Utilitaires partagés des Server Actions du Back Office.
 * (Fichier NON « use server » : il exporte des types et helpers, pas des actions.)
 */

export type AdminActionResult<T = undefined> =
  { success: true; data: T } | { success: false; error: string };

/** Adresse IP de la requête courante (pour le journal d'audit). */
export async function getRequestIp(): Promise<string | null> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? null;
  return h.get("x-real-ip");
}
