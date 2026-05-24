---
title: Reporting & moderation
description: How users report abuse and how admins triage it.
---

## Reporting a paste

Any visitor, signed in or not, can report a paste they're currently viewing. On the paste page, scroll to the bottom and click **Report this paste**.

You'll be asked for:

- **Reason:** one of `spam`, `malware`, `phishing`, `illegal`, `personal-info`, or `other`.
- **Details:** (optional) up to 500 characters of free text to help the moderator.

The report **stores the reporter's user ID if they're signed in, otherwise their IP address**. The paste itself is not modified by the report, it stays online until a moderator acts on it.

You can also report via the API:

```bash
curl -X POST http://localhost:3000/v1/pastes/<id>/report \
  -H "Content-Type: application/json" \
  -d '{"reason":"spam","details":"obvious"}'
```

## Becoming an admin

There is no UI for granting admin. To promote yourself or another user, set their `role` to `admin` in the database. With Prisma Studio (`pnpm db:studio`) or psql:

```sql
UPDATE "user" SET role = 'admin' WHERE email = 'you@example.com';
```

After the next session refresh, an **Admin** link will appear in the header and `/admin` becomes accessible.

## The moderation dashboard

At `/admin` you'll find a tabbed list of reports:

- **Open:** reports awaiting a decision.
- **Actioned:** reports that resulted in a paste being hidden.
- **Dismissed:** reports judged to be invalid.

Each report card shows the reason, optional details, the reporter's identity **(or IP)**, the paste's current visibility, and quick actions:

- **Hide:** sets `hidden = true` on the paste. Hidden pastes return `404` to the public viewer and API. All open reports against that paste are also marked `actioned`.
- **Unhide:** restores a previously hidden paste.
- **Dismiss:** marks a report as `dismissed` without touching the paste.
- **Mark actioned:** marks a report as resolved when you've handled it via other means.

### What hiding does (and doesn't)

Hiding is reversible, it sets a flag, it doesn't delete content. If you need to remove the content permanently, delete the paste from Prisma Studio or via the API. There's no admin-only delete endpoint by design; deletes go through the normal owner mutation, and admins should only escalate to deletion when truly necessary.

## Audit trail

There's no built-in audit log. If you need one, you can add an `AuditLog` model to the schema and log mutations from the admin router. Or maybe can be implemented in the future, why not give it a try and submit a PR?
