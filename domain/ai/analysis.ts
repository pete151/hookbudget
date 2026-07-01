import type { FinancialContext, InsightCard } from "@/domain/ai/types";

/**
 * Analyse financière PURE (aucun accès base, aucun appel réseau).
 *
 * Chaque détecteur transforme le contexte en cartes d'insight en s'appuyant
 * UNIQUEMENT sur les chiffres fournis — jamais d'invention. Les seuils sont
 * volontairement explicites et documentés.
 */

/** Seuils métier (en pourcentage sauf mention contraire). */
const THRESHOLDS = {
  expenseSpike: 15, // hausse mensuelle des dépenses jugée « inhabituelle »
  costlyCategory: 35, // part d'une catégorie dans les dépenses/revenus
  budgetAtRisk: 80, // consommation d'un budget
  lowSavingsRate: 10, // taux d'épargne considéré comme faible
} as const;

function round(n: number): number {
  return Math.round(n);
}

/** Moyenne d'une série (0 si vide). */
function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

/** Détecte une hausse inhabituelle des dépenses du dernier mois vs la moyenne. */
export function detectExpenseSpike(ctx: FinancialContext): InsightCard[] {
  const months = ctx.monthly;
  if (months.length < 3) return [];
  const last = months[months.length - 1];
  const previous = months.slice(0, -1).map((m) => m.expense);
  const avg = average(previous);
  if (avg <= 0 || last.expense <= 0) return [];

  const variation = ((last.expense - avg) / avg) * 100;
  if (variation < THRESHOLDS.expenseSpike) return [];

  return [
    {
      type: "ALERT",
      severity: "warning",
      title: "Hausse inhabituelle des dépenses",
      message: `Vos dépenses de ${last.label} ont augmenté de ${round(variation)} % par rapport à votre moyenne des mois précédents.`,
      actionLabel: "Voir les dépenses",
      actionUrl: "/dashboard/expenses",
    },
  ];
}

/** Signale une catégorie de dépense trop coûteuse (part élevée). */
export function detectCostlyCategories(ctx: FinancialContext): InsightCard[] {
  const totalExpense = ctx.summary.monthExpense;
  const income = ctx.summary.monthIncome;
  const cards: InsightCard[] = [];

  for (const cat of ctx.topExpenseCategories.slice(0, 3)) {
    // Part dans les revenus si disponibles, sinon dans les dépenses.
    const base = income > 0 ? income : totalExpense;
    if (base <= 0) continue;
    const share = (cat.amount / base) * 100;
    if (share < THRESHOLDS.costlyCategory) continue;

    cards.push({
      type: "ALERT",
      severity: "warning",
      title: `Catégorie coûteuse : ${cat.name}`,
      message:
        income > 0
          ? `Vous dépensez ${round(share)} % de vos revenus en « ${cat.name} ».`
          : `« ${cat.name} » représente ${round(share)} % de vos dépenses.`,
      actionLabel: "Analyser",
      actionUrl: "/dashboard/expenses",
    });
  }
  return cards;
}

/** Détecte une opportunité d'épargne (solde positif, épargne faible). */
export function detectSavingOpportunities(ctx: FinancialContext): InsightCard[] {
  const { monthBalance, savingsRate, monthIncome } = ctx.summary;
  if (monthIncome <= 0) return [];
  if (monthBalance <= 0) return [];
  if (savingsRate >= THRESHOLDS.lowSavingsRate) return [];

  return [
    {
      type: "OPPORTUNITY",
      severity: "info",
      title: "Opportunité d'épargne",
      message: `Votre solde du mois est positif (${round(monthBalance)}) mais votre taux d'épargne n'est que de ${round(savingsRate)} %. Vous pourriez mettre de côté une partie de cet excédent.`,
      actionLabel: "Créer un objectif",
      actionUrl: "/dashboard/savings",
    },
  ];
}

/** Signale les budgets à risque (consommation élevée). */
export function detectBudgetsAtRisk(ctx: FinancialContext): InsightCard[] {
  return ctx.budgets
    .filter((b) => b.percent >= THRESHOLDS.budgetAtRisk)
    .slice(0, 3)
    .map((b) => ({
      type: "ALERT",
      severity: b.percent >= 100 ? "danger" : "warning",
      title: b.percent >= 100 ? `Budget dépassé : ${b.name}` : `Budget à risque : ${b.name}`,
      message:
        b.percent >= 100
          ? `Le budget « ${b.name} » est consommé à ${round(b.percent)} % (dépassement).`
          : `Le budget « ${b.name} » est déjà consommé à ${round(b.percent)} %. Il reste ${round(b.remaining)}.`,
      actionLabel: "Voir les budgets",
      actionUrl: "/dashboard/budgets",
    }));
}

