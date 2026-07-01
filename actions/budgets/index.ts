"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/server";
import { budgetSchema } from "@/lib/validations/budget";
import {
  createBudget,
  updateBudget,
  deleteBudget,
  BudgetServiceError,
} from "@/services/budgets/budget.service";
import { onBudgetChanged } from "@/services/notifications/automation";

/** Résultat standard d'une Server Action. */
export type ActionResult<T = undefined> =
  { success: true; data: T } | { success: false; error: string };

function revalidateBudgetViews() {
  revalidatePath("/dashboard/budgets");
  revalidatePath("/dashboard");
}

function toErrorMessage(error: unknown): string {
  if (error instanceof BudgetServiceError) return error.message;
  return "Une erreur est survenue. Veuillez réessayer.";
}

/** Crée un budget. */
export async function createBudgetAction(values: unknown): Promise<ActionResult<{ id: string }>> {
  const user = await requireAuth();

  const parsed = budgetSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  try {
    const budget = await createBudget(user.id, parsed.data);
    await onBudgetChanged(user.id);
    revalidateBudgetViews();
    return { success: true, data: { id: budget.id } };
  } catch (error) {
    return { success: false, error: toErrorMessage(error) };
  }
}

/** Modifie un budget. */
export async function updateBudgetAction(
  id: string,
  values: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requireAuth();

  const parsed = budgetSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  try {
    const budget = await updateBudget(user.id, id, parsed.data);
    await onBudgetChanged(user.id);
    revalidateBudgetViews();
    return { success: true, data: { id: budget.id } };
  } catch (error) {
    return { success: false, error: toErrorMessage(error) };
  }
}

/** Supprime un budget. */
export async function deleteBudgetAction(id: string): Promise<ActionResult> {
  const user = await requireAuth();
  try {
    await deleteBudget(user.id, id);
    revalidateBudgetViews();
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: toErrorMessage(error) };
  }
}
