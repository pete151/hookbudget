import "server-only";

import { Prisma, type NotificationType, type NotificationPriority } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { getBudgets } from "@/services/budgets/budget.service";
import { getSavingGoals } from "@/services/savings/saving.service";
import {
  budgetThresholdSpecs,
  savingReachedSpec,
  savingDeadlineSpec,
  largeExpenseSpec,
  largeIncomeSpec,
  welcomeSpec,
  type NotificationSpec,
} from "@/domain/notifications/rules";

/**
 * Couche de services des notifications : persistance, préférences et
 * générateurs (qui orchestrent les règles pures de `domain/notifications`).
 */

export interface NotificationView {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  actionUrl: string | null;
  createdAt: Date;
  readAt: Date | null;
}

export interface NotificationListResult {
  items: NotificationView[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  unreadCount: number;
}

export interface NotificationPreferenceView {
  budgetAlerts: boolean;
  savingAlerts: boolean;
  incomeAlerts: boolean;
  expenseAlerts: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklySummary: boolean;
  monthlySummary: boolean;
}

const DEFAULT_PAGE_SIZE = 20;
const LARGE_MULTIPLIER = 3;

type NotificationRow = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  actionUrl: string | null;
  createdAt: Date;
  readAt: Date | null;
};

function toView(n: NotificationRow): NotificationView {
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    priority: n.priority,
    isRead: n.isRead,
    actionUrl: n.actionUrl,
    createdAt: n.createdAt,
    readAt: n.readAt,
  };
}

// ── Lecture ────────────────────────────────────────────────────────────────

export interface NotificationListParams {
  filter?: string; // "all" | "unread" | NotificationType
  page?: number;
  pageSize?: number;
}

/** Liste paginée des notifications, filtrée par onglet. */
export async function getNotifications(
  userId: string,
  params: NotificationListParams = {},
): Promise<NotificationListResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE));

  const where: Prisma.NotificationWhereInput = { userId };
  const filter = params.filter ?? "all";
  if (filter === "unread") where.isRead = false;
  else if (filter !== "all") where.type = filter as NotificationType;

  const [items, total, unreadCount] = await prisma.$transaction([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    items: items.map(toView),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    unreadCount,
  };
}

/** Notifications non lues (les plus récentes) — pour la cloche du header. */
export async function getUnreadNotifications(
  userId: string,
  limit = 6,
): Promise<{ items: NotificationView[]; unreadCount: number }> {
  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);
  return { items: items.map(toView), unreadCount };
}

// ── Écriture ─────────────────────────────────────────────────────────────

/**
 * Crée une notification en évitant les doublons (via `metadata.dedupeKey`).
 * Retourne `true` si une notification a été créée.
 */
export async function createNotification(userId: string, spec: NotificationSpec): Promise<boolean> {
  const existing = await prisma.notification.findFirst({
    where: { userId, metadata: { path: ["dedupeKey"], equals: spec.dedupeKey } },
    select: { id: true },
  });
  if (existing) return false;

  await prisma.notification.create({
    data: {
      userId,
      title: spec.title,
      message: spec.message,
      type: spec.type,
      priority: spec.priority,
      actionUrl: spec.actionUrl ?? null,
      metadata: { ...(spec.metadata ?? {}), dedupeKey: spec.dedupeKey } as Prisma.InputJsonValue,
    },
  });
  return true;
}

/** Marque une notification comme lue. */
export async function markAsRead(userId: string, id: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { id, userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
}

/** Marque toutes les notifications comme lues. */
export async function markAllAsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
}

/** Supprime une notification. */
export async function deleteNotification(userId: string, id: string): Promise<void> {
  await prisma.notification.deleteMany({ where: { id, userId } });
}

/** Supprime toutes les notifications déjà lues. */
export async function deleteAllRead(userId: string): Promise<void> {
  await prisma.notification.deleteMany({ where: { userId, isRead: true } });
}

// ── Préférences ────────────────────────────────────────────────────────────

