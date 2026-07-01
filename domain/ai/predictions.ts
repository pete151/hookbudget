import type { FinancialContext, Prediction, ContextMonthly } from "@/domain/ai/types";

/**
 * Prévisions PURES basées sur l'historique mensuel (moyenne mobile pondérée).
 *
 * Méthode : on projette le mois à venir à partir de la moyenne des derniers
 * mois, en donnant un poids plus fort au mois récent (lissage simple). Le
 * niveau de confiance dépend du nombre de mois disponibles. Aucune donnée
 * n'est inventée : s'il n'y a pas assez d'historique, aucune prévision n'est
 * produite.
 */

function round(n: number): number {
  return Math.round(n);
}

/** Projection lissée : moyenne pondérée (poids linéaires croissants). */
function forecast(values: number[]): number {
  if (values.length === 0) return 0;
  let weightedSum = 0;
  let weightTotal = 0;
  values.forEach((v, i) => {
    const weight = i + 1; // le plus récent pèse le plus
    weightedSum += v * weight;
    weightTotal += weight;
  });
  return weightTotal > 0 ? weightedSum / weightTotal : 0;
}

function confidenceFor(count: number): Prediction["confidence"] {
  if (count >= 6) return "high";
  if (count >= 3) return "medium";
  return "low";
}

function makePrediction(
  kind: Prediction["kind"],
  label: string,
  current: number,
  predicted: number,
  count: number,
  note: string,
): Prediction {
  const delta = predicted - current;
  const deltaPercent = current !== 0 ? (delta / Math.abs(current)) * 100 : 0;
  return {
    kind,
    label,
    currentValue: round(current),
    predictedValue: round(predicted),
    delta: round(delta),
    deltaPercent: round(deltaPercent),
    confidence: confidenceFor(count),
    note,
  };
}

/** Ne garde que les mois porteurs de mouvement (évite de fausser la moyenne). */
function activeMonths(monthly: ContextMonthly[]): ContextMonthly[] {
  return monthly.filter((m) => m.income > 0 || m.expense > 0);
}

/**
 * Génère les prévisions du mois à venir : solde, dépenses, revenus, épargne.
 * Retourne un tableau vide si l'historique est insuffisant (< 2 mois actifs).
 */
export function generatePredictions(ctx: FinancialContext): Prediction[] {
  const months = activeMonths(ctx.monthly);
  if (months.length < 2) return [];

  const window = months.slice(-6);
  const count = window.length;
  const last = window[window.length - 1];

  const predictedIncome = forecast(window.map((m) => m.income));
  const predictedExpense = forecast(window.map((m) => m.expense));
  const predictedNet = predictedIncome - predictedExpense;
  // Épargne prévue = part de l'excédent prévu (bornée à ≥ 0).
  const predictedSavings = Math.max(0, predictedNet);

  return [
    makePrediction(
      "income",
      "Revenus prévus",
      last.income,
      predictedIncome,
      count,
      "Estimation basée sur vos revenus des derniers mois.",
    ),
    makePrediction(
      "expense",
      "Dépenses prévues",
      last.expense,
      predictedExpense,
      count,
      "Estimation basée sur vos dépenses des derniers mois.",
    ),
    makePrediction(
      "balance",
      "Solde prévu",
      last.net,
      predictedNet,
      count,
      "Différence prévue entre revenus et dépenses.",
    ),
    makePrediction(
      "savings",
      "Épargne possible",
      Math.max(0, last.net),
      predictedSavings,
      count,
      "Excédent que vous pourriez mettre de côté le mois prochain.",
    ),
  ];
}
