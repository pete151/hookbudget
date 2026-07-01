import type { Metadata } from "next";

import { requireAuth } from "@/lib/auth/server";
import { getConversation } from "@/services/ai/conversation.service";
import { AIChat } from "@/components/ai/ai-chat";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Chat IA" };

export default async function AiChatPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const user = await requireAuth();
  const { c } = await searchParams;

  const conversation = c ? await getConversation(user.id, c) : null;
  const initialMessages =
    conversation?.messages.map((m) => ({ id: m.id, role: m.role, content: m.content })) ?? [];

  return (
    <Card>
      <CardContent className="pt-6">
        <AIChat
          initialMessages={initialMessages}
          conversationId={conversation?.id}
          // Remonte la conversation à chaque changement d'URL.
          key={conversation?.id ?? "new"}
        />
      </CardContent>
    </Card>
  );
}
