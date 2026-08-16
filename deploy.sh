#!/usr/bin/env bash
# Met à jour seizuma.com depuis GitHub.
# Usage : /opt/seizuma/deploy.sh
set -euo pipefail

cd "$(dirname "$0")/site"

echo "→ Récupération depuis GitHub…"
git fetch --quiet origin
git reset --hard --quiet origin/main   # remplace main par master si besoin

echo "→ Rechargement de nginx…"
docker exec seizuma-web nginx -s reload

echo "✓ seizuma.com déployé — $(git log -1 --format='%h %s')"
