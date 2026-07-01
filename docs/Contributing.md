# Contribuer — HookBudget

Merci de votre intérêt ! Ce guide décrit le flux de travail et les conventions.

## Mise en route

```bash
npm install
cp .env.example .env        # compléter les variables
docker compose up -d        # PostgreSQL local
npm run db:migrate
npm run db:seed && npm run db:seed:admin
npm run dev
```

## Scripts utiles

| Script              | Description                   |
| ------------------- | ----------------------------- |
| `npm run dev`       | Serveur de développement      |
| `npm run lint`      | ESLint                        |
| `npm run typecheck` | Vérification TypeScript       |
| `npm run test`      | Tests unitaires (Vitest)      |
| `npm run test:e2e`  | Tests End-to-End (Playwright) |
| `npm run format`    | Prettier (écriture)           |
| `npm run build`     | Build de production           |

## Conventions

- **Commits** : [Conventional Commits](https://www.conventionalcommits.org/)
  (`feat`, `fix`, `chore`, `docs`, `refactor`, `test`…), validés par commitlint.
- **Pré-commit** : Husky + lint-staged (ESLint `--fix` + Prettier sur les
  fichiers indexés).
- **Architecture** : logique pure dans `domain/`, accès données dans `services/`,
  mutations dans `actions/` (validation Zod). Voir [Architecture.md](./Architecture.md).
- **Tests** : ajouter des tests unitaires pour toute logique métier pure ;
  couvrir les nouveaux parcours critiques en E2E.

## Pull requests

1. Créer une branche depuis `main`.
2. Vérifier localement : `npm run lint && npm run typecheck && npm run test && npm run build`.
3. Ouvrir la PR — la CI GitHub Actions rejoue lint, types, tests et build.

## Style

- TypeScript strict, pas de code mort ni d'imports inutilisés (ESLint le vérifie).
- Textes d'interface en français ; commentaires expliquant le _pourquoi_.
