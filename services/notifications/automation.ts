import "server-only";

import {
  generateBudgetAlerts,
  generateSavingAlerts,
  generateExpenseAlerts,
  generateIncomeAlerts,
} from "@/services/notifications/notification.service";

/**
 * Moteur d'automatisations : déclenche les règles de génération de
 * notifications après un événement métier. Chaque appel est protégé pour ne
 * jamais faire échouer l'action principale (best-effort).
 */

async function safe(run: () => Promise<void>): Promise<void> {
  try {
    await run();
  } catch (error) {
    console.error("[notifications] automation failed:", error);
  }
}

/** Après création d'une dépense : alerte grosse dépense + seuils de budgets. */
export async function onExpenseCreated(
  userId: string,
  expense: { id: string; title: string; amount: number },
): Promise<void> {
  await safe(async () => {
    await generateExpenseAlerts(userId, expense);
    await generateBudgetAlerts(userId);
  });
}

/** Après modification/suppression d'une dépense : réévalue les budgets. */
export async function onExpenseChanged(userId: string): Promise<void> {
  await safe(() => generateBudgetAlerts(userId));
}

/** Après création/modification d'un budget : réévalue les seuils. */
export async function onBudgetChanged(userId: string): Promise<void> {
  await safe(() => generateBudgetAlerts(userId));
}

/** Après ajout d'une contribution : alertes d'épargne (atteint, échéance). */
export async function onContributionAdded(userId: string): Promise<void> {
  await safe(() => generateSavingAlerts(userId));
}

/** Après création d'un revenu : alerte revenu important. */
export async function onIncomeCreated(
  userId: string,
  income: { id: string; title: string; amount: number },
): Promise<void> {
  await safe(() => generateIncomeAlerts(userId, income));
}
