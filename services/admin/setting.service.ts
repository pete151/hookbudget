import "server-only";

import type { SystemSettingType } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

/**
 * Paramètres système (clé/valeur) : nom de l'app, logo, maintenance, messages…
 */

export interface SystemSettingView {
  id: string;
  key: string;
  value: string;
  type: SystemSettingType;
  label: string;
  description: string | null;
}

/** Liste des paramètres système. */
export async function listSystemSettings(): Promise<SystemSettingView[]> {
  const rows = await prisma.systemSetting.findMany({ orderBy: { key: "asc" } });
  return rows.map((s) => ({
    id: s.id,
    key: s.key,
    value: s.value,
    type: s.type,
    label: s.label,
    description: s.description,
  }));
}

/** Valeur d'un paramètre (par clé) ou `null`. */
export async function getSetting(key: string): Promise<string | null> {
  const row = await prisma.systemSetting.findUnique({ where: { key }, select: { value: true } });
  return row?.value ?? null;
}

/** Met à jour la valeur d'un paramètre existant (par clé). */
export function setSetting(key: string, value: string) {
  return prisma.systemSetting.update({ where: { key }, data: { value } });
}

/** Met à jour plusieurs paramètres à la fois. */
export async function setSettings(entries: { key: string; value: string }[]): Promise<void> {
  await prisma.$transaction(
    entries.map((e) =>
      prisma.systemSetting.update({ where: { key: e.key }, data: { value: e.value } }),
    ),
  );
}
