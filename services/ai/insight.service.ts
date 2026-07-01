import "server-only";

import { generateInsights } from "@/domain/ai/analysis";
import { generatePredictions } from "@/domain/ai/predictions";
import { buildSummaries } from "@/domain/ai/summary";
import type { FinancialContext, InsightCard, Prediction, SummaryData } from "@/domain/ai/types";
import { buildFinancialContext } from "@/services/ai/context.service";

/**
 * Analyses automatiques (insights), prévisions et résumés.
 *
 * Le contexte financier est mis en CACHE en mémoire pendant une courte durée
 * (par utilisateur) afin d'éviter de recalculer les mêmes agrégats à chaque
 * navigation et d'économiser les appels inutiles. Les analyses elles-mêmes sont
 * déterministes (dérivées du contexte).
 */

const CACHE_TTL_MS = 60_000;

interface CacheEntry {
  expires: number;
  context: FinancialContext;
}

const contextCache = new Map<string, CacheEntry>();

interface ProfileInput {
  name: string;
  firstName?: string | null;
  currency?: string | null;
}

/** Récupère le contexte (depuis le cache si valide), sinon le reconstruit. */
export async function getCachedContext(
  userId: string,
  profile: ProfileInput,
  force = false,
): Promise<FinancialContext> {
  const cached = contextCache.get(userId);
  if (!force && cached && cached.expires > Date.now()) {
    return cached.context;
  }
  const context = await buildFinancialContext(userId, profile);
  contextCache.set(userId, { expires: Date.now() + CACHE_TTL_MS, context });
  return context;
}

/** Invalide le cache de contexte d'un utilisateur (après mutation de données). */
export function invalidateContextCache(userId: string): void {
  contextCache.delete(userId);
}

export interface AiOverview {
  insights: InsightCard[];
  predictions: Prediction[];
  summaries: SummaryData[];
  available: boolean;
}

/** Assemble l'aperçu IA (insights + prévisions + résumés) pour le tableau de bord IA. */
export async function getAiOverview(userId: string, profile: ProfileInput): Promise<AiOverview> {
  const context = await getCachedContext(userId, profile);
  return {
    insights: generateInsights(context),
    predictions: generatePredictions(context),
    summaries: buildSummaries(context),
    available: true,
  };
}

/** Insights seuls (page dédiée). */
export async function getInsights(userId: string, profile: ProfileInput): Promise<InsightCard[]> {
  const context = await getCachedContext(userId, profile);
  return generateInsights(context);
}
