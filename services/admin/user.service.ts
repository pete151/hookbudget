import "server-only";

import { Prisma, type AdminRole, type UserStatus } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import type { Paginated } from "@/services/admin/audit.service";

/**
 * Gestion des utilisateurs (Back Office). Les mutations sensibles sont
 * orchestrées par les Server Actions (permission + audit) ; ce service porte
 * les opérations de lecture et les écritures unitaires.
 */

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  image: string | null;
  status: UserStatus;
  adminRole: AdminRole | null;
  plan: string;
  createdAt: Date;
  deleted: boolean;
}

export interface UserQuery {
  search?: string;
  status?: UserStatus;
  role?: AdminRole | "USER";
  page?: number;
  pageSize?: number;
  sort?: "recent" | "oldest" | "name";
}

/** Liste paginée des utilisateurs (avec recherche, filtres, tri). */
export async function listUsers(query: UserQuery = {}): Promise<Paginated<AdminUserRow>> {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20));

  const where: Prisma.UserWhereInput = { deletedAt: null };
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { email: { contains: query.search, mode: "insensitive" } },
    ];
  }
  if (query.status) where.status = query.status;
  if (query.role === "USER") where.adminRole = null;
  else if (query.role) where.adminRole = query.role;

  const orderBy: Prisma.UserOrderByWithRelationInput =
    query.sort === "oldest"
      ? { createdAt: "asc" }
      : query.sort === "name"
        ? { name: "asc" }
        : { createdAt: "desc" };

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        status: true,
        adminRole: true,
        createdAt: true,
        deletedAt: true,
        subscription: { select: { plan: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items: rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image,
      status: u.status,
      adminRole: u.adminRole,
      plan: u.subscription?.plan ?? "FREE",
      createdAt: u.createdAt,
      deleted: u.deletedAt !== null,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export interface AdminUserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  status: UserStatus;
  adminRole: AdminRole | null;
  plan: string;
  createdAt: Date;
  counts: { incomes: number; expenses: number; budgets: number; goals: number };
  history: { id: string; plan: string; event: string; note: string | null; createdAt: Date }[];
}

/** Profil détaillé d'un utilisateur (pour la page dédiée). */
export async function getUserProfile(id: string): Promise<AdminUserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      status: true,
      adminRole: true,
      createdAt: true,
      subscription: { select: { plan: true } },
      subscriptionHistory: { orderBy: { createdAt: "desc" }, take: 20 },
      _count: { select: { incomes: true, expenses: true, budgets: true, savingGoals: true } },
    },
  });
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    status: user.status,
    adminRole: user.adminRole,
    plan: user.subscription?.plan ?? "FREE",
    createdAt: user.createdAt,
    counts: {
      incomes: user._count.incomes,
      expenses: user._count.expenses,
      budgets: user._count.budgets,
      goals: user._count.savingGoals,
    },
    history: user.subscriptionHistory.map((h) => ({
      id: h.id,
      plan: h.plan,
      event: h.event,
      note: h.note,
      createdAt: h.createdAt,
    })),
  };
}

// ── Écritures unitaires (appelées par les actions après contrôle + audit) ────

export function setUserStatus(id: string, status: UserStatus) {
  return prisma.user.update({ where: { id }, data: { status } });
}

export function setUserRole(id: string, adminRole: AdminRole | null) {
  return prisma.user.update({ where: { id }, data: { adminRole } });
}

export function softDeleteUser(id: string) {
  return prisma.user.update({
    where: { id },
    data: { deletedAt: new Date(), status: "SUSPENDED" },
  });
}

/** Récupère le rôle actuel (pour valider les changements). */
export function getUserAdminRole(id: string) {
  return prisma.user.findUnique({ where: { id }, select: { adminRole: true } });
}
