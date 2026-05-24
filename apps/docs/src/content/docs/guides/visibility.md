---
title: Visibility & access
description: How public, unlisted, and private pastes differ, and how password protection layers on top.
---

Every paste has exactly one visibility setting, and may optionally have a password. They control two independent things:

- **Visibility** decides who can find or open a paste's URL at all.
- **Password** decides whether opening the URL gives you the content.

## The three visibilities

### Public

- Listed in your dashboard.
- Anyone with the URL can view it without signing in.
- Eligible to be reported by anyone.
- Use this for snippets you want to share broadly.

### Unlisted

- Anyone with the URL can view it.
- Not surfaced anywhere except your dashboard (when signed in).
- This is the default for new accounts. It's a good middle ground: shareable, but not advertised.

### Private

- Only the owner can view it (and admins for moderation purposes).
- The URL returns `404 not_found` for everyone else, TurboPaste does not distinguish "private" from "missing" to outsiders. This avoids leaking the existence of a paste.
- **Requires an account.** The editor disables `private` for anonymous users.

## Layering on a password

Adding a password makes a paste require credentials to open, regardless of visibility:

- Public + password: discoverable via dashboard, but requires the password to read.
- Unlisted + password: URL alone isn't enough; the password is also needed.
- Private + password: the owner sees content without entering a password; nobody else can reach the paste at all. Practically this is the same as private without a password, since the URL is never enough to access it.

Passwords are hashed with `scrypt` (16-byte salt, 64-byte key) and never stored in plaintext.

On the API, callers supply the password via the `x-paste-password` header (preferred) or the `password` query parameter, see [Pastes - GET](/api/pastes/#get-v1pastesid).

## What admins can see

Admins can:

- See reports against any paste, including private ones.
- Hide a paste (`hidden: true`), once hidden, even the owner can't view it from the public URL.
- Unhide or delete.

Admins do **not** bypass passwords on the read endpoint, they use the moderation dashboard, which is separate from the public viewer.
