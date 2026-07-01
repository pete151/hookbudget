import { formatContextForPrompt } from "@/domain/ai/context";
import type { FinancialContext } from "@/domain/ai/types";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts/system";

/**
 * Centralisation des prompts de l'assistant IA.
 * L'invite système est composée du prompt de base + du contexte financier
 * nettoyé de l'utilisateur (construit automatiquement avant chaque appel).
 */

/** Construit l'invite système complète (base + contexte financier). */
export function buildSystemPrompt(ctx: FinancialContext): string {
  return `${SYSTEM_PROMPT}

=== CONTEXTE FINANCIER DE L'UTILISATEUR ===
${formatContextForPrompt(ctx)}
=== FIN DU CONTEXTE ===`;
}

/** Prompt utilisé pour générer un conseil global spontané. */
export const ADVICE_PROMPT =
  "Analyse ma situation financière et donne-moi les 3 conseils les plus utiles pour améliorer ma gestion ce mois-ci. Sois concret et chiffré.";

/** Suggestions de questions proposées à l'utilisateur dans le chat. */
export const SUGGESTED_QUESTIONS: string[] = [
  "Comment réduire mes dépenses ?",
  "Pourquoi mon budget est-il dépassé ?",
  "Combien puis-je économiser ce mois-ci ?",
  "Quelle est ma plus grosse catégorie de dépenses ?",
  "Combien ai-je gagné cette année ?",
];
