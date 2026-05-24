---
title: Errors & rate limits
description: Every error code the API can return, plus the rate-limit headers.
---

## Error shape

All errors are JSON objects with a stable `error` code. Some carry extra context:

```json
{ "error": "content_too_large", "maxBytes": 1048576 }
```

```json
{
    "error": "validation_error",
    "issues": [
        { "path": ["content"], "message": "Required" }
    ]
}
```

## Error reference

| HTTP | Code                | When                                                                 |
| ---- | ------------------- | -------------------------------------------------------------------- |
| 400  | `invalid_json`      | Request body could not be parsed as JSON.                            |
| 400  | `validation_error`  | Body failed schema validation. `issues` lists Zod errors.            |
| 401  | `api_key_required`  | Endpoint requires an API key and none was supplied.                  |
| 401  | `invalid_api_key`   | Key didn't match any record, or it has been revoked.                 |
| 401  | `password_required` | Paste is password-protected and the supplied password was missing or wrong. |
| 404  | `not_found`         | Paste doesn't exist, is hidden, is expired, or is private and you're not the owner. |
| 413  | `content_too_large` | Content exceeded the 1 MB limit. `maxBytes` field gives the cap.     |
| 429  | `rate_limited`      | You exceeded the per-minute request budget.                          |

The API deliberately does **not** distinguish "wrong password" from "no password supplied" or "private paste" from "missing paste", this avoids leaking metadata about the existence of pastes.

## Rate limits

| Subject                        | Budget               |
| ------------------------------ | -------------------- |
| Authenticated request (per key) | **120 req / minute** |
| Anonymous request (per IP)      | **20 req / minute**  |

Every response includes:

| Header                | Meaning                                          |
| --------------------- | ------------------------------------------------ |
| `X-RateLimit-Limit`   | Your per-minute budget.                          |
| `X-RateLimit-Remaining` | Requests left in the current window.           |
| `X-RateLimit-Reset`   | Unix timestamp (seconds) when the window resets. |

If you hit the limit, the API returns `429 rate_limited` and the same headers. Back off until `X-RateLimit-Reset` before retrying.

Rate limiting is in-memory and per-process. Behind a load balancer with multiple instances the effective limit scales with the number of instances; if you need a stricter budget, point your deployment at a shared Redis bucket.
