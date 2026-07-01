/**
 * Métriques applicatives (Sprint 15) — format Prometheus (texte).
 *
 * Protégé par un jeton optionnel : si `METRICS_TOKEN` est défini, l'appel doit
 * porter l'en-tête `Authorization: Bearer <token>`. Sinon, endpoint ouvert (à
 * réserver à un réseau interne). Prêt pour un scraping Prometheus / OpenTelemetry.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const token = process.env.METRICS_TOKEN;
  if (token) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${token}`) {
      return new Response("Non autorisé", { status: 401 });
    }
  }

  const mem = process.memoryUsage();
  const lines = [
    "# HELP hookbudget_uptime_seconds Durée de fonctionnement du process.",
    "# TYPE hookbudget_uptime_seconds gauge",
    `hookbudget_uptime_seconds ${Math.round(process.uptime())}`,
    "# HELP hookbudget_memory_rss_bytes Mémoire résidente du process.",
    "# TYPE hookbudget_memory_rss_bytes gauge",
    `hookbudget_memory_rss_bytes ${mem.rss}`,
    "# HELP hookbudget_memory_heap_used_bytes Tas utilisé.",
    "# TYPE hookbudget_memory_heap_used_bytes gauge",
    `hookbudget_memory_heap_used_bytes ${mem.heapUsed}`,
  ];

  return new Response(lines.join("\n") + "\n", {
    status: 200,
    headers: { "Content-Type": "text/plain; version=0.0.4" },
  });
}
