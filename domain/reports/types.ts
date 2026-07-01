/**
 * Types partagés du moteur de rapports.
 * Structure conçue pour être facilement exploitable par une IA ultérieurement
 * (données normalisées, sérialisables, sans dépendance base).
 */

export type ReportKind =
  "SUMMARY" | "INCOME" | "EXPENSE" | "CATEGORY" | "BUDGET" | "SAVING" | "CASHFLOW";

export type ExportFormat = "CSV" | "XLSX" | "PDF";

export type TransactionScope = "all" | "income" | "expense";

/** Filtres appliqués à un rapport. */
export interface ReportFilters {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  categoryId?: string;
  transactionType?: TransactionScope;
  minAmount?: number;
  maxAmount?: number;
}

export interface ReportSummary {
  income: number;
  expense: number;
  balance: number;
  savings: number;
  /** Taux d'épargne (%) = épargne / revenus. */
  savingsRate: number;
}

export interface MonthlyComparisonLine {
  label: string;
  income: number;
  expense: number;
}

export interface CashFlowPoint {
  label: string;
  income: number;
  expense: number;
  net: number;
}

export interface CategoryLine {
  name: string;
  color: string;
  value: number;
  percent: number;
}

export interface BudgetLine {
  name: string;
  amount: number;
  spent: number;
  remaining: number;
  percent: number;
}

export interface SavingLine {
  name: string;
  target: number;
  current: number;
  percent: number;
}

export interface TransactionLine {
  date: string;
  title: string;
  type: "income" | "expense";
  category: string;
  amount: number;
}

export interface ReportMeta {
  type: ReportKind;
  title: string;
  generatedAt: string;
  periodLabel: string;
  from: string;
  to: string;
  user: { name: string; email: string };
  currency: string;
}

/** Rapport complet — toutes les sections y sont présentes (l'UI choisit lesquelles montrer). */
export interface ReportData {
  meta: ReportMeta;
  summary: ReportSummary;
  monthly: MonthlyComparisonLine[];
  cashFlow: CashFlowPoint[];
  incomeByCategory: CategoryLine[];
  expenseByCategory: CategoryLine[];
  budgets: BudgetLine[];
  savings: SavingLine[];
  transactions: TransactionLine[];
}
