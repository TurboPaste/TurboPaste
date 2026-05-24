---
title: Expirations & burn after read
description: Two ways to make a paste short-lived — time-based expiration and one-shot burn-after-read.
---

TurboPaste offers two independent ways to make a paste short-lived.

## Time-based expiration

Pick from a fixed set when publishing or editing:

| Value   | TTL                |
| ------- | ------------------ |
| `never` | No expiration      |
| `10m`   | 10 minutes         |
| `1h`    | 1 hour             |
| `1d`    | 24 hours           |
| `1w`    | 7 days             |

The TTL is stored as an absolute `expiresAt` timestamp at creation time. When a paste with a past `expiresAt` is requested, the API:

1. Deletes the paste row.
2. Returns `404 not_found` to the caller.

In other words, there is no background job, expiration is lazy and triggered by the next read. The paste view page treats an expired paste identically to a missing one.

## Burn after read

Toggle **Burn after read** in the editor (or set `"burnAfterRead": true` on the API). The first time the paste is viewed by someone other than the owner:

1. The content is returned to the caller, along with `"burned": true`.
2. The paste row is immediately deleted.

Subsequent views, by anyone, return `404 not_found`.

### Owner reads don't burn

The owner can preview their own burn-after-read paste without consuming it. This is so you can sanity-check a paste before sharing the link.

### Combining with other options

| Combination                         | Result                                                                 |
| ----------------------------------- | ---------------------------------------------------------------------- |
| Burn + password                     | The viewer must supply the password; on success, content + burn fires. |
| Burn + private                      | Only the owner can ever reach the paste, and owner reads don't burn, effectively useless. Use one or the other. |
| Burn + expiration                   | Whichever happens first wins.                                          |

## Caveats

- Expirations are best-effort: an expired paste stays in the database until the next read attempt against its ID. For privacy-critical use cases, prefer a short expiration **and** burn-after-read.
- If the server process crashes while serving a burn-after-read paste, the row may not be deleted but the client still saw the content. This is an unavoidable property of single-use tokens.
