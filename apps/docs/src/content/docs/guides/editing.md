---
title: Editing your pastes
description: Update or delete pastes you own, from the dashboard, the paste page, or the API.
---

You can edit a paste if and only if you are signed in **as the original author**. Anonymous pastes are read-only forever, no edit token, no claim flow.

## From the paste page

Open `/p/<id>`. If you're the owner, the page shows an **Edit** button. Clicking it switches the view into an inline editor where you can change:

- Title
- Language
- Visibility
- Content

Hit **Save changes** to commit, or **Cancel** to discard.

Below the editor you'll also find **Delete**, which prompts for confirmation before removing the paste permanently.

## From the dashboard

`/dashboard` lists every paste tied to your account, with title, language, visibility, view count, and creation date. Click a title to jump to the paste page, then edit from there.

## From the API

Use `PATCH /v1/pastes/:id` with only the fields you want to change. For example, rotating the password:

```bash
curl -X PATCH http://localhost:3000/v1/pastes/M9RwhAiAJH \
  -H "Authorization: Bearer tp_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"password":"new-secret"}'
```

To remove the password entirely, pass `null`:

```bash
curl -X PATCH http://localhost:3000/v1/pastes/M9RwhAiAJH \
  -H "Authorization: Bearer tp_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"password":null}'
```

See the full [Pastes - PATCH reference](/api/pastes/#patch-v1pastesid) for every field.

## What you can't change

- **The paste ID.** It's part of the URL and is stable for the life of the paste.
- **Ownership.** Pastes cannot be transferred between accounts.
- **Views.** The view counter is server-side and not editable.
- **Anonymous pastes,  at all.** If you forgot to sign in before publishing, the only thing you can do is publish a new paste and replace the link wherever you shared it.
