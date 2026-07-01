import "server-only";

import { Prisma, TransactionType, type Currency, type Language, type Theme } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import type { ProfileValues, PreferencesValues, ImportRow } from "@/lib/validations/settings";

/**
 * Couche de services des paramètres utilisateur.
 * Le champ `user.currency` (String) reste la devise EFFECTIVE utilisée par toute
 * l'application (via la session) ; `Settings.currency` (enum) la reflète.
 */

export interface SettingsView {
  profile: {
    name: string;
    email: string;
    image: string | null;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    profession: string | null;
    company: string | null;
    bio: string | null;
    country: string | null;
    city: string | null;
  };
  preferences: {
    language: Language;
    currency: Currency;
    theme: Theme;
    firstDayOfWeek: number;
    dateFormat: string;
    numberFormat: string;
    decimalSeparator: string;
    defaultNotifications: boolean;
  };
  account: {
    email: string;
    createdAt: Date;
    plan: string;
    status: string;
  };
}

function nn(value: string | undefined): string | null {
  return value && value.trim() ? value.trim() : null;
}

/** Crée la ligne Settings par défaut si elle n'existe pas. */
async function ensureSettings(userId: string) {
  return (
    (await prisma.settings.findUnique({ where: { userId } })) ??
    (await prisma.settings.create({ data: { userId } }))
  );
}

/** Charge le profil, les préférences et l'état du compte. */
export async function getSettings(userId: string): Promise<SettingsView> {
  const [user, settings, subscription] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    ensureSettings(userId),
    prisma.subscription.findUnique({ where: { userId } }),
  ]);

  return {
    profile: {
      name: user.name,
      email: user.email,
      image: user.image,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      profession: user.profession,
      company: user.company,
      bio: user.bio,
      country: user.country,
      city: user.city,
    },
    preferences: {
      language: settings.language,
      currency: settings.currency,
      theme: settings.theme,
      firstDayOfWeek: settings.firstDayOfWeek,
      dateFormat: settings.dateFormat,
      numberFormat: settings.numberFormat,
      decimalSeparator: settings.decimalSeparator,
      defaultNotifications: settings.defaultNotifications,
    },
    account: {
      email: user.email,
      createdAt: user.createdAt,
      plan: subscription?.plan ?? "FREE",
      status: subscription?.status ?? "TRIAL",
    },
  };
}

/** Met à jour le profil. */
export async function updateProfile(userId: string, data: ProfileValues): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      firstName: nn(data.firstName),
      lastName: nn(data.lastName),
      phone: nn(data.phone),
      profession: nn(data.profession),
      company: nn(data.company),
      bio: nn(data.bio),
      country: nn(data.country),
      city: nn(data.city),
      image: nn(data.image),
    },
  });
}

/** Met à jour les préférences de format. */
export async function updatePreferences(userId: string, data: PreferencesValues): Promise<void> {
  await ensureSettings(userId);
  await prisma.settings.update({ where: { userId }, data });
}

/** Met à jour le thème (apparence). */
export async function updateAppearance(userId: string, theme: Theme): Promise<void> {
  await ensureSettings(userId);
  await prisma.settings.update({ where: { userId }, data: { theme } });
}

/** Met à jour la devise (Settings + miroir `user.currency`). */
export async function updateCurrency(userId: string, currency: Currency): Promise<void> {
  await ensureSettings(userId);
  await prisma.$transaction([
    prisma.settings.update({ where: { userId }, data: { currency } }),
    prisma.user.update({ where: { id: userId }, data: { currency } }),
  ]);
}

/** Met à jour la langue (Settings + miroir `user.locale`). */
export async function updateLanguage(userId: string, language: Language): Promise<void> {
  await ensureSettings(userId);
  await prisma.$transaction([
    prisma.settings.update({ where: { userId }, data: { language } }),
    prisma.user.update({
      where: { id: userId },
      data: { locale: language === "EN" ? "en-US" : "fr-FR" },
    }),
  ]);
}

// ── Import / Export ─────────────────────────────────────────────────────────

/** Export complet des données du compte (JSON sérialisable). */
export async function exportAccount(userId: string): Promise<Record<string, unknown>> {
  const dec = (v: Prisma.Decimal) => v.toNumber();
  const [user, categories, incomes, expenses, budgets, goals] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.category.findMany({ where: { OR: [{ userId }, { userId: null }] } }),
    prisma.income.findMany({ where: { userId } }),
    prisma.expense.findMany({ where: { userId } }),
    prisma.budget.findMany({ where: { userId } }),
    prisma.savingGoal.findMany({ where: { userId }, include: { contributions: true } }),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    profile: {
      name: user.name,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      currency: user.currency,
    },
    categories: categories.map((c) => ({ name: c.name, type: c.type, isDefault: c.isDefault })),
    incomes: incomes.map((i) => ({
      title: i.title,
      amount: dec(i.amount),
      date: i.date,
      source: i.source,
    })),
    expenses: expenses.map((e) => ({
      title: e.title,
      amount: dec(e.amount),
      date: e.date,
      paymentMethod: e.paymentMethod,
    })),
    budgets: budgets.map((b) => ({
      name: b.name,
      amount: dec(b.amount),
      spent: dec(b.spentAmount),
    })),
    savingGoals: goals.map((g) => ({
      name: g.name,
      target: dec(g.targetAmount),
      current: dec(g.currentAmount),
      contributions: g.contributions.map((c) => ({
        amount: dec(c.amount),
        date: c.contributionDate,
      })),
    })),
  };
}

export interface ImportResult {
  imported: number;
  skipped: number;
}

/** Importe des transactions (revenus/dépenses) à partir de lignes validées. */
export async function importTransactions(userId: string, rows: ImportRow[]): Promise<ImportResult> {
  // Pré-chargement des catégories (utilisateur + système) pour la correspondance par nom.
  const categories = await prisma.category.findMany({
    where: { OR: [{ userId }, { userId: null }] },
    select: { id: true, name: true, type: true },
  });
  const catKey = (name: string, type: TransactionType) => `${type}:${name.trim().toLowerCase()}`;
  const catByKey = new Map(categories.map((c) => [catKey(c.name, c.type), c.id]));

  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    const date = new Date(row.date);
    if (Number.isNaN(date.getTime()) || row.amount <= 0) {
      skipped++;
      continue;
    }

    const dbType = row.type === "income" ? TransactionType.INCOME : TransactionType.EXPENSE;
    const categoryId = row.category ? (catByKey.get(catKey(row.category, dbType)) ?? null) : null;

    try {
      await prisma.$transaction(async (tx) => {
        if (row.type === "income") {
          const created = await tx.income.create({
            data: { title: row.title, amount: row.amount, date, userId, categoryId },
          });
          await tx.transaction.create({
            data: {
              amount: row.amount,
              type: dbType,
              title: row.title,
              date,
              userId,
              incomeId: created.id,
            },
          });
        } else {
          const created = await tx.expense.create({
            data: { title: row.title, amount: row.amount, date, userId, categoryId },
          });
          await tx.transaction.create({
            data: {
              amount: row.amount,
              type: dbType,
              title: row.title,
              date,
              userId,
              expenseId: created.id,
            },
          });
        }
      });
      imported++;
    } catch {
      skipped++;
    }
  }

  return { imported, skipped };
}
