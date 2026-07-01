"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth/auth";
import { requireAuth } from "@/lib/auth/server";
import {
  profileSchema,
  preferencesSchema,
  appearanceSchema,
  currencySchema,
  languageSchema,
  changePasswordSchema,
  importRowSchema,
} from "@/lib/validations/settings";
import {
  updateProfile,
  updatePreferences,
  updateAppearance,
  updateCurrency,
  updateLanguage,
  exportAccount,
  importTransactions,
  type ImportResult,
} from "@/services/settings/settings.service";
import { recalculateUserBudgets } from "@/services/budgets/budget.service";

export type ActionResult<T = undefined> =
  { success: true; data: T } | { success: false; error: string };

function fail(error: string): ActionResult<never> {
  return { success: false, error };
}

function firstIssue(issues: { message: string }[]): string {
  return issues[0]?.message ?? "Données invalides.";
}

/** Met à jour le profil. */
export async function updateProfileAction(values: unknown): Promise<ActionResult> {
  const user = await requireAuth();
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) return fail(firstIssue(parsed.error.issues));
  await updateProfile(user.id, parsed.data);
  revalidatePath("/dashboard/settings/profile");
  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}

/** Met à jour les préférences de format. */
export async function updatePreferencesAction(values: unknown): Promise<ActionResult> {
  const user = await requireAuth();
  const parsed = preferencesSchema.safeParse(values);
  if (!parsed.success) return fail(firstIssue(parsed.error.issues));
  await updatePreferences(user.id, parsed.data);
  revalidatePath("/dashboard/settings/preferences");
  return { success: true, data: undefined };
}

/** Met à jour le thème. */
export async function updateAppearanceAction(values: unknown): Promise<ActionResult> {
  const user = await requireAuth();
  const parsed = appearanceSchema.safeParse(values);
  if (!parsed.success) return fail(firstIssue(parsed.error.issues));
  await updateAppearance(user.id, parsed.data.theme);
  revalidatePath("/dashboard/settings/appearance");
  return { success: true, data: undefined };
}

/** Met à jour la devise (impacte tout le dashboard). */
export async function updateCurrencyAction(values: unknown): Promise<ActionResult> {
  const user = await requireAuth();
  const parsed = currencySchema.safeParse(values);
  if (!parsed.success) return fail(firstIssue(parsed.error.issues));
  await updateCurrency(user.id, parsed.data.currency);
  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}

/** Met à jour la langue. */
export async function updateLanguageAction(values: unknown): Promise<ActionResult> {
  const user = await requireAuth();
  const parsed = languageSchema.safeParse(values);
  if (!parsed.success) return fail(firstIssue(parsed.error.issues));
  await updateLanguage(user.id, parsed.data.language);
  revalidatePath("/dashboard/settings/language");
  return { success: true, data: undefined };
}

/** Change le mot de passe (Better Auth). */
export async function changePasswordAction(values: unknown): Promise<ActionResult> {
  await requireAuth();
  const parsed = changePasswordSchema.safeParse(values);
  if (!parsed.success) return fail(firstIssue(parsed.error.issues));

  try {
    await auth.api.changePassword({
      body: {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
        revokeOtherSessions: parsed.data.revokeOtherSessions ?? false,
      },
      headers: await headers(),
    });
    return { success: true, data: undefined };
  } catch {
    return fail("Mot de passe actuel incorrect ou requête invalide.");
  }
}

/** Déconnecte tous les autres appareils. */
export async function revokeOtherSessionsAction(): Promise<ActionResult> {
  await requireAuth();
  try {
    await auth.api.revokeOtherSessions({ headers: await headers() });
    revalidatePath("/dashboard/settings/security");
    return { success: true, data: undefined };
  } catch {
    return fail("Impossible de révoquer les sessions.");
  }
}

/** Export complet du compte (données JSON). */
export async function exportAccountAction(): Promise<ActionResult<Record<string, unknown>>> {
  const user = await requireAuth();
  const data = await exportAccount(user.id);
  return { success: true, data };
}

/** Importe des transactions validées. */
export async function importTransactionsAction(rows: unknown): Promise<ActionResult<ImportResult>> {
  const user = await requireAuth();
  const parsed = importRowSchema.array().safeParse(rows);
  if (!parsed.success) return fail("Fichier invalide.");

  const result = await importTransactions(user.id, parsed.data);
  await recalculateUserBudgets(user.id);
  revalidatePath("/dashboard");
  return { success: true, data: result };
}
