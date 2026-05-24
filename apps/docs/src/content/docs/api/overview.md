---
title: API overview
description: Base URL, content types, and what the public REST API can do.
---

The public REST API lives under the `/v1` prefix on the same server that hosts the web app's tRPC endpoint. By default that's `http://localhost:3000` in development.

```
http://localhost:3000/v1
```

## Capabilities

| You can...                | Endpoint                                 | Auth          |
| ----------------------- | ---------------------------------------- | ------------- |
| Create a paste          | `POST /v1/pastes`                      | Optional      |
| Fetch a paste           | `GET /v1/pastes/:id`                  | Optional      |
| List your own pastes    | `GET /v1/pastes`                      | **Required**  |
| Update one of your pastes | `PATCH /v1/pastes/:id`                 | **Required**  |
| Delete one of your pastes | `DELETE /v1/pastes/:id`                | **Required**  |
| Report a paste          | `POST /v1/pastes/:id/report`           | Optional      |

"Optional" means the endpoint works without a key, but supplying one binds the paste to your account or marks the report as authenticated.

## Conventions

- All request and response bodies are JSON. Set `Content-Type: application/json` on write requests.
- IDs are short URL-safe strings (10 characters, `nanoid` alphabet).
- Timestamps are ISO 8601 strings.
- Errors are returned as `{ "error": "<code>", ... }`, see [Errors & rate limits](/api/errors/).

## Limits

- Max paste content: **1 MB** (`1 048 576` bytes).
- Rate limits: **120 req/min** per API key, **20 req/min** per IP for anonymous requests. See [Errors & rate limits](/api/errors/).
- Allowed expirations: `never`, `10m`, `1h`, `1d`, `1w`.
- Allowed visibilities: `public`, `unlisted`, `private`.

## Versioning

The current and only stable version is `v1`. Breaking changes will ship under a new prefix (`/v2`) rather than mutate existing endpoints.
