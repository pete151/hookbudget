import { logger } from "@/lib/logger";

/**
 * Journalisation des événements de sécurité (Sprint 15).
 * Centralise la trace des faits notables (auth, rate limit, accès admin…) —
 * point d'accroche naturel pour un futur SIEM ou Sentry.
 */

export type SecurityEventType =
  | "auth.login"
  | "auth.failure"
  | "auth.logout"
  | "ratelimit.exceeded"
  | "admin.access"
  | "admin.forbidden"
  | "validation.rejected";

/** Enregistre un événement de sécurité (niveau warn par défaut). */
export function logSecurityEvent(
  type: SecurityEventType,
  meta: Record<string, unknown> = {},
): void {
  logger.warn(`security:${type}`, { event: type, ...meta });
}
