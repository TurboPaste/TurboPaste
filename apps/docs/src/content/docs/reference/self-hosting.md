---
title: Self-hosting
description: Deploy TurboPaste to your own infrastructure.
---

TurboPaste is a Node.js server + a Vite-built static site + Postgres. Anywhere that runs those three things will host it. The fastest path is the bundled Docker Compose stack, see [Docker Compose](#docker-compose) below.

## What you're deploying

| Component        | Build command                         | Run command                                                  | Docker image                          |
| ---------------- | ------------------------------------- | ------------------------------------------------------------ | ------------------------------------- |
| `apps/server`    | `pnpm -F server build`                | `node apps/server/dist/index.mjs`                            | `apps/server/Dockerfile` (Node, :3000)|
| `apps/web`       | `pnpm -F web build`                   | Serve `apps/web/dist` as static files                        | `apps/web/Dockerfile` (nginx, :80)    |
| `apps/docs`      | `pnpm -F docs build`                  | Serve `apps/docs/dist` as static files                       | `apps/docs/Dockerfile` (nginx, :80)   |
| Postgres         | n/a                                   | Any Postgres 14+ instance                                    | `postgres:17-alpine` (in compose)     |

## Docker Compose

The repo ships a root `docker-compose.yml` that builds and wires up all four services. From a fresh clone:

```bash
docker compose up -d --build
```

That brings up Postgres, the server (`:3000`), the web app (`:3001`), and the docs site (`:4321`). The server's entrypoint runs `prisma migrate deploy` on every start, so a `docker compose pull && docker compose up -d` after a release applies any new migrations automatically.

Override the defaults with environment variables before `up`:

```bash
BETTER_AUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))") \
BETTER_AUTH_URL=https://api.turbopaste.example \
CORS_ORIGIN=https://turbopaste.example \
VITE_SERVER_URL=https://api.turbopaste.example \
docker compose up -d --build
```

`VITE_SERVER_URL` and `VITE_DOCS_URL` are not baked into the web bundle at build time, the nginx entrypoint substitutes them at runtime so you can repoint the same image at different backends without rebuilding.

## Environment variables

### Server (`apps/server/.env`)

| Var                     | Example                                                  | Notes                                |
| ----------------------- | -------------------------------------------------------- | ------------------------------------ |
| `BETTER_AUTH_SECRET`    | 32+ random chars                                         | Used to sign session cookies.        |
| `BETTER_AUTH_URL`       | `https://api.turbopaste.example`                         | Public origin of the server.         |
| `CORS_ORIGIN`           | `https://turbopaste.example`                             | Public origin of the web app.        |
| `DATABASE_URL`          | `postgresql://user:pass@host:5432/turbopaste`            | Postgres connection string.          |
| `NODE_ENV`              | `production`                                             | Defaults to `development`.           |

### Web (`apps/web/.env`)

| Var               | Example                            |
| ----------------- | ---------------------------------- |
| `VITE_SERVER_URL` | `https://api.turbopaste.example`   |
| `VITE_DOCS_URL`   | `https://docs.turbopaste.example`  |

The web app is a static bundle, `VITE_SERVER_URL` and `VITE_DOCS_URL` are baked in at build time. To point a built bundle at a new server, rebuild. The bundled Docker image has an nginx entrypoint that substitutes these values at runtime, so you can repoint the same image without rebuilding **if you're using Docker**.

## Sessions across origins

Better Auth is configured for cross-origin cookies with:

```ts
defaultCookieAttributes: {
    httpOnly: true,
    sameSite: "none",
    secure: true,
}
```

For sessions to work in production:

- The server must be served over **HTTPS**. Browsers reject `SameSite=None` cookies on insecure origins.
- `CORS_ORIGIN` on the server must match the web app's origin exactly (scheme + host, no trailing slash).
- The web app must call the server with `credentials: "include"`, it already does (`apps/web/src/utils/trpc.ts`).

## Database migrations

For local dev `pnpm db:push` is fine. For production, use migrations:

```bash
# during development, when changing the schema
pnpm db:migrate --name <change>

# in production
pnpm db:deploy
```

If you're running the server via the bundled Docker image, you don't need to invoke `db:deploy` yourself, the container's entrypoint runs `prisma migrate deploy` on every start. Pulling a newer image and restarting is enough to apply pending migrations.

The `prisma.config.ts` reads `DATABASE_URL` from `apps/server/.env` by default, adjust the `dotenv.config({ path: ... })` call if your prod environment provides env vars directly.

## Redis (optional)

Setting `REDIS_URL` on the server turns on two things:

1. **Public API rate limiter:** The default in-process counter is per-replica, so behind a load balancer with N instances the effective budget is `N x limit`. With Redis the counter is shared across replicas using an atomic check-then-increment Lua script. If Redis is unreachable the limiter fails open and falls back to the in-memory counter on that instance, quota fairness degrades but the API stays up.
2. **Better Auth secondary storage:** Sessions and Better Auth's built-in rate limiter move to Redis instead of Postgres. Sessions are still mirrored to Postgres (`storeSessionInDatabase: true`) so a Redis restart does not lose them, but reads go through Redis. Unlike the API rate limiter this is **not** fail-open: if Redis is unreachable, users cannot authenticate.

```sh
REDIS_URL=redis://localhost:6379
```

The bundled `docker-compose.yml` ships a `redis:7-alpine` service that the server is wired to out of the box. For a single-replica deploy Redis is optional; for HA / multi-replica it's effectively required.

## Backups

Back up Postgres regularly. That's the entire durable surface, paste content, hashes, reports, API keys, and (when Redis is enabled) the canonical copy of sessions all live there. There is no object storage or file uploads. Redis only holds rate-limit counters and a session cache, all with TTLs, so it does not need to be backed up.

## Images / Dockerfiles

Each app ships its own multi-stage Dockerfile, all built from the monorepo root:

```bash
docker build -f apps/server/Dockerfile -t turbopaste-server .
docker build -f apps/web/Dockerfile -t turbopaste-web .
docker build -f apps/docs/Dockerfile -t turbopaste-docs .
```

The bundled `docker-compose.yml` at the repo root is the recommended way to run all of them together, see [Docker Compose](#docker-compose) above.
