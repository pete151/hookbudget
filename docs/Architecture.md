# Architecture — HookBudget

HookBudget est une application **Next.js 16 (App Router)** en TypeScript, adossée
à **PostgreSQL** via **Prisma 7**, avec authentification **Better Auth**.

## Vue d'ensemble

```
┌──────────────────────────────────────────────────────────────┐
│  Navigateur (React 19, Tailwind v4, shadcn/ui, next-themes)   │
└───────────────┬──────────────────────────────────────────────┘
                │  Server Components / Server Actions / Route Handlers
┌───────────────▼──────────────────────────────────────────────┐
│  Next.js (App Router)                                         │
│  proxy.ts (middleware Edge) → protège /dashboard et /admin    │
│  instrumentation.ts → validation env + observabilité          │
├──────────────────────────────────────────────────────────────┤
│  actions/*    Server Actions (mutations, Zod)                 │
│  services/*   Accès données (Prisma), orchestration            │
│  domain/*     Logique métier PURE (aucune I/O, testable)      │
│  lib/*        auth, admin/RBAC, ai, security, env, logger      │
└───────────────┬──────────────────────────────────────────────┘
                │  Prisma 7 + @prisma/adapter-pg
┌───────────────▼──────────────────────────────────────────────┐
│  PostgreSQL                                                   │
└──────────────────────────────────────────────────────────────┘
```

## Couches

- **`domain/`** — logique pure (analyses IA, calculs de rapports). Sans accès
  base ni réseau → couverte par les tests unitaires Vitest.
- **`services/`** — requêtes Prisma optimisées (parallélisées, `Decimal → number`),
  pagination, agrégations. Marquées `server-only`.
- **`actions/`** — Server Actions : validation **Zod**, contrôle d'accès,
  `revalidatePath`. Le Back Office ajoute un contrôle de permission + audit.
- **`components/`** — Server Components pour le fetch, Client Components pour
  l'interactivité (formulaires, graphiques Recharts, streaming du chat IA).

## Espaces

| Espace      | Racine       | Garde                                          |
| ----------- | ------------ | ---------------------------------------------- |
| Public      | `/`          | —                                              |
| Authentifié | `/dashboard` | `proxy.ts` (cookie) + `requireAuth()` (layout) |
| Back Office | `/admin`     | `proxy.ts` (cookie) + `requireAdmin()` (RBAC)  |

## Modules métier

Authentification · Dashboard · Revenus · Dépenses · Budgets · Objectifs
d'épargne · Notifications · Rapports/Exports · Paramètres · Assistant IA ·
Back Office (RBAC, audit, plans, feature flags, paramètres système).

## Données

10+ modèles Prisma. Montants en `Decimal(12,2)`. Index sur `userId`,
`categoryId`, `date`, `createdAt`, etc. Suppressions en cascade rattachées au
`User` ; `SetNull` sur les catégories (conservation de l'historique).

## Sécurité (résumé)

En-têtes HTTP + CSP (`next.config.ts`), rate limiting (`lib/security/*`),
validation Zod systématique, RBAC pour le Back Office, journal d'audit. Détails :
[Security.md](./Security.md).
