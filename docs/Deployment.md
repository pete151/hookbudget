# Déploiement — HookBudget

## Prérequis

- Node.js 22+, une base **PostgreSQL** accessible.
- Variables d'environnement renseignées (voir [`.env.example`](../.env.example)).

## Variables requises

| Variable                            | Rôle                                                    |
| ----------------------------------- | ------------------------------------------------------- |
| `DATABASE_URL`                      | Connexion PostgreSQL                                    |
| `BETTER_AUTH_SECRET`                | Secret de session (générer : `openssl rand -base64 32`) |
| `BETTER_AUTH_URL`                   | URL publique de l'app                                   |
| `NEXT_PUBLIC_APP_URL`               | URL publique (client, SEO, PWA)                         |
| `AI_PROVIDER` / `ANTHROPIC_API_KEY` | Assistant IA (optionnel, repli local)                   |

## Migrations

Appliquer les migrations **avant** de démarrer une nouvelle version :

```bash
npx prisma migrate deploy
npm run db:seed          # catégories système (idempotent)
npm run db:seed:admin    # RBAC + plans + flags + paramètres (idempotent)
ADMIN_EMAIL="vous@ex.com" npm run db:seed:admin   # promouvoir un SUPER_ADMIN
```

## Vercel

1. Importer le dépôt, framework **Next.js** (détecté).
2. Définir les variables d'environnement du projet.
3. Base : **Neon PostgreSQL** (serverless) recommandé. Utiliser l'URL _pooled_
   pour `DATABASE_URL`. Lancer `prisma migrate deploy` via un script de build ou
   une action séparée.

## Railway

1. Nouveau projet → service PostgreSQL + service web (ce dépôt).
2. Variables d'environnement (dont `DATABASE_URL` fourni par le plugin Postgres).
3. Build : `npm run build` · Start : `npm run start`.
4. Health check : `GET /api/health`.

## Neon PostgreSQL

- Créer une base, récupérer la chaîne _pooled_ et _direct_.
- `DATABASE_URL` = chaîne _pooled_ (runtime). Les migrations peuvent utiliser la
  chaîne _direct_.

## Docker

```bash
# Développement : base seule
docker compose up -d

# Production : app + base
cp .env.example .env.production   # puis compléter
docker compose -f docker-compose.prod.yml up -d --build
```

L'image (`Dockerfile`) produit une sortie **standalone** minimale et expose un
`HEALTHCHECK` sur `/api/health`.

## Observabilité

- Health : `GET /api/health` (200/503).
- Métriques : `GET /api/metrics` (format Prometheus ; protéger avec `METRICS_TOKEN`).
- Logs structurés (JSON en production). Sentry/OpenTelemetry : renseigner
  `SENTRY_DSN` / `OTEL_EXPORTER_OTLP_ENDPOINT` puis installer le paquet
  correspondant (points d'accroche dans `lib/observability/` et `instrumentation.ts`).

## Sauvegardes

```bash
DATABASE_URL="postgresql://..." ./scripts/backup.sh ./backups
DATABASE_URL="postgresql://..." ./scripts/restore.sh ./backups/hookbudget_XXXX.dump
```
