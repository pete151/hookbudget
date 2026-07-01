import "server-only";

import { redirect } from "next/navigation";
import type { AdminRole } from "@prisma/client";

import { getCurrentUser } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";
import { hasPermission, type AdminPermission } from "@/lib/admin/rbac";

/**
 * Garde du Back Office : vérifie qu'un utilisateur possède un rôle
 * d'administration actif, et (optionnellement) une permission précise.
 *
 * Le rôle est lu FRAÎCHEMENT en base (source de vérité), sans dépendre de la
 * session — ainsi une révocation de rôle ou une suspension est prise en compte
 * immédiatement.
 */

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  adminRole: AdminRole;
}

/** Récupère l'admin courant (rôle actif) ou `null`. */
export async function getAdminUser(): Promise<AdminUser | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      adminRole: true,
      status: true,
      deletedAt: true,
    },
  });

  if (!record || !record.adminRole || record.status === "SUSPENDED" || record.deletedAt) {
    return null;
  }

  return {
    id: record.id,
    name: record.name,
    email: record.email,
    image: record.image,
    adminRole: record.adminRole,
  };
}

/**
 * Exige un accès Back Office (défense en profondeur, en complément du proxy).
 * Redirige les non-admins vers le dashboard utilisateur, les non-connectés vers
 * `/login`. Si `permission` est fournie et manquante, redirige vers `/admin`.
 */
export async function requireAdmin(permission?: AdminPermission): Promise<AdminUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const admin = await getAdminUser();
  if (!admin) redirect("/dashboard");

  if (permission && !hasPermission(admin.adminRole, permission)) {
    redirect("/admin/dashboard");
  }
  return admin;
}

/**
 * Variante pour les Server Actions : ne redirige pas, renvoie un résultat.
 * Utilisée pour renvoyer une erreur propre plutôt qu'une redirection.
 */
export async function authorizeAdmin(
  permission: AdminPermission,
): Promise<{ ok: true; admin: AdminUser } | { ok: false; error: string }> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Accès refusé." };
  if (!hasPermission(admin.adminRole, permission)) {
    return { ok: false, error: "Permission insuffisante." };
  }
  return { ok: true, admin };
}
