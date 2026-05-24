---
title: Reports
description: Submit a report against a paste.
---

## `POST /v1/pastes/:id/report`

Submit a report. Works anonymously or with an API key, if a key is supplied, the report is attributed to your user account, otherwise to the **originating IP**.

### Request body

| Field     | Type                                                                                | Required |
| --------- | ----------------------------------------------------------------------------------- | -------- |
| `reason`  | `"spam" \| "malware" \| "phishing" \| "illegal" \| "personal-info" \| "other"`      | **yes**  |
| `details` | string (≤ 500 chars)                                                                | no       |

### Example

```bash
curl -X POST http://localhost:3000/v1/pastes/M9RwhAiAJH/report \
  -H "Content-Type: application/json" \
  -d '{"reason":"spam","details":"obvious spam"}'
```

### Response - `201 Created`

```json
{ "ok": true }
```

### Errors

| Status | Code               | Meaning                                |
| ------ | ------------------ | -------------------------------------- |
| 400    | `invalid_json`     | Request body wasn't valid JSON.        |
| 400    | `validation_error` | `reason` missing or not in the enum.   |
| 404    | `not_found`        | No paste with that ID.                 |
| 429    | `rate_limited`     | Per [rate limits](/api/errors/).       |

## No public list endpoint

There is no public endpoint to list reports. Moderation happens through the web UI at `/admin` (admin users only) and the underlying tRPC `admin.*` procedures.
