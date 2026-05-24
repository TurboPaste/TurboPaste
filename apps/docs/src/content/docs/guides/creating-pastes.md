---
title: Creating pastes
description: Every option in the TurboPaste editor, explained.
---

The home page of the web app is the editor. There's no separate "new paste" flow,  opening the site is opening the editor.

## Fields

| Field        | Required | Notes                                                                  |
| ------------ | -------- | ---------------------------------------------------------------------- |
| Title        | No       | Up to 120 chars. If empty, the paste is shown as **Untitled**.         |
| Language     | Yes      | Drives Shiki syntax highlighting. Defaults to `plaintext`.             |
| Content      | Yes      | Up to **1 MB** (`1 048 576` bytes). UTF-8.                             |
| Visibility   | Yes      | `public`, `unlisted`, or `private`. See [Visibility & access](/guides/visibility/). |
| Expiration   | Yes      | `never`, `10m`, `1h`, `1d`, `1w`. See [Expirations](/guides/expirations/).         |
| Password     | No       | Up to 128 chars. Required to view by anyone but the owner.             |
| Burn after read | No    | Deletes the paste after the first non-owner view.                      |

## Anonymous vs. signed-in

When you publish **without an account**:

- The paste is read-only forever. Nobody can edit or delete it (except an admin).
- You cannot use the `private` visibility, it requires an account.
- The paste has no `userId` and won't appear in any dashboard.

When you publish **signed in**:

- The paste is attached to your account.
- It appears in your dashboard at `/dashboard`.
- You can edit the title, content, language, visibility, expiration, password, and burn-after-read flag, or delete the paste outright.

## Picking a language

The language picker covers a curated set of 35+ languages, including: bash, c, cpp, csharp, css, diff, dockerfile, go, graphql, html, http, java, javascript, json, jsx, kotlin, lua, markdown, php, powershell, python, ruby, rust, scss, sql, svelte, swift, toml, tsx, typescript, vue, xml, yaml, zig.

If you're unsure, leave it on `plaintext`, the paste will still render fine, just without highlighting.

## The 1 MB limit

The editor shows a live byte counter under the textarea. Once you exceed 1 MB the counter turns red and **Publish** is disabled. The same limit applies to the REST API, submissions over the cap return [`413 content_too_large`](/api/errors/).

## After publishing

You'll be redirected to `/p/<id>`. From that page you can:

- Copy the paste URL with a single click.
- Copy the rendered content.
- (As the owner) edit or delete the paste.
- (As anyone else) report it for moderation.
