import type { NotificationType, NotificationPriority } from "@prisma/client";

/**
 * Règles métier de génération des notifications (logique PURE, sans accès base).
 * Chaque règle renvoie une (ou plusieurs) « spec » que la couche service se
 * charge de persister — en appliquant les préférences et l'anti-doublon.
 */

export interface NotificationSpec {
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  actionUrl?: string;
  /** Clé d'idempotence : empêche les doublons pour un même événement. */
  dedupeKey: string;
  metadata?: Record<string, unknown>;
}

/** Formate un montant simple (le service ne connaît pas la locale ici). */
function money(amount: number): string {
  return new Intl.NumberFormat("fr-FR").format(Math.round(amount));
}

// ── Budgets ────────────────────────────────────────────────────────────────

export interface BudgetRuleInput {
  id: string;
  name: string;
  percent: number;
  alert50: boolean;
  alert80: boolean;
  alert100: boolean;
}

/** Alertes de seuils (50 / 80 / 100 %) pour un budget. */
export function budgetThresholdSpecs(budget: BudgetRuleInput): NotificationSpec[] {
  const specs: NotificationSpec[] = [];
  const base = { type: "BUDGET" as NotificationType, actionUrl: `/dashboard/budgets/${budget.id}` };

  if (budget.alert100 && budget.percent >= 100) {
    specs.push({
      ...base,
      priority: "HIGH",
      title: "Budget dépassé",
      message: `Le budget « ${budget.name} » a dépassé 100 % (${budget.percent} %).`,
      dedupeKey: `budget:${budget.id}:100`,
      metadata: { budgetId: budget.id, threshold: 100 },
    });
  } else if (budget.alert80 && budget.percent >= 80) {
    specs.push({
      ...base,
      priority: "MEDIUM",
      title: "Budget bientôt atteint",
      message: `Le budget « ${budget.name} » a atteint ${budget.percent} % de sa limite.`,
      dedupeKey: `budget:${budget.id}:80`,
      metadata: { budgetId: budget.id, threshold: 80 },
    });
  } else if (budget.alert50 && budget.percent >= 50) {
    specs.push({
      ...base,
      priority: "LOW",
      title: "Budget à mi-parcours",
      message: `Le budget « ${budget.name} » a atteint ${budget.percent} % de sa limite.`,
      dedupeKey: `budget:${budget.id}:50`,
      metadata: { budgetId: budget.id, threshold: 50 },
    });
  }

  return specs;
}

// ── Épargne ────────────────────────────────────────────────────────────────

export interface SavingRuleInput {
  id: string;
  name: string;
  percent: number;
  status: string;
  daysRemaining: number | null;
  targetDate: Date | null;
}

/** Objectif atteint. */
export function savingReachedSpec(goal: SavingRuleInput): NotificationSpec | null {
  if (goal.status !== "COMPLETED" && goal.percent < 100) return null;
  return {
    type: "SAVING",
    priority: "MEDIUM",
    title: "Objectif atteint 🎉",
    message: `Félicitations ! L'objectif « ${goal.name} » est atteint.`,
    actionUrl: `/dashboard/savings/${goal.id}`,
    dedupeKey: `saving:reached:${goal.id}`,
    metadata: { goalId: goal.id },
  };
}

/** Objectif approchant de son échéance (dans les `withinDays` jours). */
export function savingDeadlineSpec(goal: SavingRuleInput, withinDays = 7): NotificationSpec | null {
  if (goal.status !== "ACTIVE" || goal.targetDate === null || goal.daysRemaining === null)
    return null;
  if (goal.daysRemaining < 0 || goal.daysRemaining > withinDays) return null;

  return {
    type: "SAVING",
    priority: "MEDIUM",
    title: "Échéance proche",
    message: `L'objectif « ${goal.name} » arrive à échéance dans ${goal.daysRemaining} jour(s).`,
    actionUrl: `/dashboard/savings/${goal.id}`,
    dedupeKey: `saving:deadline:${goal.id}:${goal.targetDate.toISOString().slice(0, 10)}`,
    metadata: { goalId: goal.id },
  };
}

// ── Dépenses / Revenus ────────────────────────────────────────────────────

export function largeExpenseSpec(
  expense: { id: string; title: string; amount: number },
  threshold: number,
): NotificationSpec | null {
  if (expense.amount < threshold) return null;
  return {
    type: "EXPENSE",
    priority: "MEDIUM",
    title: "Dépense importante",
    message: `Une dépense importante de ${money(expense.amount)} a été enregistrée (« ${expense.title} »).`,
    actionUrl: `/dashboard/expenses/${expense.id}`,
    dedupeKey: `expense:large:${expense.id}`,
    metadata: { expenseId: expense.id, amount: expense.amount },
  };
}

export function largeIncomeSpec(
  income: { id: string; title: string; amount: number },
  threshold: number,
): NotificationSpec | null {
  if (income.amount < threshold) return null;
  return {
    type: "INCOME",
    priority: "LOW",
    title: "Revenu important",
    message: `Un revenu important de ${money(income.amount)} a été ajouté (« ${income.title} »).`,
    actionUrl: `/dashboard/income/${income.id}`,
    dedupeKey: `income:large:${income.id}`,
    metadata: { incomeId: income.id, amount: income.amount },
  };
}

// ── Système ────────────────────────────────────────────────────────────────

export function welcomeSpec(): NotificationSpec {
  return {
    type: "SYSTEM",
    priority: "LOW",
    title: "Bienvenue sur HookBudget 👋",
    message: "Votre compte est prêt. Commencez par créer une catégorie, un revenu ou un budget.",
    actionUrl: "/dashboard",
    dedupeKey: "system:welcome",
  };
}
