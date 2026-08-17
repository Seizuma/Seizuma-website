#!/usr/bin/env bash
# Met à jour seizuma.com depuis GitHub.
# Ce script vit DANS le repo : il se met donc à jour lui-même.
# Usage : ./deploy.sh
set -euo pipefail

cd "$(dirname "$0")"

BRANCHE="$(git rev-parse --abbrev-ref HEAD)"

echo "→ Récupération depuis GitHub (branche $BRANCHE)…"
git fetch --quiet origin
git reset --hard --quiet "origin/$BRANCHE"

# Recharge nginx si le conteneur tourne (inutile pour du HTML/CSS/JS,
# mais nécessaire si nginx.conf a changé).
if docker ps --format '{{.Names}}' | grep -q '^seizuma-web$'; then
  echo "→ Rechargement de nginx…"
  docker exec seizuma-web nginx -s reload
else
  echo "⚠ Conteneur seizuma-web arrêté — lance : docker compose up -d"
fi

echo "✓ Déployé — $(git log -1 --format='%h %s')"
