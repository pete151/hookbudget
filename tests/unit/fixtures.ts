import type { FinancialContext } from "@/domain/ai/types";

/** Contexte financier de test, conçu pour déclencher plusieurs analyses. */
export function makeContext(overrides: Partial<FinancialContext> = {}): FinancialContext {
  return {
    displayName: "Test",
    currency: "XOF",
    generatedAt: "2026-07-01",
    summary: {
      monthIncome: 200000,
      monthExpense: 150000,
      monthBalance: 50000,
      totalBalance: 300000,
      totalSavings: 80000,
      savingsRate: 5, // faible → opportunité d'épargne
    },
    topExpenseCategories: [
      { name: "Loyer", amount: 90000, percent: 60 }, // > 35 % → catégorie coûteuse
      { name: "Nourriture", amount: 40000, percent: 27 },
    ],
    topIncomeCategories: [{ name: "Salaire", amount: 200000, percent: 100 }],
    budgets: [
      { name: "Courses", amount: 50000, spent: 45000, remaining: 5000, percent: 90 }, // à risque
      { name: "Sorties", amount: 20000, spent: 24000, remaining: -4000, percent: 120 }, // dépassé
    ],
    goals: [
      { name: "Voiture", target: 1000000, current: 100000, percent: 10, monthsLeft: 3 }, // serré
    ],
    monthly: [
      { label: "avr.", income: 200000, expense: 100000, net: 100000 },
      { label: "mai", income: 200000, expense: 110000, net: 90000 },
      { label: "juin", income: 200000, expense: 100000, net: 100000 },
      { label: "juil.", income: 200000, expense: 150000, net: 50000 }, // hausse dépenses
    ],
    recentTransactions: [],
    importantNotifications: [],
    ...overrides,
  };
}
