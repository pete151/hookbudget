import type { FinancialContext, SummaryData } from "@/domain/ai/types";

/**
 * Résumés périodiques PURS (hebdomadaire, mensuel, annuel) dérivés du contexte.
 * Chaque résumé se base uniquement sur des chiffres réels : rien n'est inventé.
 */

function round(n: number): number {
  return Math.round(n);
}

/** Résumé hebdomadaire à partir des transactions des 7 derniers jours. */
export function buildWeeklySummary(ctx: FinancialContext): SummaryData {
  const since = new Date();
  since.setDate(since.getDate() - 7);

  let income = 0;
  let expense = 0;
  let count = 0;
  for (const t of ctx.recentTransactions) {
    if (new Date(t.date) < since) continue;
    count++;
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  }

  const highlights: string[] = [];
  highlights.push(`${count} transaction(s) sur les 7 derniers jours.`);
  if (expense > income) {
    highlights.push("Vos dépenses ont dépassé vos revenus cette semaine.");
  } else if (income > 0) {
    highlights.push("Votre semaine est équilibrée ou excédentaire.");
  }

  return {
    period: "weekly",
    title: "Résumé de la semaine",
    income: round(income),
    expense: round(expense),
    balance: round(income - expense),
    highlights,
  };
}

/** Résumé mensuel basé sur le mois courant. */
export function buildMonthlySummary(ctx: FinancialContext): SummaryData {
  const { monthIncome, monthExpense, monthBalance, savingsRate } = ctx.summary;
  const highlights: string[] = [];

  const topExpense = ctx.topExpenseCategories[0];
  if (topExpense) {
    highlights.push(
      `Premier poste de dépense : « ${topExpense.name} » (${round(topExpense.amount)}).`,
    );
  }
  highlights.push(`Taux d'épargne du mois : ${round(savingsRate)} %.`);
  if (monthBalance >= 0) {
    highlights.push("Vous êtes dans le vert ce mois-ci.");
  } else {
    highlights.push("Attention, vos dépenses dépassent vos revenus ce mois-ci.");
  }

  return {
    period: "monthly",
    title: "Résumé du mois",
    income: round(monthIncome),
    expense: round(monthExpense),
    balance: round(monthBalance),
    highlights,
  };
}

/** Résumé annuel basé sur l'historique mensuel disponible. */
export function buildAnnualSummary(ctx: FinancialContext): SummaryData {
  const income = ctx.monthly.reduce((s, m) => s + m.income, 0);
  const expense = ctx.monthly.reduce((s, m) => s + m.expense, 0);
  const balance = income - expense;

  const highlights: string[] = [];
  const activeMonths = ctx.monthly.filter((m) => m.income > 0 || m.expense > 0).length;
  highlights.push(`${activeMonths} mois d'activité sur la période analysée.`);
  if (activeMonths > 0) {
    highlights.push(`Dépense moyenne : ${round(expense / activeMonths)} par mois.`);
  }
  highlights.push(balance >= 0 ? "Bilan global positif." : "Bilan global négatif.");

  return {
    period: "annual",
    title: "Résumé annuel",
    income: round(income),
    expense: round(expense),
    balance: round(balance),
    highlights,
  };
}

/** Construit les trois résumés (hebdo, mensuel, annuel). */
export function buildSummaries(ctx: FinancialContext): SummaryData[] {
  return [buildWeeklySummary(ctx), buildMonthlySummary(ctx), buildAnnualSummary(ctx)];
}
