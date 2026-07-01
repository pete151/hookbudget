import "server-only";

import { Prisma } from "@prisma/client";

import type {
  ContextCategory,
  ContextGoal,
  ContextTransaction,
  FinancialContext,
} from "@/domain/ai/types";
import { prisma } from "@/lib/db/prisma";
import { AI_CONFIG } from "@/lib/ai/config";
import {
  getBudgets,
  getDashboardSummary,
  getExpensesByCategory,
  getMonthlyBalance,
  getRecentTransactions,
  getSavingGoals,
} from "@/services/dashboard/dashboard.service";

/**
 * Construction du CONTEXTE FINANCIER transmis à l'assistant IA.
 *
 * Le contexte est nettoyé (aucune donnée sensible : ni e-mail, ni mot de passe,
 * ni jeton, ni identifiant technique) et borné (limites de tokens) avant tout
 * appel IA. Toutes les requêtes filtrent sur `userId`.
 */

function toNumber(value: Prisma.Decimal | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : value.toNumber();
}

/** Convertit des tranches (name/value) en catégories avec pourcentage, bornées. */
function toCategories(slices: { name: string; value: number }[]): ContextCategory[] {
  const total = slices.reduce((s, x) => s + x.value, 0);
  return slices.slice(0, AI_CONFIG.maxContextCategories).map((x) => ({
    name: x.name,
    amount: x.value,
    percent: total > 0 ? Math.round((x.value / total) * 100) : 0,
  }));
}

/** Revenus groupés par catégorie (le dashboard ne fournit que les dépenses). */
async function incomeByCategory(userId: string): Promise<{ name: string; value: number }[]> {
  const grouped = await prisma.income.groupBy({
    by: ["categoryId"],
    _sum: { amount: true },
    where: { userId },
  });
  if (grouped.length === 0) return [];

  const ids = grouped.map((g) => g.categoryId).filter((id): id is string => id !== null);
  const categories = await prisma.category.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true },
  });
  const byId = new Map(categories.map((c) => [c.id, c.name]));

  return grouped
    .map((g) => ({
      name: (g.categoryId && byId.get(g.categoryId)) || "Autre",
      value: toNumber(g._sum.amount),
    }))
    .filter((x) => x.value > 0)
    .sort((a, b) => b.value - a.value);
}

/** Mois restants (arrondi au supérieur) avant une échéance, ou null. */
function monthsUntil(deadline: Date | null): number | null {
  if (!deadline) return null;
  const now = new Date();
  const months =
    (deadline.getFullYear() - now.getFullYear()) * 12 + (deadline.getMonth() - now.getMonth());
  return months > 0 ? months : 0;
}

/** Notifications importantes récentes (titres), pour éclairer les conseils. */
async function importantNotifications(userId: string): Promise<string[]> {
  const rows = await prisma.notification.findMany({
    where: { userId, priority: { in: ["HIGH", "CRITICAL"] } },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { title: true, message: true },
  });
  return rows.map((n) => `${n.title} — ${n.message}`);
}

/** Construit le contexte financier complet et nettoyé pour un utilisateur. */
export async function buildFinancialContext(
  userId: string,
  profile: { name: string; firstName?: string | null; currency?: string | null },
): Promise<FinancialContext> {
  const [summary, expenseSlices, incomeSlices, budgets, goals, monthly, recent, notifs] =
    await Promise.all([
      getDashboardSummary(userId),
      getExpensesByCategory(userId),
      incomeByCategory(userId),
      getBudgets(userId),
      getSavingGoals(userId),
      getMonthlyBalance(userId),
      getRecentTransactions(userId),
      importantNotifications(userId),
    ]);

  const monthBalance = summary.monthIncome - summary.monthExpense;
  const savingsRate =
    summary.monthIncome > 0
      ? Math.round((Math.max(0, monthBalance) / summary.monthIncome) * 100)
      : 0;

  const contextGoals: ContextGoal[] = goals.map((g) => ({
    name: g.name,
    target: g.targetAmount,
    current: g.currentAmount,
    percent: g.percent,
    monthsLeft: monthsUntil(g.deadline),
  }));

  const contextTransactions: ContextTransaction[] = recent
    .slice(0, AI_CONFIG.maxContextTransactions)
    .map((t) => ({
      date: t.date.toISOString().slice(0, 10),
      title: t.title,
      type: t.type === "INCOME" ? "income" : "expense",
      category: t.categoryName ?? "—",
      amount: t.amount,
    }));

  return {
    displayName: profile.firstName?.trim() || profile.name,
    currency: profile.currency ?? "XOF",
    generatedAt: new Date().toISOString().slice(0, 10),
    summary: {
      monthIncome: summary.monthIncome,
      monthExpense: summary.monthExpense,
      monthBalance,
      totalBalance: summary.balance,
      totalSavings: summary.totalSavings,
      savingsRate,
    },
    topExpenseCategories: toCategories(expenseSlices),
    topIncomeCategories: toCategories(incomeSlices),
    budgets: budgets.map((b) => ({
      name: b.name,
      amount: b.amount,
      spent: b.spent,
      remaining: b.remaining,
      percent: b.percent,
    })),
    goals: contextGoals,
    monthly: monthly.map((m) => ({
      label: m.label,
      income: m.income,
      expense: m.expense,
      net: m.income - m.expense,
    })),
    recentTransactions: contextTransactions,
    importantNotifications: notifs,
  };
}
