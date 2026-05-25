<div align="center">

# TurboPaste

**A futuristic, self-hostable pastebin.**
Syntax highlighting · expirations · password protection · burn-after-read · public REST API.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](./LICENSE)
[![CI](https://github.com/TurboPaste/TurboPaste/actions/workflows/ci.yml/badge.svg)](https://github.com/TurboPaste/TurboPaste/actions/workflows/ci.yml)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

</div>

---

TurboPaste is a modern pastebin built on a TypeScript monorepo scaffolded with [Better T Stack](https://www.better-t-stack.dev/): **Hono + tRPC + Prisma + Postgres + Better Auth + TanStack Router + Tailwind**, with a Vercel-inspired dark UI.

- 📝 Publish pastes anonymously or signed in.
- 🎨 30+ languages highlighted with [Shiki](https://shiki.style/).
- 🔒 Password protection, burn-after-read, time-based expirations.
- 🚪 Three visibilities: public, unlisted, private.
- 🛡 Built-in reporting + admin moderation dashboard.
- 🔑 Per-user API keys and a clean REST API for automation.
- 📦 One-command local setup with Docker Compose.

## Demo

> _Not deployed yet, see [Self-hosting](#self-hosting) below to run your own._

## Table of contents

- [Quick start](#quick-start)
- [Public REST API](#public-rest-api)
- [Self-hosting](#self-hosting)
- [Available scripts](#available-scripts)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## Quick start

### Run it with Docker

If you only want to use TurboPaste (not hack on it), the bundled Compose stack is the shortest path:

```bash
git clone https://github.com/TurboPaste/TurboPaste.git
cd TurboPaste
docker compose up -d --build
```

That brings up Postgres, the server (`:3000`), web (`:3001`), and docs (`:4321`). The server's entrypoint runs `prisma migrate deploy` on every start, so `docker compose pull && docker compose up -d` is all you need after a release. Override `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `CORS_ORIGIN`, `VITE_SERVER_URL`, and `VITE_DOCS_URL` via environment variables, see [the self-hosting docs](apps/docs/src/content/docs/reference/self-hosting.md#docker-compose).

### Develop locally

#### Prerequisites

- [Node.js](https://nodejs.org) **20+**
- [pnpm](https://pnpm.io) **11+**
- [Docker](https://www.docker.com) (only if you don't already have Postgres)

#### Set it up

```bash
# 1. Clone
git clone https://github.com/TurboPaste/TurboPaste.git
cd TurboPaste

# 2. Install
pnpm install

# 3. Copy env files
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env

# 4. Generate a session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Paste it into apps/server/.env as BETTER_AUTH_SECRET

# 5. Start Postgres (skip if you already have one)
pnpm db:start

# 6. Apply the schema
pnpm db:push

# 7. Run everything
pnpm dev
```

Open <http://localhost:3001>, the home page is the editor. Type, hit **Publish paste**, share the link.

Want the docs site too? `pnpm dev` starts all apps -> <http://localhost:4321>.

## Public REST API

The server exposes a stable REST API under `/v1` for automating paste creation and management. Authenticate by sending a per-user API key generated from `/dashboard`:

```bash
curl -X POST http://localhost:3000/v1/pastes \
  -H "Authorization: Bearer tp_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hello",
    "content": "console.log(\"hi\")",
    "language": "javascript",
    "expiration": "1d"
  }'
```

Full reference including auth, errors, rate limits, every endpoint, lives in [`apps/docs/src/content/docs/api`](apps/docs/src/content/docs/api/).

## Self-hosting

| What you're deploying | Build                   | Serve                                     | Docker image                |
| --------------------- | ----------------------- | ----------------------------------------- | --------------------------- |
| `apps/server`         | `pnpm -F server build`  | `node apps/server/dist/index.mjs`         | `apps/server/Dockerfile`    |
| `apps/web`            | `pnpm -F web build`     | Any static host (Caddy, nginx, Vercel...) | `apps/web/Dockerfile`       |
| `apps/docs`           | `pnpm -F docs build`    | Any static host                           | `apps/docs/Dockerfile`      |
| Postgres              | -                       | Any Postgres 14+                          | `postgres:17-alpine`        |

The repo ships a root `docker-compose.yml` that wires all four services together. Required env vars, CORS / cookie gotchas, and the Compose recipe are in [`apps/docs/src/content/docs/reference/self-hosting.md`](apps/docs/src/content/docs/reference/self-hosting.md).

## Available scripts

| Script                | What it does                                 |
| --------------------- | -------------------------------------------- |
| `pnpm dev`            | Run web + server in parallel via Turborepo   |
| `pnpm dev:web`        | Web only                                     |
| `pnpm dev:server`     | Server only                                  |
| `pnpm build`          | Build every app and package                  |
| `pnpm check`          | Biome format + lint (writes fixes)           |
| `pnpm check-types`    | TypeScript across the whole monorepo         |
| `pnpm db:start`       | `docker compose up -d` for Postgres          |
| `pnpm db:push`        | Sync Prisma schema to the database           |
| `pnpm db:migrate`     | Create + apply a migration                   |
| `pnpm db:deploy`      | Apply pending migrations in production       |
| `pnpm db:studio`      | Open Prisma Studio                           |

## Documentation

The Starlight site at `apps/docs` covers everything in depth:

- **Start here:** Introduction, Quickstart
- **Guides:** Creating pastes, Visibility, Expirations, Editing, Moderation
- **Public API:** Overview, Authentication, Pastes, Reports, Errors
- **Reference:** Architecture, Data model, Self-hosting

Run it locally with `pnpm -F docs dev`.

## Contributing

PRs are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening one.

Looking for somewhere to start? Issues tagged [`good first issue`](https://github.com/TurboPaste/TurboPaste/labels/good%20first%20issue) are scoped to be approachable for newcomers.

## License

TurboPaste is licensed under the **GNU Affero General Public License v3.0 or later**.

In short: you can use, modify, and redistribute the code freely, but if you run a modified TurboPaste as a public service, you must publish your changes under the same license. See [LICENSE](./LICENSE) for the full text.
