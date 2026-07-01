"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/server";
import { savingGoalSchema, contributionSchema } from "@/lib/validations/saving";
import {
  createSavingGoal,
  updateSavingGoal,
  deleteSavingGoal,
  addContribution,
  updateContribution,
  deleteContribution,
  SavingServiceError,
} from "@/services/savings/saving.service";
import { onContributionAdded } from "@/services/notifications/automation";

/** Résultat standard d'une Server Action. */
export type ActionResult<T = undefined> =
  { success: true; data: T } | { success: false; error: string };

function revalidateSavingsViews() {
  revalidatePath("/dashboard/savings");
  revalidatePath("/dashboard");
}

function toErrorMessage(error: unknown): string {
  if (error instanceof SavingServiceError) return error.message;
  return "Une erreur est survenue. Veuillez réessayer.";
}

// ── Objectifs ────────────────────────────────────────────────────────────

/** Crée un objectif d'épargne. */
export async function createSavingGoalAction(
  values: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requireAuth();

  const parsed = savingGoalSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  try {
    const goal = await createSavingGoal(user.id, parsed.data);
    revalidateSavingsViews();
    return { success: true, data: { id: goal.id } };
  } catch (error) {
    return { success: false, error: toErrorMessage(error) };
  }
}

/** Modifie un objectif d'épargne. */
export async function updateSavingGoalAction(
  id: string,
  values: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requireAuth();

  const parsed = savingGoalSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  try {
    const goal = await updateSavingGoal(user.id, id, parsed.data);
    await onContributionAdded(user.id);
    revalidateSavingsViews();
    return { success: true, data: { id: goal.id } };
  } catch (error) {
    return { success: false, error: toErrorMessage(error) };
  }
}

/** Supprime un objectif d'épargne. */
export async function deleteSavingGoalAction(id: string): Promise<ActionResult> {
  const user = await requireAuth();
  try {
    await deleteSavingGoal(user.id, id);
    revalidateSavingsViews();
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: toErrorMessage(error) };
  }
}

// ── Contributions ────────────────────────────────────────────────────────

/** Ajoute une contribution à un objectif. */
export async function addContributionAction(
  goalId: string,
  values: unknown,
): Promise<ActionResult> {
  const user = await requireAuth();

  const parsed = contributionSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  try {
    await addContribution(user.id, goalId, parsed.data);
    await onContributionAdded(user.id);
    revalidateSavingsViews();
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: toErrorMessage(error) };
  }
}

/** Modifie une contribution. */
export async function updateContributionAction(
  contributionId: string,
  values: unknown,
): Promise<ActionResult> {
  const user = await requireAuth();

  const parsed = contributionSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  try {
    await updateContribution(user.id, contributionId, parsed.data);
    revalidateSavingsViews();
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: toErrorMessage(error) };
  }
}

/** Supprime une contribution. */
export async function deleteContributionAction(contributionId: string): Promise<ActionResult> {
  const user = await requireAuth();
  try {
    await deleteContribution(user.id, contributionId);
    revalidateSavingsViews();
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: toErrorMessage(error) };
  }
}
