---
title: Self-hosting
description: Deploy TurboPaste to your own infrastructure.
---

TurboPaste is a Node.js server + a Vite-built static site + Postgres. Anywhere that runs those three things will host it.

## What you're deploying

| Component        | Build command                         | Run command                                                  |
| ---------------- | ------------------------------------- | ------------------------------------------------------------ |
| `apps/server`    | `pnpm -F server build`      | `node apps/server/dist/index.mjs`                            |
| `apps/web`       | `pnpm -F web build`           | Serve `apps/web/dist` as static files                        |
| `apps/docs`      | `pnpm -F docs build`        | Serve `apps/docs/dist` as static files                       |
| Postgres         | n/a                                   | Any Postgres 14+ instance                                    |

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

The web app is a static bundle, `VITE_SERVER_URL` is baked in at build time. To point a built bundle at a new server, rebuild.

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
pnpm -F @turbopaste/db exec prisma migrate dev --name <change>
# then in prod
pnpm -F @turbopaste/db exec prisma migrate deploy
```

The `prisma.config.ts` reads `DATABASE_URL` from `apps/server/.env` by default, adjust the `dotenv.config({ path: ... })` call if your prod environment provides env vars directly.

## Rate limiting at scale

The default rate limiter is in-process. Behind a load balancer with N server instances the effective per-key budget becomes `N x limit`. If that's too generous, swap the in-memory map in `apps/server/src/public-api.ts` for a Redis-backed counter, the interface (`rateCheck(subject, limit)`) is small enough that the change is local. Maybe a future release will include a Redis rate limiter out of the box.

## Backups

Back up Postgres regularly. That's the entire stateful surface, paste content, hashes, reports, API keys all live there. There is no object storage, no Redis, no file uploads.

## Image / Dockerfile

There's no shipped Dockerfile in v1, but can be included in the future versions. In the meantime, you can follow [docker-node-app-runner](https://github.com/barbarbar338/docker-node-app-runner) image to run TurboPaste in a container.