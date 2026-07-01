import type { AdminRole } from "@prisma/client";

/**
 * RBAC du Back Office (Sprint 14).
 *
 * Source de vérité des contrôles à l'exécution : la matrice `ROLE_PERMISSIONS`
 * ci-dessous (rapide, sans requête). Les tables `Role`/`Permission` en base en
 * sont le miroir (voir `prisma/seed-admin.ts`) pour l'administration/affichage.
 */

/** Liste exhaustive des permissions. */
export const PERMISSIONS = [
  "users.view",
  "users.suspend",
  "users.delete",
  "users.role",
  "plans.view",
  "plans.manage",
  "subscriptions.view",
  "analytics.view",
  "audit.view",
  "flags.view",
  "flags.manage",
  "settings.view",
  "settings.manage",
  "reports.view",
  "notifications.manage",
] as const;

export type AdminPermission = (typeof PERMISSIONS)[number];

/** Matrice rôle → permissions. */
export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  SUPER_ADMIN: [...PERMISSIONS],
  ADMIN: [
    "users.view",
    "users.suspend",
    "users.role",
    "plans.view",
    "plans.manage",
    "subscriptions.view",
    "analytics.view",
    "audit.view",
    "flags.view",
    "flags.manage",
    "settings.view",
    "reports.view",
    "notifications.manage",
  ],
  SUPPORT: [
    "users.view",
    "users.suspend",
    "subscriptions.view",
    "audit.view",
    "notifications.manage",
  ],
  ANALYST: ["analytics.view", "users.view", "subscriptions.view", "reports.view", "audit.view"],
};

/** Libellés lisibles des rôles. */
export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  SUPER_ADMIN: "Super administrateur",
  ADMIN: "Administrateur",
  SUPPORT: "Support",
  ANALYST: "Analyste",
};

/** Indique si un rôle détient une permission donnée. */
export function hasPermission(
  role: AdminRole | null | undefined,
  permission: AdminPermission,
): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

/** Ensemble des permissions d'un rôle. */
export function permissionsFor(role: AdminRole): AdminPermission[] {
  return ROLE_PERMISSIONS[role];
}
