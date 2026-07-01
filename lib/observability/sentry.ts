import { logger } from "@/lib/logger";

/**
 * Point d'intégration Sentry (Sprint 15) — STUB.
 *
 * L'architecture est prête : remplacez l'implémentation ci-dessous par
 * `@sentry/nextjs` (`Sentry.captureException`) une fois le paquet installé et
 * `SENTRY_DSN` renseigné. En attendant, les exceptions sont journalisées
 * localement pour ne perdre aucune information.
 */

export const isSentryEnabled = Boolean(process.env.SENTRY_DSN);

/** Capture une exception (redirigée vers Sentry si configuré). */
export function captureException(error: unknown, context?: Record<string, unknown>): void {
  // TODO(sprint 15+) : brancher Sentry.captureException(error, { extra: context }).
  logger.error("exception", { error: String(error), ...context });
}
