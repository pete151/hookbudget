#!/usr/bin/env bash
# Restauration de la base HookBudget depuis une sauvegarde pg_dump (format custom).
# Usage : DATABASE_URL="postgresql://..." ./scripts/restore.sh <fichier.dump>
# ⚠️ Écrase les données existantes des objets restaurés.
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL est requis}"

FILE="${1:?Chemin du fichier .dump requis}"
[ -f "$FILE" ] || { echo "❌ Fichier introuvable : $FILE"; exit 1; }

echo "⚠️  Restauration de $FILE dans la base cible."
read -r -p "Confirmer ? (oui/non) " ANSWER
[ "$ANSWER" = "oui" ] || { echo "Annulé."; exit 0; }

pg_restore --dbname="$DATABASE_URL" --clean --if-exists --no-owner --no-privileges "$FILE"

echo "✅ Restauration terminée."
