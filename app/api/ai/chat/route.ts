import { getCurrentUser } from "@/lib/auth/server";
import { streamAssistantAnswer } from "@/services/ai/assistant.service";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { logSecurityEvent } from "@/lib/security/events";

/**
 * Route de chat IA en STREAMING.
 *
 * POST { question: string, conversationId?: string }
 *  → corps `text/plain` diffusé au fil de l'eau ;
 *  → en-tête `X-Conversation-Id` : identifiant de la conversation (créée si besoin).
 *
 * Le contrôle de débit, la construction du contexte et la persistance sont
 * gérés par `streamAssistantAnswer`.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const user = await getCurrentUser();
  if (!user) {
    return new Response("Non autorisé", { status: 401 });
  }

  // Rate limiting par utilisateur : 20 requêtes / minute.
  const rate = checkRateLimit(`ai-chat:${user.id}`, { limit: 20, windowMs: 60_000 });
  if (!rate.allowed) {
    logSecurityEvent("ratelimit.exceeded", { route: "/api/ai/chat", userId: user.id });
    return Response.json(
      { error: "Trop de requêtes. Réessayez dans un instant." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } },
    );
  }

  let body: { question?: unknown; conversationId?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  const question = typeof body.question === "string" ? body.question : "";
  const conversationId = typeof body.conversationId === "string" ? body.conversationId : undefined;

  const outcome = await streamAssistantAnswer({
    userId: user.id,
    profile: { name: user.name, firstName: user.firstName, currency: user.currency },
    conversationId,
    question,
  });

  if (!outcome.ok) {
    const status = outcome.error.includes("Limite quotidienne") ? 429 : 400;
    return Response.json({ error: outcome.error }, { status });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of outcome.stream) {
          controller.enqueue(encoder.encode(chunk));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Conversation-Id": outcome.conversationId,
    },
  });
}
