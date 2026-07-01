import "server-only";

import { generateInsights } from "@/domain/ai/analysis";
import { generatePredictions } from "@/domain/ai/predictions";
import { buildAnnualSummary } from "@/domain/ai/summary";
import type { FinancialContext } from "@/domain/ai/types";
import { BaseAIProvider } from "@/lib/ai/provider";
import type { AIChatMessage } from "@/lib/ai/types";

/**
 * Fournisseur de repli LOCAL et DÉTERMINISTE (aucune clé requise).
 *
 * Il permet à l'assistant de rester fonctionnel sans modèle de langage : les
 * réponses sont construites uniquement à partir des chiffres réels de
 * l'utilisateur (jamais d'invention), puis diffusées en streaming mot à mot
 * pour reproduire l'expérience de chat.
 */
export class MockProvider extends BaseAIProvider {
  readonly name = "mock";
  readonly available = false;

  async *answerQuestion(
    ctx: FinancialContext,
    _history: AIChatMessage[],
    question: string,
  ): AsyncIterable<string> {
    const answer = buildDeterministicAnswer(ctx, question);
    // Diffusion mot à mot pour l'effet « streaming ».
    const words = answer.split(" ");
    for (let i = 0; i < words.length; i++) {
      yield i === 0 ? words[i] : ` ${words[i]}`;
      await sleep(12);
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function money(n: number, c: string): string {
  return `${Math.round(n)} ${c}`;
}

/** Construit une réponse ancrée dans les données réelles selon la question. */
function buildDeterministicAnswer(ctx: FinancialContext, question: string): string {
  const q = question.toLowerCase();
  const c = ctx.currency;
  const s = ctx.summary;

  // Épargne / économies
  if (/(épargn|econom|économ|mettre de côté|cote)/.test(q)) {
    const predictions = generatePredictions(ctx);
    const savings = predictions.find((p) => p.kind === "savings");
    if (s.monthBalance > 0) {
      const extra = savings
        ? ` D'après vos derniers mois, vous pourriez viser environ ${money(savings.predictedValue, c)} le mois prochain.`
        : "";
      return `Votre solde du mois est de ${money(s.monthBalance, c)} et votre taux d'épargne est de ${Math.round(s.savingsRate)} %. Vous pouvez donc épargner une partie de cet excédent.${extra}`;
    }
    return `Ce mois-ci vos dépenses (${money(s.monthExpense, c)}) dépassent ou égalent vos revenus (${money(s.monthIncome, c)}), il reste donc peu de marge pour épargner. Réduire votre principal poste de dépense libérerait de la capacité d'épargne.`;
  }

  // Budgets
  if (/budget/.test(q)) {
    const atRisk = ctx.budgets.filter((b) => b.percent >= 80);
    if (atRisk.length === 0)
      return "Aucun de vos budgets n'est actuellement en dépassement : tous sont en dessous de 80 % de consommation.";
    const b = atRisk[0];
    return `Le budget « ${b.name} » est consommé à ${Math.round(b.percent)} % (${money(b.spent, c)} sur ${money(b.amount, c)}). ${b.percent >= 100 ? "Il est dépassé" : `Il reste ${money(b.remaining, c)}`}. Réduisez les dépenses de cette enveloppe pour le tenir.`;
  }

  // Plus grosse catégorie de dépenses
  if (/(catégor|categor|plus grosse|poste)/.test(q)) {
    const top = ctx.topExpenseCategories[0];
    if (!top)
      return "Je n'ai pas encore assez de dépenses enregistrées pour identifier votre plus grosse catégorie.";
    return `Votre plus grosse catégorie de dépenses est « ${top.name} » avec ${money(top.amount, c)}, soit ${Math.round(top.percent)} % de vos dépenses.`;
  }

  // Revenus / année / gains
  if (/(revenu|gagn|gain|salaire|année|annee)/.test(q)) {
    const annual = buildAnnualSummary(ctx);
    return `Sur la période analysée, vos revenus cumulés s'élèvent à ${money(annual.income, c)} pour ${money(annual.expense, c)} de dépenses, soit un solde de ${money(annual.balance, c)}. Ce mois-ci, vous avez gagné ${money(s.monthIncome, c)}.`;
  }

  // Réduire les dépenses
  if (/(réduire|reduire|dépens|depens|économiser|couper)/.test(q)) {
    const top = ctx.topExpenseCategories[0];
    const lead = top
      ? `Votre plus gros poste est « ${top.name} » (${money(top.amount, c)}, ${Math.round(top.percent)} %). C'est là que l'effort est le plus rentable.`
      : "Enregistrez d'abord vos dépenses pour identifier les postes à optimiser.";
    return `${lead} Fixez un budget sur cette catégorie et suivez sa consommation ; vos dépenses du mois sont de ${money(s.monthExpense, c)}.`;
  }

  // Réponse par défaut : synthèse + premier insight
  const insights = generateInsights(ctx);
  const first = insights[0];
  const base = `Ce mois-ci : ${money(s.monthIncome, c)} de revenus, ${money(s.monthExpense, c)} de dépenses, solde de ${money(s.monthBalance, c)} (épargne ${Math.round(s.savingsRate)} %).`;
  return first ? `${base} À noter : ${first.message}` : base;
}
