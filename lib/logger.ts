/**
 * Journalisation structurée (Sprint 15).
 *
 * En production : JSON (compatible agrégateurs de logs, Sentry, OpenTelemetry).
 * En développement : sortie lisible. Point d'entrée unique pour tous les logs
 * applicatifs et de sécurité.
 */

type Level = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

const isProd = process.env.NODE_ENV === "production";
const minLevel: Level = (process.env.LOG_LEVEL as Level) || (isProd ? "info" : "debug");

function shouldLog(level: Level): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[minLevel];
}

function write(level: Level, message: string, meta?: Record<string, unknown>): void {
  if (!shouldLog(level)) return;

  const entry = {
    level,
    time: new Date().toISOString(),
    message,
    ...meta,
  };

  const line = isProd ? JSON.stringify(entry) : `[${level.toUpperCase()}] ${message}`;
  const args = isProd || !meta ? [line] : [line, meta];

  if (level === "error") console.error(...args);
  else if (level === "warn") console.warn(...args);
  else console.log(...args);
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => write("debug", message, meta),
  info: (message: string, meta?: Record<string, unknown>) => write("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => write("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => write("error", message, meta),
};
