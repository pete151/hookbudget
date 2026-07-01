import "server-only";

import { prisma } from "@/lib/db/prisma";

/**
 * Feature flags : activer/désactiver des fonctionnalités sans redéploiement.
 */

export interface FeatureFlagView {
  id: string;
  key: string;
  label: string;
  description: string | null;
  enabled: boolean;
  updatedAt: Date;
}

/** Liste des feature flags. */
export async function listFeatureFlags(): Promise<FeatureFlagView[]> {
  const flags = await prisma.featureFlag.findMany({ orderBy: { key: "asc" } });
  return flags.map((f) => ({
    id: f.id,
    key: f.key,
    label: f.label,
    description: f.description,
    enabled: f.enabled,
    updatedAt: f.updatedAt,
  }));
}

/** Active / désactive un flag (par identifiant). Renvoie le flag mis à jour. */
export function setFeatureFlag(id: string, enabled: boolean) {
  return prisma.featureFlag.update({ where: { id }, data: { enabled } });
}

/** Indique si une fonctionnalité est activée (par clé). Défaut : false si absent. */
export async function isFeatureEnabled(key: string): Promise<boolean> {
  const flag = await prisma.featureFlag.findUnique({ where: { key }, select: { enabled: true } });
  return flag?.enabled ?? false;
}
