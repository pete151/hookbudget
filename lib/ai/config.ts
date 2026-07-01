import "server-only";

/**
 * Configuration de l'assistant IA (Sprint 13).
 *
 * Le fournisseur est sélectionnable via la variable d'environnement
 * `AI_PROVIDER` (anthropic | openai | gemini | mistral). Par défaut : anthropic.
 * En l'absence de clé pour le fournisseur choisi, l'application bascule
 * automatiquement sur un fournisseur local déterministe (« mock »), de sorte
 * que l'assistant reste FONCTIONNEL sans configuration.
 */

export type AiProviderName = "anthropic" | "openai" | "gemini" | "mistral" | "mock";

const RAW_PROVIDER = (process.env.AI_PROVIDER ?? "anthropic").toLowerCase();

export const AI_CONFIG = {
  /** Fournisseur demandé (avant repli éventuel sur mock). */
  provider: (["anthropic", "openai", "gemini", "mistral"].includes(RAW_PROVIDER)
    ? RAW_PROVIDER
    : "anthropic") as Exclude<AiProviderName, "mock">,

  /** Modèle par défaut du fournisseur Anthropic (Claude). */
  anthropicModel: process.env.AI_MODEL ?? "claude-opus-4-8",

  /** Clés d'API par fournisseur (uniquement lues côté serveur). */
  keys: {
    anthropic: process.env.ANTHROPIC_API_KEY ?? "",
    openai: process.env.OPENAI_API_KEY ?? "",
    gemini: process.env.GEMINI_API_KEY ?? "",
    mistral: process.env.MISTRAL_API_KEY ?? "",
  },

  // ── Limites (tokens, débit, temps) ──────────────────────────────────────
  /** Jetons de sortie maximum par réponse. */
  maxOutputTokens: 1500,
  /** Temps de réponse maximum d'un appel IA (ms). */
  requestTimeoutMs: 60_000,
  /** Nombre maximum de questions par utilisateur et par jour. */
  maxMessagesPerDay: 40,
  /** Nombre maximum de transactions incluses dans le contexte (limite tokens). */
  maxContextTransactions: 15,
  /** Nombre maximum de catégories incluses par famille. */
  maxContextCategories: 5,
  /** Nombre de messages d'historique conservés dans le contexte de chat. */
  historyWindow: 10,
} as const;

/** Indique si le fournisseur demandé dispose d'une clé configurée. */
export function hasProviderKey(
  provider: Exclude<AiProviderName, "mock"> = AI_CONFIG.provider,
): boolean {
  return AI_CONFIG.keys[provider].trim().length > 0;
}
