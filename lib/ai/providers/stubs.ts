import "server-only";

import { BaseAIProvider } from "@/lib/ai/provider";

/**
 * Points d'extension pour d'autres fournisseurs IA.
 *
 * L'architecture (interface `AIProvider` + `BaseAIProvider`) est prête à
 * accueillir OpenAI, Google Gemini et Mistral : il suffit d'implémenter la
 * méthode `answerQuestion` (appel streaming du modèle) dans la classe
 * correspondante. En attendant, ces classes signalent explicitement qu'elles
 * ne sont pas encore branchées — le sélecteur de fournisseur bascule alors
 * automatiquement sur le fournisseur local déterministe.
 */

class UnimplementedProvider extends BaseAIProvider {
  readonly available = false;
  constructor(readonly name: string) {
    super();
    throw new Error(`Fournisseur IA « ${name} » : architecture prête, implémentation à venir.`);
  }
  async *answerQuestion(): AsyncIterable<string> {
    throw new Error(`Fournisseur « ${this.name} » non implémenté.`);
  }
}

/** OpenAI (prévu). */
export class OpenAiProvider extends UnimplementedProvider {
  constructor() {
    super("openai");
  }
}

/** Google Gemini (prévu). */
export class GeminiProvider extends UnimplementedProvider {
  constructor() {
    super("gemini");
  }
}

/** Mistral (prévu). */
export class MistralProvider extends UnimplementedProvider {
  constructor() {
    super("mistral");
  }
}
