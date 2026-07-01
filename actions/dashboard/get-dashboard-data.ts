"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/server";
import { getDashboardData, type DashboardData } from "@/services/dashboard/dashboard.service";

/**
 * Server Action : renvoie les données du Dashboard pour l'utilisateur connecté.
 *
 * Le Dashboard est rendu par des Server Components qui appellent directement le
 * service ; cette action est fournie pour un rafraîchissement côté client
 * (ex. bouton « Actualiser ») dans les prochains sprints. LECTURE SEULE.
 */
export async function getDashboardDataAction(): Promise<DashboardData> {
  const user = await requireAuth();
  return getDashboardData(user.id);
}

/**
 * Server Action : invalide le cache du Dashboard pour forcer un nouveau rendu
 * serveur avec des données fraîches.
 */
export async function refreshDashboardAction(): Promise<void> {
  await requireAuth();
  revalidatePath("/dashboard");
}
