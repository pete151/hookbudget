<div align="center">

# 💸 HookBudget

**Plateforme SaaS moderne de gestion de budget personnel**, avec assistant
financier IA et back‑office d'administration.

[![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)](.github/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?logo=postgresql&logoColor=white)

</div>

---

## ✨ Présentation

HookBudget permet de **suivre ses revenus et ses dépenses**, de créer des
**budgets**, de définir des **objectifs d'épargne**, de **visualiser ses
statistiques** et d'obtenir des **conseils personnalisés** via un assistant IA —
le tout dans une interface moderne, responsive et en français.

### Fonctionnalités

- 🔐 **Authentification** (Better Auth : e-mail/mot de passe, sessions, reset)
- 📊 **Dashboard** temps réel (graphiques, dark mode)
- 💰 **Revenus** & 🧾 **Dépenses** (CRUD complet, filtres, stats)
- 🐷 **Budgets** (recalcul automatique de la consommation)
- 🎯 **Objectifs d'épargne** (contributions, progression)
- 🔔 **Notifications** & automatisations
- 📈 **Rapports** & exports (CSV / XLSX / PDF)
- ⚙️ **Paramètres** (profil, sécurité, devise, langue, import/export)
- 🤖 **Assistant IA** (chat en streaming, insights, prévisions, résumés)
- 🛡️ **Back Office** (RBAC, utilisateurs, plans, audit, feature flags)

> Aucun paiement réel : les plans/MRR sont des placeholders (préparation future).

## 🏗️ Architecture

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · shadcn/ui ·
Prisma 7 + PostgreSQL · Better Auth · Zod · Recharts · assistant IA (Anthropic
Claude, avec repli local déterministe).

Séparation nette : `domain/` (logique pure, testée) → `services/` (accès
données) → `actions/` (mutations Zod) → `components/` (UI). Détails :
[docs/Architecture.md](docs/Architecture.md).

## 🚀 Installation

```bash
# 1. Dépendances
npm install

# 2. Environnement
cp .env.example .env        # compléter DATABASE_URL, BETTER_AUTH_SECRET, ...

# 3. Base PostgreSQL (Docker) + migrations + seed
docker compose up -d
npm run db:migrate
npm run db:seed             # catégories système
npm run db:seed:admin       # RBAC + plans + feature flags + paramètres

# 4. Démarrer
npm run dev                 # http://localhost:3000
```

Pour ouvrir le Back Office, promouvoir un compte :
`ADMIN_EMAIL="vous@ex.com" npm run db:seed:admin`, puis se connecter et aller
sur `/admin`.

## 📦 Scripts

| Script                  | Description                            |
| ----------------------- | -------------------------------------- |
| `npm run dev`           | Serveur de développement               |
| `npm run build`         | Build de production (standalone)       |
| `npm run start`         | Serveur de production                  |
| `npm run lint`          | ESLint                                 |
| `npm run typecheck`     | Vérification TypeScript                |
| `npm run test`          | Tests unitaires (Vitest)               |
| `npm run test:e2e`      | Tests End-to-End (Playwright)          |
| `npm run format`        | Prettier                               |
| `npm run db:migrate`    | Migrations Prisma                      |
| `npm run db:seed`       | Seed des catégories système            |
| `npm run db:seed:admin` | Seed RBAC / plans / flags / paramètres |

## 🔑 Variables d'environnement

Voir [`.env.example`](.env.example). Essentielles : `DATABASE_URL`,
`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`. Optionnelles :
`AI_PROVIDER` / `ANTHROPIC_API_KEY` (IA), `SENTRY_DSN`,
`OTEL_EXPORTER_OTLP_ENDPOINT`, `METRICS_TOKEN`, `ADMIN_EMAIL`. Les variables sont
validées au démarrage (`lib/env.ts`).

## 🧪 Tests & qualité

- **Vitest** — tests unitaires de la logique pure (`tests/unit`).
- **Playwright** — tests End-to-End (`e2e`).
- **ESLint + Prettier** — style et qualité, avec **Husky** + **lint-staged**
  (pré-commit) et **commitlint** (Conventional Commits).
- **CI GitHub Actions** — install → lint → typecheck → tests → build.

## 🛡️ Sécurité

En-têtes HTTP + CSP, rate limiting, validation Zod, RBAC + journal d'audit,
journalisation des événements de sécurité. Détails :
[docs/Security.md](docs/Security.md).

## 🚢 Déploiement

Prêt pour **Vercel**, **Railway** et **Neon PostgreSQL**, ou via **Docker**
(`Dockerfile`, `docker-compose.prod.yml`). Health check : `GET /api/health`.
Guide complet : [docs/Deployment.md](docs/Deployment.md).

## 📚 Documentation

- [Architecture](docs/Architecture.md)
- [Déploiement](docs/Deployment.md)
- [API](docs/API.md)
- [Sécurité](docs/Security.md)
- [Contribuer](docs/Contributing.md)
- [Journal des versions](docs/CHANGELOG.md)

## 🤝 Contribuer

Voir [docs/Contributing.md](docs/Contributing.md). Commits conventionnels, PR
depuis `main`, CI verte requise.

## 📄 Licence

Projet privé — tous droits réservés. © HookBudget.
