import "server-only";

import {
  detectBudgetsAtRisk,
  detectCostlyCategories,
  detectExpenseSpike,
  detectIncomeEvolution,
} from "@/domain/ai/analysis";
import { generatePredictions } from "@/domain/ai/predictions";
import { buildMonthlySummary } from "@/domain/ai/summary";
import type { FinancialContext, InsightCard, Prediction, SummaryData } from "@/domain/ai/types";
import { ADVICE_PROMPT } from "@/lib/ai/prompts";
import type { AIChatMessage, AIProvider } from "@/lib/ai/types";

/**
 * Classe de base des fournisseurs IA.
 *
 * Elle implémente une fois pour toutes les analyses, prévisions et résumés
 * DÉTERMINISTES (identiques quel que soit le fournisseur, car dérivés des
 * données). Chaque fournisseur concret n'a plus qu'à fournir la génération de
 * texte par modèle de langage (`answerQuestion`).
 */
export abstract class BaseAIProvider implements AIProvider {
  abstract readonly name: string;
  abstract readonly available: boolean;

  /** Réponse en streaming — spécifique au fournisseur (LLM ou déterministe). */
  abstract answerQuestion(
    ctx: FinancialContext,
    history: AIChatMessage[],
    question: string,
  ): AsyncIterable<string>;

  /** Conseil global : consomme le flux de `answerQuestion` avec un prompt fixe. */
  async generateAdvice(ctx: FinancialContext): Promise<string> {
    let out = "";
    for await (const chunk of this.answerQuestion(ctx, [], ADVICE_PROMPT)) {
      out += chunk;
    }
    return out.trim();
  }

  analyzeBudget(ctx: FinancialContext): InsightCard[] {
    return detectBudgetsAtRisk(ctx);
  }

  analyzeExpenses(ctx: FinancialContext): InsightCard[] {
    return [...detectExpenseSpike(ctx), ...detectCostlyCategories(ctx)];
  }

  analyzeIncome(ctx: FinancialContext): InsightCard[] {
    return detectIncomeEvolution(ctx);
  }

  predictCashFlow(ctx: FinancialContext): Prediction[] {
    return generatePredictions(ctx);
  }

  generateMonthlySummary(ctx: FinancialContext): SummaryData {
    return buildMonthlySummary(ctx);
  }
}
