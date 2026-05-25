---
title: Quickstart
description: Run TurboPaste locally and publish your first paste in under a minute.
---

This guide gets you from a fresh clone to a published paste in your local browser.

:::tip[Just want to run it?]
If you don't plan to hack on TurboPaste, skip the per-app setup and use the bundled Docker stack:

```bash
docker compose up -d --build
```

That brings up Postgres, the server (`:3000`), the web app (`:3001`), and the docs site (`:4321`). Migrations run automatically on every container start. See [Self-hosting - Docker Compose](/reference/self-hosting/#docker-compose) for env-var overrides.
:::

## Prerequisites

- Node.js 20+
- pnpm 11+
- A reachable Postgres instance (Docker compose is included)

## 1. Install dependencies

```bash
pnpm install
```

## 2. Configure environment

Create `apps/server/.env` with at minimum:

```bash
BETTER_AUTH_SECRET=a-random-string-at-least-32-chars-long
BETTER_AUTH_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/turbopaste
```

And `apps/web/.env`:

```bash
VITE_SERVER_URL=http://localhost:3000
```

## 3. Start the database

If you don't already have Postgres running, use the bundled Docker compose:

```bash
pnpm db:start
```

## 4. Sync the schema

```bash
pnpm db:push
```

This applies the Prisma schema (users, sessions, pastes, reports, API keys) to your database without creating migrations, good for local dev.

## 5. Run the apps

In one terminal:

```bash
pnpm dev
```

That starts the server on `:3000` and the web app on `:3001` via Turborepo.

## 6. Publish a paste

Open <http://localhost:3001>, the home page **is** the editor. Type something, pick a language, hit **Publish paste**, and you'll be redirected to its public URL.

## 7. (Optional) Try the REST API

Anonymous create:

```bash
curl -X POST http://localhost:3000/v1/pastes \
  -H "Content-Type: application/json" \
  -d '{"content":"hello world","language":"plaintext"}'
```

You'll get back a JSON object including `id` and `url`. Fetch it back:

```bash
curl http://localhost:3000/v1/pastes/<id>
```

## Next steps

- [Creating pastes](/guides/creating-pastes/): explore every option in the editor.
- [Public API overview](/api/overview/): learn about auth, rate limits, and endpoints.
- [Self-hosting](/reference/self-hosting/): when you're ready to deploy.
