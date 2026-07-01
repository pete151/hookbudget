# API — HookBudget

La majorité des interactions passent par des **Server Actions** (mutations
typées, validées par Zod) et des **Server Components** (lecture). Les quelques
**Route Handlers** HTTP exposés sont décrits ci-dessous.

## Route Handlers

### `POST /api/ai/chat`

Chat de l'assistant IA en **streaming**.

- **Auth** : session requise (401 sinon).
- **Rate limit** : 20 requêtes / minute / utilisateur (429 + `Retry-After`).
- **Corps** : `{ "question": string, "conversationId"?: string }`
- **Réponse** : corps `text/plain` diffusé au fil de l'eau ; en-tête
  `X-Conversation-Id` (conversation créée si absente).

### `GET /api/health`

Sonde de disponibilité (vérifie la base).

- `200` → `{ status: "ok", checks: { database: true }, uptime, latencyMs }`
- `503` → `{ status: "degraded", ... }`

### `GET /api/metrics`

Métriques au format Prometheus (`text/plain`).

- Si `METRICS_TOKEN` est défini : en-tête `Authorization: Bearer <token>` requis.

### `GET /api/auth/*`

Endpoints gérés par **Better Auth** (connexion, inscription, session, callbacks
OAuth). Ne pas appeler directement — utiliser `authClient` / `authServer()`.

## Server Actions (aperçu)

| Domaine     | Emplacement        | Exemples                                  |
| ----------- | ------------------ | ----------------------------------------- |
| Revenus     | `actions/income`   | créer / modifier / supprimer              |
| Dépenses    | `actions/expenses` | créer / modifier / supprimer              |
| Budgets     | `actions/budgets`  | créer / recalculer                        |
| Objectifs   | `actions/savings`  | créer / contribuer                        |
| Rapports    | `actions/reports`  | générer / exporter / historique           |
| Paramètres  | `actions/settings` | profil / préférences / devise / import    |
| IA          | `actions/ai`       | conversations (créer / renommer / suppr.) |
| Back Office | `actions/admin/*`  | users / plans / feature-flags / settings  |

Toutes les actions du Back Office **vérifient une permission RBAC** puis
**journalisent une entrée d'audit**. Détails : [Security.md](./Security.md).
