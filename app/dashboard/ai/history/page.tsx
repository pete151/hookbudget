import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { requireAuth } from "@/lib/auth/server";
import { listConversations } from "@/services/ai/conversation.service";
import { AIHistory } from "@/components/ai/ai-history";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Historique IA" };

export default async function AiHistoryPage() {
  const user = await requireAuth();
  const conversations = await listConversations(user.id);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Vos conversations</CardTitle>
        <Button asChild size="sm">
          <Link href="/dashboard/ai/chat">
            <Plus className="h-4 w-4" />
            Nouvelle conversation
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <AIHistory conversations={conversations} />
      </CardContent>
    </Card>
  );
}
