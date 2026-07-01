import type { FinancialContext, InsightCard, Prediction, SummaryData } from "@/domain/ai/types";

/**
 * Contrats de la couche IA : interface `AIProvider` (couche d'abstraction
 * permettant de changer de fournisseur) et types de messages de chat.
 */

/** Message d'une conversation avec l'assistant. */
export interface AIChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Interface commune à tous les fournisseurs IA.
 *
 * - Les méthodes d'analyse/prévision/résumé sont DÉTERMINISTES (calculées à
 *   partir des données, jamais inventées) et donc identiques quel que soit le
 *   fournisseur — elles sont mutualisées dans `BaseAIProvider`.
 * - Le chat (`answerQuestion`) et le conseil (`generateAdvice`) s'appuient sur
 *   le modèle de langage propre à chaque fournisseur.
 */
export interface AIProvider {
  /** Nom du fournisseur effectif (anthropic, mock, …). */
  readonly name: string;
  /** Indique si un vrai modèle de langage est disponible. */
  readonly available: boolean;

  /** Répond à une question en streaming (flux de fragments de texte). */
  answerQuestion(
    ctx: FinancialContext,
    history: AIChatMessage[],
    question: string,
  ): AsyncIterable<string>;

  /** Génère un conseil global (texte complet). */
  generateAdvice(ctx: FinancialContext): Promise<string>;

  /** Analyse les budgets (insights). */
  analyzeBudget(ctx: FinancialContext): InsightCard[];
  /** Analyse les dépenses (insights). */
  analyzeExpenses(ctx: FinancialContext): InsightCard[];
  /** Analyse les revenus (insights). */
  analyzeIncome(ctx: FinancialContext): InsightCard[];
  /** Prévoit le flux de trésorerie du mois à venir. */
  predictCashFlow(ctx: FinancialContext): Prediction[];
  /** Résumé mensuel. */
  generateMonthlySummary(ctx: FinancialContext): SummaryData;
}

export type { FinancialContext, InsightCard, Prediction, SummaryData };
