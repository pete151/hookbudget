import "server-only";

import { AI_CONFIG, hasProviderKey } from "@/lib/ai/config";
import { AnthropicProvider } from "@/lib/ai/providers/anthropic";
import { MockProvider } from "@/lib/ai/providers/mock";
import { GeminiProvider, MistralProvider, OpenAiProvider } from "@/lib/ai/providers/stubs";
import type { AIProvider } from "@/lib/ai/types";

/**
 * Sélecteur de fournisseur IA.
 *
 * Choisit le fournisseur d'après `AI_CONFIG.provider` (variable d'environnement
 * `AI_PROVIDER`) et la présence d'une clé. En cas d'absence de clé ou de
 * fournisseur non encore implémenté, bascule sur le fournisseur local
 * déterministe (« mock ») afin que l'assistant reste fonctionnel.
 */
function instantiateProvider(): AIProvider {
  const provider = AI_CONFIG.provider;

  if (!hasProviderKey(provider)) {
    return new MockProvider();
  }

  switch (provider) {
    case "anthropic":
      return new AnthropicProvider(AI_CONFIG.keys.anthropic);
    case "openai":
      return new OpenAiProvider();
    case "gemini":
      return new GeminiProvider();
    case "mistral":
      return new MistralProvider();
    default:
      return new MockProvider();
  }
}

/** Retourne le fournisseur IA actif (jamais d'exception : repli sur mock). */
export function getProvider(): AIProvider {
  try {
    return instantiateProvider();
  } catch {
    return new MockProvider();
  }
}

export type { AIProvider, AIChatMessage } from "@/lib/ai/types";
