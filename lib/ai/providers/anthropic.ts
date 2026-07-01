import "server-only";

import Anthropic from "@anthropic-ai/sdk";

import type { FinancialContext } from "@/domain/ai/types";
import { AI_CONFIG } from "@/lib/ai/config";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import { BaseAIProvider } from "@/lib/ai/provider";
import type { AIChatMessage } from "@/lib/ai/types";

/**
 * Fournisseur IA officiel : Anthropic Claude (SDK `@anthropic-ai/sdk`).
 *
 * Le contexte financier nettoyé est injecté dans l'invite système ; la réponse
 * est diffusée en streaming (fragments de texte) pour une UX réactive. Le
 * thinking étendu est volontairement omis afin de privilégier des réponses
 * rapides et directes pour un chat de gestion budgétaire.
 */
export class AnthropicProvider extends BaseAIProvider {
  readonly name = "anthropic";
  readonly available = true;
  private readonly client: Anthropic;

  constructor(apiKey: string) {
    super();
    this.client = new Anthropic({
      apiKey,
      timeout: AI_CONFIG.requestTimeoutMs,
      maxRetries: 1,
    });
  }

  async *answerQuestion(
    ctx: FinancialContext,
    history: AIChatMessage[],
    question: string,
  ): AsyncIterable<string> {
    const system = buildSystemPrompt(ctx);
    const messages: Anthropic.MessageParam[] = [
      ...history.slice(-AI_CONFIG.historyWindow).map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: question },
    ];

    const stream = this.client.messages.stream({
      model: AI_CONFIG.anthropicModel,
      max_tokens: AI_CONFIG.maxOutputTokens,
      system,
      messages,
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        yield event.delta.text;
      }
    }
  }
}
