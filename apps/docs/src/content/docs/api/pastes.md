---
title: Pastes
description: REST endpoints for creating, fetching, updating, and deleting pastes.
---

All paste endpoints live under `/v1/pastes`. Replace `:id` with a paste's 10-character ID.

## `POST /v1/pastes`

Create a paste. Works with or without an API key.

### Request body

| Field           | Type                                                                 | Required | Default       |
| --------------- | -------------------------------------------------------------------- | -------- | ------------- |
| `content`       | string (≤ 1 MB)                                                      | **yes**  | -             |
| `title`         | string (≤ 120 chars)                                                 | no       | `null`        |
| `language`      | string                                                               | no       | `"plaintext"` |
| `visibility`    | `"public" \| "unlisted" \| "private"`                                | no       | `"public"`    |
| `expiration`    | `"never" \| "10m" \| "1h" \| "1d" \| "1w"`                           | no       | `"never"`     |
| `password`      | string (≤ 128 chars)                                                 | no       | none          |
| `burnAfterRead` | boolean                                                              | no       | `false`       |

### Example

```bash
curl -X POST http://localhost:3000/v1/pastes \
  -H "Authorization: Bearer tp_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hello",
    "content": "console.log(\"hi\")",
    "language": "javascript",
    "visibility": "unlisted",
    "expiration": "1d"
  }'
```

### Response - `201 Created`

```json
{
    "id": "M9RwhAiAJH",
    "title": "Hello",
    "content": "console.log(\"hi\")",
    "language": "javascript",
    "visibility": "unlisted",
    "expiration": null,
    "expiresAt": "2026-05-25T14:21:29.858Z",
    "burnAfterRead": false,
    "hasPassword": false,
    "views": 0,
    "hidden": false,
    "createdAt": "2026-05-24T14:21:29.929Z",
    "updatedAt": "2026-05-24T14:21:29.929Z",
    "userId": "u_xxx",
    "url": "http://localhost:3000/p/M9RwhAiAJH"
}
```

---

## `GET /v1/pastes/:id`

Fetch a paste by ID.

### Headers

| Header              | When to use                                            |
| ------------------- | ------------------------------------------------------ |
| `Authorization`     | If you're the owner and want to skip the password gate.|
| `x-paste-password`  | Required if the paste is password-protected and you're not the owner. |

You may also supply the password as `?password=...`, but the header is preferred (it doesn't show up in server logs).

### Behavior

- Returns `404 not_found` for: unknown ID, hidden paste, expired paste, `private` paste accessed by a non-owner.
- Returns `401 password_required` if the paste has a password and none (or a wrong one) was supplied.
- If `burnAfterRead` is `true` and the caller is not the owner, the paste is deleted **after** content is returned. The response includes `"burned": true`.

### Response - `200 OK`

```json
{
    "id": "M9RwhAiAJH",
    "title": "Hello",
    "content": "console.log(\"hi\")",
    "language": "javascript",
    "visibility": "unlisted",
    "expiresAt": "2026-05-25T14:21:29.858Z",
    "burnAfterRead": false,
    "hasPassword": false,
    "views": 1,
    "hidden": false,
    "createdAt": "2026-05-24T14:21:29.929Z",
    "updatedAt": "2026-05-24T14:21:29.929Z",
    "userId": "u_xxx",
    "burned": false
}
```

---

## `GET /v1/pastes`

List pastes belonging to the authenticated user.

### Query params

| Param    | Type    | Notes                              |
| -------- | ------- | ---------------------------------- |
| `limit`  | number  | 1–50, default 20                   |
| `cursor` | string  | Paste ID returned by previous call |

### Response - `200 OK`

```json
{
    "items": [
        {
            "id": "M9RwhAiAJH",
            "title": "Hello",
            "language": "javascript",
            "visibility": "unlisted",
            "views": 0,
            "hidden": false,
            "expiresAt": null,
            "createdAt": "2026-05-24T14:21:29.929Z",
            "updatedAt": "2026-05-24T14:21:29.929Z"
        }
    ],
    "nextCursor": null
}
```

If `nextCursor` is non-null, pass it as `cursor=` on the next request to continue.

---

## `PATCH /v1/pastes/:id`

Update a paste you own. Requires an API key. Send only the fields you want to change.

| Field           | Type                                       | Notes                                       |
| --------------- | ------------------------------------------ | ------------------------------------------- |
| `title`         | string \| null                             | `null` clears the title.                    |
| `content`       | string (≤ 1 MB)                            |                                             |
| `language`      | string                                     |                                             |
| `visibility`    | `"public" \| "unlisted" \| "private"`      |                                             |
| `expiration`    | `"never" \| "10m" \| "1h" \| "1d" \| "1w"` | Replaces the existing `expiresAt`.          |
| `password`      | string \| null                             | `null` removes password protection.         |
| `burnAfterRead` | boolean                                    |                                             |

### Example

```bash
curl -X PATCH http://localhost:3000/v1/pastes/M9RwhAiAJH \
  -H "Authorization: Bearer tp_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"content":"updated"}'
```

### Response - `200 OK`

Returns the updated paste in the same shape as `GET`.

---

## `DELETE /v1/pastes/:id`

Delete a paste you own. Requires an API key.

```bash
curl -X DELETE http://localhost:3000/v1/pastes/M9RwhAiAJH \
  -H "Authorization: Bearer tp_YOUR_KEY"
```

### Response - `200 OK`

```json
{ "ok": true }
```

Reports against the paste are removed by cascade.
