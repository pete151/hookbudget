/**
 * Types du domaine « Assistant IA » (Sprint 13).
 *
 * Le `FinancialContext` est la représentation NETTOYÉE et SÉRIALISABLE des
 * finances de l'utilisateur transmise à l'assistant. Il ne contient JAMAIS de
 * données sensibles (mot de passe, e-mail, jetons, identifiants techniques) —
 * uniquement des agrégats et libellés nécessaires au conseil.
 *
 * Toutes les analyses (insights), prévisions et résumés sont dérivés de ce
 * contexte de façon PUREMENT DÉTERMINISTE (aucune invention).
 */

/** Nature d'une carte d'insight. */
export type InsightType = "OPPORTUNITY" | "ALERT" | "ADVICE" | "PREDICTION" | "SUCCESS";

/** Niveau visuel d'un insight. */
export type InsightSeverity = "info" | "success" | "warning" | "danger";

export interface ContextSummary {
  monthIncome: number;
  monthExpense: number;
  monthBalance: number;
  totalBalance: number;
  totalSavings: number;
  /** Taux d'épargne du mois (0–100). */
  savingsRate: number;
}

export interface ContextCategory {
  name: string;
  amount: number;
  /** Part en pourcentage (0–100) du total de sa famille (revenus ou dépenses). */
  percent: number;
}

export interface ContextBudget {
  name: string;
  amount: number;
  spent: number;
  remaining: number;
  /** Consommation 0–100 (bornée). */
  percent: number;
}

export interface ContextGoal {
  name: string;
  target: number;
  current: number;
  percent: number;
  /** Mois restants avant l'échéance (null si aucune échéance). */
  monthsLeft: number | null;
}

export interface ContextMonthly {
  label: string;
  income: number;
  expense: number;
  net: number;
}

export interface ContextTransaction {
  date: string;
  title: string;
  type: "income" | "expense";
  category: string;
  amount: number;
}

/** Contexte financier complet, nettoyé, transmis à l'IA. */
export interface FinancialContext {
  displayName: string;
  currency: string;
  generatedAt: string;
  summary: ContextSummary;
  topExpenseCategories: ContextCategory[];
  topIncomeCategories: ContextCategory[];
  budgets: ContextBudget[];
  goals: ContextGoal[];
  monthly: ContextMonthly[];
  recentTransactions: ContextTransaction[];
  importantNotifications: string[];
}

/** Carte d'insight (analyse automatique). */
export interface InsightCard {
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
}

/** Nature d'une prévision. */
export type PredictionKind = "balance" | "expense" | "income" | "savings";

/** Prévision (déterministe) sur le mois à venir. */
export interface Prediction {
  kind: PredictionKind;
  label: string;
  currentValue: number;
  predictedValue: number;
  delta: number;
  /** Variation en pourcentage (peut être négative). */
  deltaPercent: number;
  confidence: "low" | "medium" | "high";
  note: string;
}

/** Résumé périodique. */
export interface SummaryData {
  period: "weekly" | "monthly" | "annual";
  title: string;
  income: number;
  expense: number;
  balance: number;
  highlights: string[];
}
