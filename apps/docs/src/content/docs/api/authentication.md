---
title: Authentication
description: Issue, use, and revoke API keys.
---

The public API supports two modes:

- **Anonymous:** no header required. Subject to lower rate limits, can't list your pastes, can't update or delete.
- **Authenticated:** pass a bearer token in `Authorization` (or `x-api-key`). Required for writes against existing pastes.

## Creating an API key

1. Sign in to the web app.
2. Go to `/dashboard`.
3. In the **API keys** panel, click **New key**, give it a name, and confirm.

The plaintext key is shown **once**. It looks like:

```
tp_AbCDeFgHiJkLmNoPqRsTuVwXyZ1234567890_abcd
```

Copy it immediately and store it somewhere safe. TurboPaste stores only a SHA-256 hash of the key, so you cannot recover it later.

## Using a key

Send it as a bearer token:

```bash
curl -H "Authorization: Bearer tp_YOUR_KEY" \
  http://localhost:3000/v1/pastes
```

Or as `x-api-key`:

```bash
curl -H "x-api-key: tp_YOUR_KEY" \
  http://localhost:3000/v1/pastes
```

When a key is supplied:

- Pastes you create are bound to your account and appear in your dashboard.
- You can `PATCH` and `DELETE` pastes you own.
- Your rate limit is **120 req/min** instead of the 20 req/min anonymous limit.
- The `lastUsedAt` timestamp on the key is updated.

## Revoking a key

In `/dashboard`, hit the trash icon next to a key and confirm. The key's `revokedAt` is set immediately. Any future requests using that key will return `401 invalid_api_key`.

There is no undelete,  if you revoke by accident, create a fresh key.

## What a key can do

Keys are scoped to **your user account**. They cannot:

- Read another user's private pastes.
- Edit or delete pastes you don't own.
- Use admin endpoints, admin actions are only available through the tRPC API used by the web `/admin` page.

There is no fine-grained scoping (read-only keys, write-only keys, etc.) in v1. Maybe in a future version, why not give it a try and submit a PR?
