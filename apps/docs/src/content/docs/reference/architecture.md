---
title: Architecture
description: How the apps and packages in the TurboPaste monorepo fit together.
---

TurboPaste is a [Better T Stack](https://www.better-t-stack.dev/) monorepo built with the following template:

```bash
pnpm create better-t-stack@latest turbopaste-app --frontend tanstack-router --backend hono --runtime node --api trpc --auth better-auth --payments none --database postgres --orm prisma --db-setup docker --package-manager pnpm --git --web-deploy none --server-deploy none --install --addons biome evlog husky pwa skills starlight turborepo --examples todo
```

There are three apps and six packages.

## Apps

### `apps/server` - Hono server (`:3000`)

The single backend process. It hosts:

- **Better Auth** at `/api/auth/*` (sessions, email/password sign-up).
- **tRPC** at `/trpc/*`, mounted with `@hono/trpc-server`.
- **Public REST API** at `/v1/*`, mounted as a sub-Hono app from [`apps/server/src/public-api.ts`](https://github.com/TurboPaste/TurboPaste/blob/main/apps/server/src/public-api.ts).
- evlog request logging via `evlog/hono`.

### `apps/web` - TanStack Router + Vite (`:3001`)

The user-facing UI. File-based routing under `apps/web/src/routes`:

- `/`: paste editor.
- `/p/$id`: paste viewer with owner-edit and report flows.
- `/dashboard`: your pastes + API keys.
- `/admin`: moderation (admin role only).
- `/docs`: copyable curl reference.
- `/login`: sign-in / sign-up.

Talks to the server via tRPC (`@trpc/tanstack-react-query`) for the in-app flows and Better Auth's React client for sessions.

### `apps/docs` - Astro Starlight (`:4321`)

This very site. Standalone content; no runtime coupling to the rest of the stack.

## Packages

| Package             | Purpose                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------- |
| `@turbopaste/api`   | tRPC routers (`paste`, `report`, `apiKey`, `admin`) and shared helpers in `src/lib/paste.ts`. |
| `@turbopaste/auth`  | Better Auth instance with the `role` additional field.                                   |
| `@turbopaste/db`    | Prisma schema (split across `auth.prisma` and `paste.prisma`), generated client.         |
| `@turbopaste/ui`    | Tailwind base + shadcn-style primitives (`Button`, `Input`, `Textarea`, `Dialog`, ...).   |
| `@turbopaste/env`   | `@t3-oss/env-core` definitions for server and web environments.                          |
| `@turbopaste/config`| Shared tsconfig / tooling defaults.                                                      |

## Auth model

- Sessions are issued by Better Auth and live in cookies (`SameSite=None; Secure`).
- The tRPC `context` resolves the session from `auth.api.getSession`.
- `protectedProcedure` rejects requests without a session.
- `adminProcedure` further rejects requests whose `session.user.role !== "admin"`.
- API keys are independent of sessions: they're SHA-256 hashed and looked up directly by the REST middleware.

## Why the public REST API isn't tRPC

tRPC is great inside the app, but external integrations expect plain HTTP and JSON. Mounting a small Hono router at `/v1` gives integrators a stable surface without forcing them to install a tRPC client, while reusing the same schemas and helpers under the hood.
