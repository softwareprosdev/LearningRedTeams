# Switching from Prisma stub to Supabase (Postgres)

This repo currently ships a lightweight Prisma stub for quick unit tests (no database required). When you want to run integration tests or the real application against a real Postgres DB, Supabase is a convenient managed Postgres provider.

This guide shows safe steps to create a Supabase project and switch the repo to use the real database for local development or CI.

---

## Pre-reqs

- Install the supabase CLI: https://supabase.com/docs/guides/cli
- Install pnpm and repo dependencies (monorepo):

```bash
pnpm install
```

## Create a Supabase project (hosted)

1. Login using the supabase CLI:

```bash
supabase login
```

2. Create a new project on Supabase (managed, requires billing if you want a production-sized DB):

```bash
supabase projects create my-zeroday-db --org <your-org-id>
```

If the CLI doesn't support creating projects on your account, create the project via app.supabase.com and note the project ref and DB connection string.

3. Get the connection string and service-role (for migrations / server use). In the Supabase web dashboard: Project Settings → Database → Connection string, and Project Settings → API → Service Role Key.

Set these as environment variables locally (you can add to `apps/api/.env` or your shell for local runs):

```bash
export DATABASE_URL="postgres://..."
export SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
```

Note: Be careful with secrets; do not commit them to git.

## Prepare the repo to use the real DB

1. Build/generate the Prisma client in `@zdi/database` so the `@zdi/database` package resolves to the real Prisma client rather than the embedded stub:

```bash
pnpm --filter @zdi/database build
pnpm --filter @zdi/database db:generate
```

2. Make sure `packages/database/dist/index.js` will use real Prisma when the env var `USE_PRISMA_STUB=false` is set (this repo already supports that). When running tests or starting the API point the env var:

```bash
export USE_PRISMA_STUB=false
export DATABASE_URL="postgres://..."
```

3. Run migrations to prepare the DB schema (recommended for development):

```bash
pnpm --filter @zdi/database db:migrate
# or if you prefer push
pnpm --filter @zdi/database db:push
```

4. Seed the DB (if project includes seeds):

```bash
pnpm --filter @zdi/database db:seed
```

## Run integration tests against Supabase

Set required env and run tests. Example (Linux/macOS zsh):

```bash
export USE_PRISMA_STUB=false
export DATABASE_URL="postgres://..."
pnpm --filter @zdi/api test
```

The `USE_PRISMA_STUB=false` toggles code in `packages/database/dist/index.js` so the code imports the real `@prisma/client` (the client must be generated first).

## CI

For CI (GitHub Actions) tests against a Supabase DB you'll need to create a managed project and add secrets to your repo (DATABASE_URL, SUPABASE_SERVICE_ROLE_KEY). Create a workflow that sets USE_PRISMA_STUB=false and runs the migration & tests. Be cautious with cost and security when exposing a production-managed DB to CI.

## Troubleshooting & tips

- If Prisma client can't be loaded: ensure `pnpm --filter @zdi/database db:generate` ran successfully and `@prisma/client`'s native engines are available for the runner's platform.
- For ephemeral CI test DBs, use `supabase start` (local docker) or create a dedicated minimal project and remove it when done.
- Always store secrets in CI secret storage (not in plain text in YAML).
