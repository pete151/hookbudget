"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/server";
import { expenseSchema } from "@/lib/validations/expense";
import {
  createExpense,
  updateExpense,
  deleteExpense,
  ExpenseServiceError,
} from "@/services/expenses/expense.service";
import { recalculateUserBudgets } from "@/services/budgets/budget.service";
import { onExpenseCreated, onExpenseChanged } from "@/services/notifications/automation";

/** Résultat standard d'une Server Action. */
export type ActionResult<T = undefined> =
  { success: true; data: T } | { success: false; error: string };

/** Revalide toutes les vues impactées par un mouvement de dépense. */
function revalidateExpenseViews() {
  revalidatePath("/dashboard/expenses");
  revalidatePath("/dashboard/budgets");
  revalidatePath("/dashboard");
}

function toErrorMessage(error: unknown): string {
  if (error instanceof ExpenseServiceError) return error.message;
  return "Une erreur est survenue. Veuillez réessayer.";
}

/** Crée une dépense. */
export async function createExpenseAction(values: unknown): Promise<ActionResult<{ id: string }>> {
  const user = await requireAuth();

  const parsed = expenseSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  try {
    const expense = await createExpense(user.id, parsed.data);
    await recalculateUserBudgets(user.id);
    await onExpenseCreated(user.id, {
      id: expense.id,
      title: expense.title,
      amount: expense.amount,
    });
    revalidateExpenseViews();
    return { success: true, data: { id: expense.id } };
  } catch (error) {
    return { success: false, error: toErrorMessage(error) };
  }
}

/** Modifie une dépense. */
export async function updateExpenseAction(
  id: string,
  values: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requireAuth();

  const parsed = expenseSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  try {
    const expense = await updateExpense(user.id, id, parsed.data);
    await recalculateUserBudgets(user.id);
    await onExpenseChanged(user.id);
    revalidateExpenseViews();
    return { success: true, data: { id: expense.id } };
  } catch (error) {
    return { success: false, error: toErrorMessage(error) };
  }
}

/** Supprime une dépense. */
export async function deleteExpenseAction(id: string): Promise<ActionResult> {
  const user = await requireAuth();
  try {
    await deleteExpense(user.id, id);
    await recalculateUserBudgets(user.id);
    await onExpenseChanged(user.id);
    revalidateExpenseViews();
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: toErrorMessage(error) };
  }
}
