"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuth } from "@/lib/auth/server";
import {
  createConversation,
  deleteConversation,
  renameConversation,
} from "@/services/ai/conversation.service";

/**
 * Server Actions de l'assistant IA : gestion des conversations (le chat en
 * streaming passe par la route `POST /api/ai/chat`).
 */

export type ActionResult<T = undefined> =
  { success: true; data: T } | { success: false; error: string };

const renameSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1, "Le titre est requis.").max(120),
});

/** Crée une nouvelle conversation vide et renvoie son identifiant. */
export async function newConversationAction(): Promise<ActionResult<{ id: string }>> {
  const user = await requireAuth();
  const id = await createConversation(user.id);
  revalidatePath("/dashboard/ai/history");
  return { success: true, data: { id } };
}

/** Renomme une conversation. */
export async function renameConversationAction(values: unknown): Promise<ActionResult> {
  const user = await requireAuth();
  const parsed = renameSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }
  await renameConversation(user.id, parsed.data.id, parsed.data.title);
  revalidatePath("/dashboard/ai/history");
  return { success: true, data: undefined };
}

/** Supprime une conversation. */
export async function deleteConversationAction(id: string): Promise<ActionResult> {
  const user = await requireAuth();
  if (!id) return { success: false, error: "Identifiant manquant." };
  await deleteConversation(user.id, id);
  revalidatePath("/dashboard/ai/history");
  return { success: true, data: undefined };
}
