import { z } from "zod";

/** Filtres d'un rapport. */
export const reportFiltersSchema = z.object({
  from: z.string().min(1, { message: "Date de début requise." }),
  to: z.string().min(1, { message: "Date de fin requise." }),
  categoryId: z.string().optional(),
  transactionType: z.enum(["all", "income", "expense"]).optional(),
  minAmount: z.number().nonnegative().optional(),
  maxAmount: z.number().nonnegative().optional(),
});

export const reportConfigSchema = z.object({
  type: z.enum(["SUMMARY", "INCOME", "EXPENSE", "CATEGORY", "BUDGET", "SAVING", "CASHFLOW"]),
  filters: reportFiltersSchema,
});

export const saveReportSchema = reportConfigSchema.extend({
  format: z.enum(["CSV", "XLSX", "PDF"]),
});

export type ReportConfigValues = z.infer<typeof reportConfigSchema>;
export type SaveReportValues = z.infer<typeof saveReportSchema>;
