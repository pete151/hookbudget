"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageSquare, Pencil, Trash2, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDate } from "@/lib/utils/format";
import { deleteConversationAction, renameConversationAction } from "@/actions/ai";

export interface ConversationItem {
  id: string;
  title: string;
  updatedAt: Date;
  messageCount: number;
}

/** Historique des conversations : ouvrir, renommer, supprimer. */
export function AIHistory({ conversations }: { conversations: ConversationItem[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");
  const [, startTransition] = React.useTransition();

  function startEdit(item: ConversationItem) {
    setEditingId(item.id);
    setDraft(item.title);
  }

  function saveEdit(id: string) {
    const title = draft.trim();
    if (!title) return;
    startTransition(async () => {
      const res = await renameConversationAction({ id, title });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      setEditingId(null);
      toast.success("Conversation renommée");
      router.refresh();
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const res = await deleteConversationAction(id);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Conversation supprimée");
      router.refresh();
    });
  }

  if (conversations.length === 0) {
    return (
      <p className="text-muted-foreground py-10 text-center text-sm">
        Aucune conversation pour le moment. Démarrez un échange avec l&apos;assistant.
      </p>
    );
  }

  return (
    <ul className="divide-border divide-y">
      {conversations.map((c) => (
        <li key={c.id} className="flex items-center gap-3 py-3">
          <MessageSquare className="text-muted-foreground h-4 w-4 shrink-0" />
          {editingId === c.id ? (
            <div className="flex flex-1 items-center gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="h-8"
                autoFocus
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => saveEdit(c.id)}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => setEditingId(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Link href={`/dashboard/ai/chat?c=${c.id}`} className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{c.title}</p>
                <p className="text-muted-foreground text-xs">
                  {c.messageCount} message(s) · {formatDate(c.updatedAt)}
                </p>
              </Link>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => startEdit(c)}
                aria-label="Renommer"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive h-8 w-8"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer cette conversation ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. Les messages seront définitivement supprimés.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={() => remove(c.id)}>Supprimer</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
