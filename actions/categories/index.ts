"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/server";
import { categorySchema } from "@/lib/validations/category";
import {
  archiveCategory,
  createCategory,
  deleteCategory,
  restoreCategory,
  updateCategory,
  CategoryServiceError,
} from "@/services/categories/categories.service";

/** Résultat standard d'une Server Action. */
export type ActionResult = { success: true } | { success: false; error: string };

const CATEGORIES_PATH = "/dashboard/categories";

/** Traduit une erreur inconnue en message clair. */
function toErrorMessage(error: unknown): string {
  if (error instanceof CategoryServiceError) return error.message;
  return "Une erreur est survenue. Veuillez réessayer.";
}

/** Crée une catégorie personnelle. */
export async function createCategoryAction(values: unknown): Promise<ActionResult> {
  const user = await requireAuth();

  const parsed = categorySchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  try {
    await createCategory(user.id, parsed.data);
    revalidatePath(CATEGORIES_PATH);
    return { success: true };
  } catch (error) {
    return { success: false, error: toErrorMessage(error) };
  }
}

/** Modifie une catégorie personnelle. */
export async function updateCategoryAction(id: string, values: unknown): Promise<ActionResult> {
  const user = await requireAuth();

  const parsed = categorySchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  try {
    await updateCategory(user.id, id, parsed.data);
    revalidatePath(CATEGORIES_PATH);
    return { success: true };
  } catch (error) {
    return { success: false, error: toErrorMessage(error) };
  }
}

/** Archive une catégorie personnelle. */
export async function archiveCategoryAction(id: string): Promise<ActionResult> {
  const user = await requireAuth();
  try {
    await archiveCategory(user.id, id);
    revalidatePath(CATEGORIES_PATH);
    return { success: true };
  } catch (error) {
    return { success: false, error: toErrorMessage(error) };
  }
}

/** Restaure une catégorie personnelle archivée. */
export async function restoreCategoryAction(id: string): Promise<ActionResult> {
  const user = await requireAuth();
  try {
    await restoreCategory(user.id, id);
    revalidatePath(CATEGORIES_PATH);
    return { success: true };
  } catch (error) {
    return { success: false, error: toErrorMessage(error) };
  }
}

/** Supprime définitivement une catégorie personnelle. */
export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  const user = await requireAuth();
  try {
    await deleteCategory(user.id, id);
    revalidatePath(CATEGORIES_PATH);
    return { success: true };
  } catch (error) {
    return { success: false, error: toErrorMessage(error) };
  }
}
