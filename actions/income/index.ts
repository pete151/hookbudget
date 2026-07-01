"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/server";
import { incomeSchema } from "@/lib/validations/income";
import {
  createIncome,
  updateIncome,
  deleteIncome,
  IncomeServiceError,
} from "@/services/income/income.service";
import { onIncomeCreated } from "@/services/notifications/automation";

/** Résultat standard d'une Server Action. */
export type ActionResult<T = undefined> =
  { success: true; data: T } | { success: false; error: string };

/** Revalide toutes les vues impactées par un mouvement de revenu. */
function revalidateIncomeViews() {
  revalidatePath("/dashboard/income");
  revalidatePath("/dashboard");
}

function toErrorMessage(error: unknown): string {
  if (error instanceof IncomeServiceError) return error.message;
  return "Une erreur est survenue. Veuillez réessayer.";
}

/** Crée un revenu. */
export async function createIncomeAction(values: unknown): Promise<ActionResult<{ id: string }>> {
  const user = await requireAuth();

  const parsed = incomeSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  try {
    const income = await createIncome(user.id, parsed.data);
    await onIncomeCreated(user.id, { id: income.id, title: income.title, amount: income.amount });
    revalidateIncomeViews();
    return { success: true, data: { id: income.id } };
  } catch (error) {
    return { success: false, error: toErrorMessage(error) };
  }
}

/** Modifie un revenu. */
export async function updateIncomeAction(
  id: string,
  values: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requireAuth();

  const parsed = incomeSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  try {
    const income = await updateIncome(user.id, id, parsed.data);
    revalidateIncomeViews();
    return { success: true, data: { id: income.id } };
  } catch (error) {
    return { success: false, error: toErrorMessage(error) };
  }
}

/** Supprime un revenu. */
export async function deleteIncomeAction(id: string): Promise<ActionResult> {
  const user = await requireAuth();
  try {
    await deleteIncome(user.id, id);
    revalidateIncomeViews();
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: toErrorMessage(error) };
  }
}
