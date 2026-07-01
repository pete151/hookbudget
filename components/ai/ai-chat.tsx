"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AIMessage } from "@/components/ai/ai-message";
import { AIInput } from "@/components/ai/ai-input";
import { SUGGESTED_QUESTIONS } from "@/lib/ai/prompts";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

/**
 * Chat IA complet : saisie, streaming des réponses (`/api/ai/chat`), état « en
 * cours d'analyse », suggestions et gestion d'erreurs. La conversation est
 * persistée côté serveur ; `conversationId` est retourné via un en-tête.
 */
export function AIChat({
  initialMessages = [],
  conversationId: initialConversationId,
}: {
  initialMessages?: ChatMessage[];
  conversationId?: string;
}) {
  const router = useRouter();
  const [messages, setMessages] = React.useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const conversationId = React.useRef<string | undefined>(initialConversationId);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(question: string) {
    const q = question.trim();
    if (!q || busy) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: q };
    const assistantId = crypto.randomUUID();
    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, conversationId: conversationId.current }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({ error: "Une erreur est survenue." }));
        toast.error(data.error ?? "Une erreur est survenue.");
        // Retire la bulle assistant vide.
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
        return;
      }

      const newId = res.headers.get("X-Conversation-Id");
      const isFirst = !conversationId.current;
      if (newId) conversationId.current = newId;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const chunk = await reader.read();
        done = chunk.done;
        if (chunk.value) {
          const text = decoder.decode(chunk.value, { stream: true });
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + text } : m)),
          );
        }
      }

      // Rafraîchit la liste d'historique quand une conversation vient d'être créée.
      if (isFirst) router.refresh();
    } catch {
      toast.error("Impossible de contacter l'assistant.");
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setBusy(false);
    }
  }

  const empty = messages.length === 0;

  return (
    <div className="flex h-[calc(100vh-13rem)] flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {empty ? (
          <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm font-medium">Posez une question sur vos finances</p>
            <p className="text-xs">
              L&apos;assistant analyse uniquement vos données réelles. Il n&apos;invente rien.
            </p>
          </div>
        ) : (
          messages.map((m, i) => (
            <AIMessage
              key={m.id}
              role={m.role}
              content={m.content}
              streaming={busy && i === messages.length - 1 && m.role === "assistant"}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-border mt-3 border-t pt-3">
        <AIInput
          value={input}
          onChange={setInput}
          onSubmit={() => send(input)}
          disabled={busy}
          suggestions={empty ? SUGGESTED_QUESTIONS : []}
          onPickSuggestion={(q) => send(q)}
        />
      </div>
    </div>
  );
}
