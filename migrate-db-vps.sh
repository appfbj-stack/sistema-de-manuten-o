#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/tmp/sistema-de-manuten-o}"
REPO_URL="${REPO_URL:-https://github.com/appfbj-stack/sistema-de-manuten-o.git}"
DB_CONTAINER="${DB_CONTAINER:-supabase-db-ycwccw8kwg4s884gg0sk8ckw}"
DB_NET="${DB_NET:-ycwccw8kwg4s884gg0sk8ckw}"

if [ ! -d "$PROJECT_DIR/.git" ]; then
  rm -rf "$PROJECT_DIR"
  git clone "$REPO_URL" "$PROJECT_DIR"
else
  git -C "$PROJECT_DIR" fetch origin
  git -C "$PROJECT_DIR" reset --hard origin/main
fi

DB_PASS="$(docker exec "$DB_CONTAINER" sh -lc 'printenv POSTGRES_PASSWORD || printenv DB_PASSWORD')"

docker run --rm \
  --network "$DB_NET" \
  -e PGPASSWORD="$DB_PASS" \
  -e PGSSLMODE=disable \
  -v "$PROJECT_DIR":/workspace \
  -w /workspace \
  node:20-bookworm \
  sh -lc "npx -y supabase@latest db push --db-url \"postgresql://postgres@${DB_CONTAINER}:5432/postgres?sslmode=disable\" && npx -y supabase@latest migration list --db-url \"postgresql://postgres@${DB_CONTAINER}:5432/postgres?sslmode=disable\""
