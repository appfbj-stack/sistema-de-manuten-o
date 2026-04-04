---
name: "nexus-db-supabase"
description: "Manages Supabase migrations and seeds. Invoke when applying migrations, seeding, or validating DB consistency."
---

# Nexus DB (Supabase)

## Objective
- Apply and list migrations on Supabase (self-hosted).
- Seed initial data and validate DB connectivity.
- Keep local and VPS databases consistent.

## Prerequisites
- Supabase CLI available in the runtime.
- DB URL accessible from Coolify network (self-hosted services).

## Commands (examples)
- Apply migrations:
  - `npx -y supabase@latest db push --db-url "<postgres-url>"`
- List migrations:
  - `npx -y supabase@latest migration list --db-url "<postgres-url>"`
- Seed (example with `supabase/seed.sql`):
  - `psql <postgres-url> -f supabase/seed.sql` or CLI equivalent

## Notes
- Disable SSL if using internal Docker networking (`?sslmode=disable`).
- Avoid committing DB creds; use `.env` or platform secrets.
