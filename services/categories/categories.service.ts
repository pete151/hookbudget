import "server-only";

import { TransactionType, type Category } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import type { CategoryFormValues } from "@/lib/validations/category";

/**
 * Couche de services des catégories.
 *
 * Règles transverses :
 *   - Un utilisateur ne voit QUE ses catégories + les catégories système
 *     (`userId = null`). Jamais celles d'un autre utilisateur.
 *   - Les catégories système (`isDefault` / `userId = null`) sont en lecture
 *     seule : impossible à modifier, archiver ou supprimer.
 */

export type CategoryKind = "income" | "expense";

export interface CategoryView {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  type: CategoryKind;
  isDefault: boolean;
  isArchived: boolean;
  sortOrder: number;
  isSystem: boolean;
  /** Nombre d'utilisations réelles (dépenses + revenus + budgets). */
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Erreur métier renvoyée par les services (mappée en message clair par l'action). */
export class CategoryServiceError extends Error {}

// ── Mapping enum ↔ formulaire ──────────────────────────────────────────────

const toDbType = (t: CategoryKind): TransactionType =>
  t === "income" ? TransactionType.INCOME : TransactionType.EXPENSE;

const fromDbType = (t: TransactionType): CategoryKind =>
  t === TransactionType.INCOME ? "income" : "expense";

function toView(
  category: Category & { _count?: { expenses: number; incomes: number; budgets: number } },
): CategoryView {
  const counts = category._count;
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    icon: category.icon,
    color: category.color,
    type: fromDbType(category.type),
    isDefault: category.isDefault,
    isArchived: category.isArchived,
    sortOrder: category.sortOrder,
    isSystem: category.userId === null || category.isDefault,
    usageCount: counts ? counts.expenses + counts.incomes + counts.budgets : 0,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

/**
 * Charge une catégorie et vérifie qu'elle est **modifiable par cet utilisateur**
 * (lui appartient et n'est pas une catégorie système). Lève sinon.
 */
async function loadEditableCategory(userId: string, categoryId: string): Promise<Category> {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });

  if (!category || (category.userId !== userId && category.userId !== null)) {
    throw new CategoryServiceError("Catégorie introuvable.");
  }
  if (category.userId === null || category.isDefault) {
    throw new CategoryServiceError("Les catégories système ne peuvent pas être modifiées.");
  }
  return category;
}

// ── Lecture ────────────────────────────────────────────────────────────────

/** Toutes les catégories visibles (système + personnelles), avec usage. */
export async function getCategories(userId: string): Promise<CategoryView[]> {
  const categories = await prisma.category.findMany({
    where: { OR: [{ userId }, { userId: null }] },
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { expenses: true, incomes: true, budgets: true } } },
  });
  return categories.map(toView);
}

/** Catégories de dépenses actives (système + personnelles). */
export async function getExpenseCategories(userId: string): Promise<CategoryView[]> {
  const categories = await prisma.category.findMany({
    where: { type: TransactionType.EXPENSE, isArchived: false, OR: [{ userId }, { userId: null }] },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return categories.map(toView);
}

/** Catégories de revenus actives (système + personnelles). */
export async function getIncomeCategories(userId: string): Promise<CategoryView[]> {
  const categories = await prisma.category.findMany({
    where: { type: TransactionType.INCOME, isArchived: false, OR: [{ userId }, { userId: null }] },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return categories.map(toView);
}

// ── Écriture ─────────────────────────────────────────────────────────────

/** Crée une catégorie personnelle. */
export async function createCategory(
  userId: string,
  data: CategoryFormValues,
): Promise<CategoryView> {
  const last = await prisma.category.findFirst({
    where: { userId, type: toDbType(data.type) },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const created = await prisma.category.create({
    data: {
      name: data.name,
      description: data.description?.trim() ? data.description.trim() : null,
      icon: data.icon,
      color: data.color,
      type: toDbType(data.type),
      isDefault: false,
      userId,
      sortOrder: (last?.sortOrder ?? 0) + 1,
    },
  });
  return toView(created);
}

/** Modifie une catégorie personnelle. */
export async function updateCategory(
  userId: string,
  categoryId: string,
  data: CategoryFormValues,
): Promise<CategoryView> {
  await loadEditableCategory(userId, categoryId);

  const updated = await prisma.category.update({
    where: { id: categoryId },
    data: {
      name: data.name,
      description: data.description?.trim() ? data.description.trim() : null,
      icon: data.icon,
      color: data.color,
      type: toDbType(data.type),
    },
  });
  return toView(updated);
}

/** Archive une catégorie personnelle (masquée sans être supprimée). */
export async function archiveCategory(userId: string, categoryId: string): Promise<CategoryView> {
  await loadEditableCategory(userId, categoryId);
  const updated = await prisma.category.update({
    where: { id: categoryId },
    data: { isArchived: true },
  });
  return toView(updated);
}

/** Restaure une catégorie personnelle archivée. */
export async function restoreCategory(userId: string, categoryId: string): Promise<CategoryView> {
  await loadEditableCategory(userId, categoryId);
  const updated = await prisma.category.update({
    where: { id: categoryId },
    data: { isArchived: false },
  });
  return toView(updated);
}

/** Supprime définitivement une catégorie personnelle. */
export async function deleteCategory(userId: string, categoryId: string): Promise<void> {
  await loadEditableCategory(userId, categoryId);
  await prisma.category.delete({ where: { id: categoryId } });
}
