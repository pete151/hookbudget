import type { ReportKind, ReportFilters } from "@/domain/reports/types";

/**
 * Infrastructure de PLANIFICATION des rapports (préparée, non branchée).
 *
 * ⚠️ Sprint 11 : aucune exécution automatique ni envoi. Ce module définit
 * uniquement les types et helpers qui permettront, plus tard, de brancher un
 * planificateur (cron / job queue) sur des rapports hebdomadaires et mensuels.
 */

export type ScheduleFrequency = "WEEKLY" | "MONTHLY";

export interface ReportSchedule {
  frequency: ScheduleFrequency;
  type: ReportKind;
  /** Filtres de base ; les dates sont recalculées à chaque exécution. */
  baseFilters: Omit<ReportFilters, "from" | "to">;
}

/** Calcule la fenêtre de dates d'un rapport planifié à une date donnée. */
export function scheduledPeriod(
  frequency: ScheduleFrequency,
  reference = new Date(),
): { from: string; to: string } {
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  if (frequency === "WEEKLY") {
    const to = new Date(reference);
    const from = new Date(reference);
    from.setDate(from.getDate() - 7);
    return { from: iso(from), to: iso(to) };
  }

  // MONTHLY : mois précédent complet.
  const from = new Date(reference.getFullYear(), reference.getMonth() - 1, 1);
  const to = new Date(reference.getFullYear(), reference.getMonth(), 0);
  return { from: iso(from), to: iso(to) };
}
