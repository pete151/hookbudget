/**
 * Instrumentation Next.js (Sprint 15).
 *
 * `register()` s'exécute UNE fois au démarrage du serveur (pas au build) : on y
 * valide les variables d'environnement et on prépare l'observabilité
 * (Sentry / OpenTelemetry sont activés dès que leurs DSN/endpoints sont fournis
 * et les paquets installés — voir docs/Deployment.md).
 */

export async function register(): Promise<void> {
  // La validation d'environnement et les API Node ne s'exécutent que sur le
  // runtime Node.js (pas sur l'Edge Runtime).
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { assertServerEnv, env } = await import("@/lib/env");
  const { logger } = await import("@/lib/logger");

  assertServerEnv();

  logger.info("server:start", {
    env: env.APP_ENV,
    sentry: Boolean(env.SENTRY_DSN),
    otel: Boolean(env.OTEL_EXPORTER_OTLP_ENDPOINT),
  });
}

/** Capture des erreurs de requête (App Router). */
export async function onRequestError(
  error: unknown,
  request: { path: string; method: string },
): Promise<void> {
  const { captureException } = await import("@/lib/observability/sentry");
  captureException(error, { path: request.path, method: request.method });
}
