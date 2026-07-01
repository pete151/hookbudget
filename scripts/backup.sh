#!/usr/bin/env bash
# Sauvegarde de la base HookBudget (pg_dump, format custom compressé).
# Usage : DATABASE_URL="postgresql://..." ./scripts/backup.sh [dossier]
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL est requis}"

OUT_DIR="${1:-./backups}"
mkdir -p "$OUT_DIR"

STAMP="$(date +%Y%m%d_%H%M%S)"
FILE="$OUT_DIR/hookbudget_${STAMP}.dump"

echo "→ Sauvegarde vers $FILE"
pg_dump --dbname="$DATABASE_URL" --format=custom --no-owner --no-privileges --file="$FILE"

echo "✅ Sauvegarde terminée : $FILE ($(du -h "$FILE" | cut -f1))"

# Rétention : conserve les 14 dernières sauvegardes.
ls -1t "$OUT_DIR"/hookbudget_*.dump 2>/dev/null | tail -n +15 | xargs -r rm -f
