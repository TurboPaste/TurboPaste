---
title: Introduction
description: An overview of what TurboPaste is and how it's organized.
---

TurboPaste is a self-hostable pastebin designed for two things: getting a snippet of code or text in front of someone fast, and being a clean target for scripts and automation.

## What you can do

- **Publish a paste** with optional title, language, expiration, password, and visibility:  anonymously or signed in.
- **Edit and delete your own pastes** when signed in. Anonymous pastes are read-only forever.
- **Protect a paste** with a password or set it to delete itself after the first read.
- **Report a paste** if it's spam, malware, phishing, or otherwise abusive.
- **Use the REST API** at `/v1/*` to do all of the above from a script or another app.

## Who it's for

- Developers sharing logs, diffs, configs, or quick scripts.
- Teams that need a private, self-hosted alternative to public pastebins.
- Anyone who wants a small, fast, modern pastebin without a heavyweight stack behind it.

## How the project is laid out

TurboPaste is a [Better-T-Stack](https://www.better-t-stack.dev/) monorepo managed with pnpm and Turborepo.

```
apps/
  web/      -> TanStack Router + Vite frontend
  server/   -> Hono server hosting tRPC and the public REST API
  docs/     -> This Astro Starlight site
packages/
  api/      -> Shared tRPC routers and validation
  auth/     -> Better Auth configuration
  db/       -> Prisma schema, client, Docker compose
  ui/       -> Tailwind + shadcn-style primitives
  env/      -> Type-safe environment variables (server & web)
```

See the [architecture reference](/reference/architecture/) for a more detailed map.

## Conventions used in these docs

- `:id` in a path means a paste ID: a short, URL-safe 10-character string.
- `tp_...` is the prefix for every API key.
- The default local URLs are `http://localhost:3000` for the API/server and `http://localhost:3001` for the web app.
