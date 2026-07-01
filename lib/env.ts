import { z } from "zod";

/**
 * Validation des variables d'environnement (Sprint 15).
 *
 * - `env` : valeurs typées, lues avec des valeurs par défaut sûres. L'import de
 *   ce module ne fait JAMAIS échouer le build.
 * - `assertServerEnv()` : contrôle STRICT des variables requises côté serveur,
 *   à appeler au démarrage (voir `instrumentation.ts`). En production, une
 *   variable requise manquante lève une erreur explicite.
 */

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_ENV: z.enum(["development", "staging", "production"]).default("development"),

  DATABASE_URL: z.string().min(1).optional(),
  BETTER_AUTH_SECRET: z.string().min(1).optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  // IA (optionnel — repli sur moteur local si absent)
  AI_PROVIDER: z.enum(["anthropic", "openai", "gemini", "mistral"]).default("anthropic"),
  AI_MODEL: z.string().default("claude-opus-4-8"),
  ANTHROPIC_API_KEY: z.string().optional(),

  // Observabilité (optionnel)
  SENTRY_DSN: z.string().optional(),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().optional(),

  // Administration (optionnel — promotion SUPER_ADMIN au seed)
  ADMIN_EMAIL: z.string().email().optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;

/** Variables typées, tolérantes (import sans effet de bord). */
export const env: ServerEnv = serverSchema.parse(process.env);

/** Variables STRICTEMENT requises pour faire tourner l'application. */
const REQUIRED: (keyof ServerEnv)[] = ["DATABASE_URL", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL"];

/**
 * Contrôle strict au démarrage. En production, échoue si une variable requise
 * manque ; en développement, se contente d'avertir.
 */
export function assertServerEnv(): void {
  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (missing.length === 0) return;

  const message = `Variables d'environnement manquantes : ${missing.join(", ")}`;
  if (env.NODE_ENV === "production") {
    throw new Error(message);
  }
  console.warn(`⚠️  ${message} (toléré en développement).`);
}
