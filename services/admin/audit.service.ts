import "server-only";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

/**
 * Journal d'audit : enregistrement et consultation des actions sensibles.
 */

export interface RecordAuditInput {
  actorId: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}

/** Enregistre une entrée d'audit (best effort : n'interrompt jamais l'action). */
export async function recordAudit(input: RecordAuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        targetType: input.targetType ?? null,
        targetId: input.targetId ?? null,
        metadata: (input.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        ipAddress: input.ipAddress ?? null,
      },
    });
  } catch (error) {
    console.error("[audit] échec d'enregistrement:", error);
  }
}

export interface AuditLogView {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: unknown;
  createdAt: Date;
  actor: { id: string; name: string; email: string } | null;
}

export interface AuditQuery {
  action?: string;
  actorId?: string;
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Liste paginée du journal d'audit (plus récent d'abord). */
export async function getAuditLogs(query: AuditQuery = {}): Promise<Paginated<AuditLogView>> {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 25));

  const where: Prisma.AuditLogWhereInput = {};
  if (query.action) where.action = { contains: query.action, mode: "insensitive" };
  if (query.actorId) where.actorId = query.actorId;

  const [rows, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { actor: { select: { id: true, name: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    items: rows.map((r) => ({
      id: r.id,
      action: r.action,
      targetType: r.targetType,
      targetId: r.targetId,
      metadata: r.metadata,
      createdAt: r.createdAt,
      actor: r.actor,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Dernières entrées d'audit (pour le tableau de bord admin). */
export async function getRecentAudit(limit = 8): Promise<AuditLogView[]> {
  const rows = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { actor: { select: { id: true, name: true, email: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    action: r.action,
    targetType: r.targetType,
    targetId: r.targetId,
    metadata: r.metadata,
    createdAt: r.createdAt,
    actor: r.actor,
  }));
}