/** Détecte les objectifs d'épargne difficilement atteignables. */
export function detectHardGoals(ctx: FinancialContext): InsightCard[] {
  const cards: InsightCard[] = [];
  for (const g of ctx.goals) {
    if (g.monthsLeft == null || g.monthsLeft <= 0) continue;
    if (g.percent >= 100) continue;
    const remaining = g.target - g.current;
    if (remaining <= 0) continue;

    const requiredPerMonth = remaining / g.monthsLeft;
    // Capacité mensuelle estimée = solde du mois (excédent disponible).
    const capacity = ctx.summary.monthBalance;
    if (capacity > 0 && requiredPerMonth <= capacity) continue;

    cards.push({
      type: "ADVICE",
      severity: "warning",
      title: `Objectif serré : ${g.name}`,
      message: `Pour atteindre « ${g.name} » à temps, il faudrait épargner environ ${round(requiredPerMonth)} par mois pendant ${g.monthsLeft} mois — au-delà de votre excédent mensuel actuel.`,
      actionLabel: "Ajuster l'objectif",
      actionUrl: "/dashboard/savings",
    });
  }
  return cards.slice(0, 2);
}

/** Analyse l'évolution des revenus (tendance sur les derniers mois). */
export function detectIncomeEvolution(ctx: FinancialContext): InsightCard[] {
  const months = ctx.monthly;
  if (months.length < 4) return [];
  const recent = average(months.slice(-2).map((m) => m.income));
  const older = average(months.slice(-4, -2).map((m) => m.income));
  if (older <= 0) return [];

  const variation = ((recent - older) / older) * 100;
  if (Math.abs(variation) < THRESHOLDS.expenseSpike) return [];

  const up = variation > 0;
  return [
    {
      type: up ? "SUCCESS" : "ADVICE",
      severity: up ? "success" : "warning",
      title: up ? "Revenus en hausse" : "Revenus en baisse",
      message: up
        ? `Vos revenus ont progressé d'environ ${round(variation)} % sur les deux derniers mois.`
        : `Vos revenus ont diminué d'environ ${round(Math.abs(variation))} % sur les deux derniers mois. Surveillez vos dépenses en conséquence.`,
      actionLabel: "Voir les revenus",
      actionUrl: "/dashboard/income",
    },
  ];
}

/** Met en avant les réussites (solde positif, objectif atteint). */
export function detectSuccesses(ctx: FinancialContext): InsightCard[] {
  const cards: InsightCard[] = [];
  const completed = ctx.goals.find((g) => g.percent >= 100);
  if (completed) {
    cards.push({
      type: "SUCCESS",
      severity: "success",
      title: "Objectif atteint 🎉",
      message: `Félicitations, vous avez atteint votre objectif « ${completed.name} » !`,
      actionLabel: "Voir mes objectifs",
      actionUrl: "/dashboard/savings",
    });
  } else if (ctx.summary.savingsRate >= 20) {
    cards.push({
      type: "SUCCESS",
      severity: "success",
      title: "Bon taux d'épargne",
      message: `Vous épargnez ${round(ctx.summary.savingsRate)} % de vos revenus ce mois-ci. Continuez ainsi !`,
    });
  }
  return cards;
}

/** Ordre d'affichage des insights (les alertes/dangers en premier). */
const SEVERITY_ORDER: Record<InsightCard["severity"], number> = {
  danger: 0,
  warning: 1,
  info: 2,
  success: 3,
};

/**
 * Génère l'ensemble des cartes d'insight à partir du contexte.
 * Résultat trié par gravité, puis limité pour rester lisible.
 */
export function generateInsights(ctx: FinancialContext): InsightCard[] {
  const cards = [
    ...detectBudgetsAtRisk(ctx),
    ...detectExpenseSpike(ctx),
    ...detectCostlyCategories(ctx),
    ...detectHardGoals(ctx),
    ...detectIncomeEvolution(ctx),
    ...detectSavingOpportunities(ctx),
    ...detectSuccesses(ctx),
  ];

  cards.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  return cards.slice(0, 8);
}
