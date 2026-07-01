/**
 * Limitation de débit (rate limiting) en mémoire — Sprint 15.
 *
 * Fenêtre glissante simple, par clé (IP + route). Convient à un déploiement
 * mono-instance ; pour un déploiement multi-instances/serverless, brancher un
 * store partagé (Redis / Upstash) via la même interface `checkRateLimit`.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Secondes avant réinitialisation (utile pour l'en-tête `Retry-After`). */
  retryAfter: number;
}

export interface RateLimitOptions {
  /** Nombre maximum de requêtes autorisées dans la fenêtre. */
  limit: number;
  /** Durée de la fenêtre en millisecondes. */
  windowMs: number;
}

/** Vérifie et incrémente le compteur pour une clé donnée. */
export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, remaining: options.limit - 1, retryAfter: 0 };
  }

  bucket.count += 1;
  if (bucket.count > options.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  return { allowed: true, remaining: options.limit - bucket.count, retryAfter: 0 };
}

/** Nettoyage périodique des compartiments expirés (évite la fuite mémoire). */
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }, 60_000);
  // Ne pas empêcher le process de s'arrêter à cause du timer.
  timer.unref?.();
}
