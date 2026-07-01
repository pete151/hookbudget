import "server-only";

import type { AiRole } from "@prisma/client";

import type { AIChatMessage } from "@/lib/ai/types";
import { prisma } from "@/lib/db/prisma";

/**
 * Gestion des conversations et messages de l'assistant IA.
 * Toutes les opérations vérifient l'appartenance (`userId`).
 */

export interface ConversationSummary {
  id: string;
  title: string;
  updatedAt: Date;
  messageCount: number;
}

export interface ConversationDetail {
  id: string;
  title: string;
  messages: (AIChatMessage & { id: string; createdAt: Date })[];
}

/** Liste des conversations d'un utilisateur (plus récentes d'abord). */
export async function listConversations(userId: string): Promise<ConversationSummary[]> {
  const rows = await prisma.aiConversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { messages: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    updatedAt: r.updatedAt,
    messageCount: r._count.messages,
  }));
}

/** Détail d'une conversation (messages ordonnés) ou `null` si absente. */
export async function getConversation(
  userId: string,
  id: string,
): Promise<ConversationDetail | null> {
  const convo = await prisma.aiConversation.findFirst({
    where: { id, userId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!convo) return null;
  return {
    id: convo.id,
    title: convo.title,
    messages: convo.messages.map((m) => ({
      id: m.id,
      role: m.role === "USER" ? "user" : "assistant",
      content: m.content,
      createdAt: m.createdAt,
    })),
  };
}

/** Crée une conversation vide. */
export async function createConversation(userId: string, title?: string): Promise<string> {
  const convo = await prisma.aiConversation.create({
    data: { userId, title: title?.trim() || "Nouvelle conversation" },
  });
  return convo.id;
}

/** Renomme une conversation. */
export async function renameConversation(userId: string, id: string, title: string): Promise<void> {
  await prisma.aiConversation.updateMany({
    where: { id, userId },
    data: { title: title.trim().slice(0, 120) || "Sans titre" },
  });
}

/** Supprime une conversation (et ses messages en cascade). */
export async function deleteConversation(userId: string, id: string): Promise<void> {
  await prisma.aiConversation.deleteMany({ where: { id, userId } });
}

/** Ajoute un message à une conversation et met à jour son horodatage. */
export async function addMessage(
  conversationId: string,
  role: AiRole,
  content: string,
): Promise<void> {
  await prisma.$transaction([
    prisma.aiMessage.create({ data: { conversationId, role, content } }),
    prisma.aiConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);
}

/** Nombre de questions posées aujourd'hui (pour la limite de débit). */
export async function countUserMessagesToday(userId: string): Promise<number> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return prisma.aiMessage.count({
    where: {
      role: "USER",
      createdAt: { gte: start },
      conversation: { userId },
    },
  });
}

/**
 * Renomme automatiquement une conversation à partir de la première question
 * (si elle porte encore le titre par défaut).
 */
export async function autoTitle(conversationId: string, question: string): Promise<void> {
  const convo = await prisma.aiConversation.findUnique({
    where: { id: conversationId },
    select: { title: true },
  });
  if (convo && convo.title === "Nouvelle conversation") {
    await prisma.aiConversation.update({
      where: { id: conversationId },
      data: { title: question.trim().slice(0, 60) },
    });
  }
}
