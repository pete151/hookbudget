import "server-only";

import { AI_CONFIG } from "@/lib/ai/config";
import { getProvider } from "@/lib/ai";
import type { AIChatMessage } from "@/lib/ai/types";
import { getCachedContext } from "@/services/ai/insight.service";
import {
  addMessage,
  autoTitle,
  countUserMessagesToday,
  createConversation,
  getConversation,
} from "@/services/ai/conversation.service";

/**
 * Orchestration du chat IA : contrôle de débit, construction du contexte,
 * persistance des messages et diffusion en streaming de la réponse.
 */

interface ProfileInput {
  name: string;
  firstName?: string | null;
  currency?: string | null;
}

interface StreamInput {
  userId: string;
  profile: ProfileInput;
  conversationId?: string;
  question: string;
}

export type StreamOutcome =
  | { ok: true; conversationId: string; stream: AsyncIterable<string> }
  | { ok: false; error: string };

/**
 * Prépare et diffuse la réponse de l'assistant à une question.
 * Persiste la question puis, à la fin du flux, la réponse complète.
 */
export async function streamAssistantAnswer(input: StreamInput): Promise<StreamOutcome> {
  const question = input.question.trim();
  if (!question) return { ok: false, error: "La question est vide." };
  if (question.length > 1000)
    return { ok: false, error: "La question est trop longue (1000 caractères max)." };

  // Limite de débit par utilisateur et par jour.
  const usedToday = await countUserMessagesToday(input.userId);
  if (usedToday >= AI_CONFIG.maxMessagesPerDay) {
    return {
      ok: false,
      error: `Limite quotidienne atteinte (${AI_CONFIG.maxMessagesPerDay} questions/jour). Réessayez demain.`,
    };
  }

  // Résolution de la conversation (création si nécessaire, vérif. propriétaire).
  let conversationId = input.conversationId;
  let history: AIChatMessage[] = [];
  if (conversationId) {
    const convo = await getConversation(input.userId, conversationId);
    if (!convo) return { ok: false, error: "Conversation introuvable." };
    history = convo.messages.map((m) => ({ role: m.role, content: m.content }));
  } else {
    conversationId = await createConversation(input.userId);
  }

  // Persistance de la question + titre automatique.
  await addMessage(conversationId, "USER", question);
  await autoTitle(conversationId, question);

  const context = await getCachedContext(input.userId, input.profile);
  const provider = getProvider();
  const cid = conversationId;

  async function* run(): AsyncIterable<string> {
    let full = "";
    try {
      for await (const chunk of provider.answerQuestion(context, history, question)) {
        full += chunk;
        yield chunk;
      }
    } catch {
      const fallback =
        full.trim().length > 0
          ? ""
          : "Désolé, je n'ai pas pu générer de réponse pour le moment. Réessayez dans un instant.";
      if (fallback) {
        full += fallback;
        yield fallback;
      }
    } finally {
      if (full.trim().length > 0) {
        await addMessage(cid, "ASSISTANT", full);
      }
    }
  }

  return { ok: true, conversationId: cid, stream: run() };
}
