# Sécurité — HookBudget

## Authentification & sessions

- **Better Auth** (e-mail + mot de passe, ≥ 8 caractères ; OAuth Google/GitHub
  prêts). Mots de passe hachés côté Better Auth (`Account.password`).
- Sessions par cookie httpOnly. `proxy.ts` (Edge) redirige vers `/login` sans
  cookie ; `requireAuth()` / `requireAdmin()` revalident côté serveur.

## Autorisation (RBAC — Back Office)

- Rôles `SUPER_ADMIN`, `ADMIN`, `SUPPORT`, `ANALYST` (champ `User.adminRole`,
  `null` = utilisateur classique).
- Matrice permissions dans `lib/admin/rbac.ts` ; tables `Role`/`Permission` en
  miroir. Le rôle est relu **frais en base** à chaque garde (révocation immédiate).
- Chaque action sensible : **vérifie la permission** (`authorizeAdmin`) **puis
  journalise** un `AuditLog` (auteur, action, cible, métadonnées, IP).

## En-têtes HTTP & CSP

Définis dans `next.config.ts` pour toutes les routes :

- `Content-Security-Policy` (default-src 'self' ; `frame-ancestors 'none'`…)
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (caméra/micro/géoloc désactivés)
- `Strict-Transport-Security` (HSTS)

## Rate limiting & brute-force

- `lib/security/rate-limit.ts` : fenêtre glissante par clé (IP/utilisateur).
  Appliqué au chat IA (20/min) ; extensible aux routes sensibles. En production
  multi-instances, brancher un store partagé (Redis/Upstash).
- L'assistant IA applique aussi une limite quotidienne par utilisateur.

## Validation & injection

- **Zod** valide toutes les entrées des Server Actions.
- **Prisma** (requêtes paramétrées) protège contre l'injection SQL. Les rares
  `$queryRaw` n'interpolent que des littéraux typés, jamais d'entrée utilisateur.

## XSS / CSRF

- React échappe le contenu par défaut ; la CSP limite les scripts.
- Better Auth + cookies `SameSite` + Server Actions (jetons Next.js) limitent le
  CSRF.

## Journalisation des événements de sécurité

`lib/security/events.ts` centralise les événements (`auth.failure`,
`ratelimit.exceeded`, `admin.forbidden`…) via le logger structuré — point
d'accroche pour un SIEM ou Sentry.

## Données sensibles

- Le contexte transmis à l'IA est **nettoyé** (aucun e-mail, mot de passe, jeton
  ni identifiant sensible).
- Secrets uniquement via variables d'environnement (jamais commités). Voir
  `lib/env.ts` pour la validation.

## Signalement d'une vulnérabilité

Contacter l'équipe en privé plutôt que d'ouvrir une issue publique.