/** Retourne les préférences (créées avec valeurs par défaut si absentes). */
export async function getPreferences(userId: string): Promise<NotificationPreferenceView> {
  const pref =
    (await prisma.notificationPreference.findUnique({ where: { userId } })) ??
    (await prisma.notificationPreference.create({ data: { userId } }));

  return {
    budgetAlerts: pref.budgetAlerts,
    savingAlerts: pref.savingAlerts,
    incomeAlerts: pref.incomeAlerts,
    expenseAlerts: pref.expenseAlerts,
    emailNotifications: pref.emailNotifications,
    pushNotifications: pref.pushNotifications,
    weeklySummary: pref.weeklySummary,
    monthlySummary: pref.monthlySummary,
  };
}

/** Met à jour les préférences (upsert). */
export async function updatePreferences(
  userId: string,
  data: NotificationPreferenceView,
): Promise<void> {
  await prisma.notificationPreference.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}

// ── Générateurs (orchestrent les règles du domaine) ─────────────────────────

/** Génère les alertes de budgets (seuils 50/80/100). */
export async function generateBudgetAlerts(userId: string): Promise<void> {
  const pref = await getPreferences(userId);
  if (!pref.budgetAlerts) return;

  const budgets = await getBudgets(userId);
  const specs = budgets
    .filter((b) => b.isActive)
    .flatMap((b) =>
      budgetThresholdSpecs({
        id: b.id,
        name: b.name,
        percent: b.percent,
        alert50: b.alert50,
        alert80: b.alert80,
        alert100: b.alert100,
      }),
    );

  await persistSpecs(userId, specs);
}

/** Génère les alertes d'épargne (objectif atteint, échéance proche). */
export async function generateSavingAlerts(userId: string): Promise<void> {
  const pref = await getPreferences(userId);
  if (!pref.savingAlerts) return;

  const goals = await getSavingGoals(userId);
  const specs: NotificationSpec[] = [];
  for (const g of goals) {
    const input = {
      id: g.id,
      name: g.name,
      percent: g.percent,
      status: g.status,
      daysRemaining: g.daysRemaining,
      targetDate: g.targetDate,
    };
    const reached = savingReachedSpec(input);
    if (reached) specs.push(reached);
    const deadline = savingDeadlineSpec(input);
    if (deadline) specs.push(deadline);
  }

  await persistSpecs(userId, specs);
}

/** Génère une alerte si la dépense est importante (≥ 3× la moyenne). */
export async function generateExpenseAlerts(
  userId: string,
  expense: { id: string; title: string; amount: number },
): Promise<void> {
  const pref = await getPreferences(userId);
  if (!pref.expenseAlerts) return;

  const agg = await prisma.expense.aggregate({ _avg: { amount: true }, where: { userId } });
  const avg = agg._avg.amount ? agg._avg.amount.toNumber() : 0;
  const threshold = Math.max(avg * LARGE_MULTIPLIER, 1);

  const spec = largeExpenseSpec(expense, threshold);
  if (spec) await createNotification(userId, spec);
}

/** Génère une alerte si le revenu est important (≥ 3× la moyenne). */
export async function generateIncomeAlerts(
  userId: string,
  income: { id: string; title: string; amount: number },
): Promise<void> {
  const pref = await getPreferences(userId);
  if (!pref.incomeAlerts) return;

  const agg = await prisma.income.aggregate({ _avg: { amount: true }, where: { userId } });
  const avg = agg._avg.amount ? agg._avg.amount.toNumber() : 0;
  const threshold = Math.max(avg * LARGE_MULTIPLIER, 1);

  const spec = largeIncomeSpec(income, threshold);
  if (spec) await createNotification(userId, spec);
}

/** Notification de bienvenue (à la fin de l'inscription). */
export async function generateWelcome(userId: string): Promise<void> {
  await createNotification(userId, welcomeSpec());
}

/** Persiste une liste de specs en série (dédoublonnage inclus). */
async function persistSpecs(userId: string, specs: NotificationSpec[]): Promise<void> {
  for (const spec of specs) {
    await createNotification(userId, spec);
  }
}
