"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/server";
import { reportConfigSchema, saveReportSchema } from "@/lib/validations/report";
import {
  generateReport,
  saveReportToHistory,
  deleteReportFromHistory,
} from "@/services/reports/report.service";
import type { ReportData, ReportFilters, ReportKind } from "@/domain/reports/types";

export type ActionResult<T = undefined> =
  { success: true; data: T } | { success: false; error: string };

/** Génère un rapport (données) pour l'aperçu et l'export côté client. */
export async function generateReportAction(values: unknown): Promise<ActionResult<ReportData>> {
  const user = await requireAuth();

  const parsed = reportConfigSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const data = await generateReport(user.id, {
    type: parsed.data.type as ReportKind,
    filters: parsed.data.filters as ReportFilters,
    user: { name: user.name, email: user.email },
    currency: user.currency ?? "XOF",
  });

  return { success: true, data };
}

/** Enregistre un rapport exporté dans l'historique. */
export async function saveReportAction(values: unknown): Promise<ActionResult> {
  const user = await requireAuth();

  const parsed = saveReportSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const titles: Record<string, string> = {
    SUMMARY: "Résumé financier",
    INCOME: "Rapport des revenus",
    EXPENSE: "Rapport des dépenses",
    CATEGORY: "Rapport par catégorie",
    BUDGET: "Rapport des budgets",
    SAVING: "Rapport des objectifs d'épargne",
    CASHFLOW: "Flux de trésorerie",
  };

  await saveReportToHistory(user.id, {
    title: titles[parsed.data.type],
    type: parsed.data.type,
    format: parsed.data.format,
    filters: parsed.data.filters as ReportFilters,
  });
  revalidatePath("/dashboard/reports/history");
  return { success: true, data: undefined };
}

/** Supprime une entrée d'historique. */
export async function deleteReportAction(id: string): Promise<ActionResult> {
  const user = await requireAuth();
  await deleteReportFromHistory(user.id, id);
  revalidatePath("/dashboard/reports/history");
  return { success: true, data: undefined };
}
