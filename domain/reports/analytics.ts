import type {
  CashFlowPoint,
  CategoryLine,
  MonthlyComparisonLine,
  ReportSummary,
} from "@/domain/reports/types";

/**
 * Logique métier PURE d'analyse financière (aucun accès base).
 * Prend des données déjà agrégées et calcule les métriques dérivées.
 */

const MONTH_LABELS = [
  "janv.",
  "févr.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "août",
  "sept.",
  "oct.",
  "nov.",
  "déc.",
];

/** Résumé financier à partir des totaux. */
export function computeSummary(income: number, expense: number, savings: number): ReportSummary {
  return {
    income,
    expense,
    balance: income - expense,
    savings,
    savingsRate: income > 0 ? Math.round((savings / income) * 100) : 0,
  };
}

/** Liste des clés de mois `YYYY-MM` (avec libellé) entre deux dates incluses. */
export function monthBuckets(from: Date, to: Date): { key: string; label: string }[] {
  const result: { key: string; label: string }[] = [];
  const cursor = new Date(from.getFullYear(), from.getMonth(), 1);
  const end = new Date(to.getFullYear(), to.getMonth(), 1);
  // Sécurité : borne à 24 mois pour éviter les périodes démesurées.
  let guard = 0;
  while (cursor <= end && guard < 24) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    result.push({ key, label: MONTH_LABELS[cursor.getMonth()] });
    cursor.setMonth(cursor.getMonth() + 1);
    guard++;
  }
  return result;
}

/** Projette des sommes mensuelles (par clé) sur des buckets, revenus vs dépenses. */
export function buildMonthly(
  buckets: { key: string; label: string }[],
  incomeByKey: Map<string, number>,
  expenseByKey: Map<string, number>,
): MonthlyComparisonLine[] {
  return buckets.map((b) => ({
    label: b.label,
    income: incomeByKey.get(b.key) ?? 0,
    expense: expenseByKey.get(b.key) ?? 0,
  }));
}

/** Flux de trésorerie = revenus, dépenses et net par mois. */
export function buildCashFlow(monthly: MonthlyComparisonLine[]): CashFlowPoint[] {
  return monthly.map((m) => ({
    label: m.label,
    income: m.income,
    expense: m.expense,
    net: m.income - m.expense,
  }));
}

/** Ajoute le pourcentage de chaque tranche par rapport au total. */
export function withPercent(
  slices: { name: string; color: string; value: number }[],
): CategoryLine[] {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  return slices
    .filter((s) => s.value > 0)
    .map((s) => ({
      ...s,
      percent: total > 0 ? Math.round((s.value / total) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value);
}
