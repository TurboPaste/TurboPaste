# Contributing to TurboPaste

Thanks for taking the time to contribute! This document outlines how to propose changes, the conventions we use, and what to expect from review.

By contributing you agree that your work will be licensed under [AGPL-3.0-or-later](./LICENSE), the same license as the rest of the project.

## Ways to contribute

- 🐛 **Report a bug:** open an issue using the **Bug report** template.
- 💡 **Suggest a feature:** open an issue using the **Feature request** template.
- 📖 **Improve the docs:** edit anything under `apps/docs/src/content/docs`.
- 🛠 **Send a pull request:** pick an open issue or propose something new.

## Development setup

See the [Quick start](./README.md#quick-start) in the README. The short version:

```bash
pnpm install
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
# fill in BETTER_AUTH_SECRET
pnpm db:start
pnpm db:push
pnpm dev
```

## Branching & commits

- Branch off `main`. Name branches `<type>/<short-slug>`, e.g. `feat/burn-after-read`, `fix/expiration-tz-bug`.
- Keep commits focused. Prefer small, reviewable PRs over large multi-feature ones.
- Commit messages don't need to follow Conventional Commits, but the PR title should be clear and present-tense ("Add password rotation endpoint", not "added password rotation").

## Pull request checklist

Before opening a PR, please make sure:

- [ ] `pnpm check` passes (Biome lint + format).
- [ ] `pnpm check-types` passes (TypeScript across the monorepo).
- [ ] `pnpm build` passes (every app and package builds).
- [ ] If you changed Prisma schema, `pnpm db:generate` has been run and the generated client compiles.
- [ ] If you changed the public API or env vars, you updated the relevant page in `apps/docs/src/content/docs`.
- [ ] You added or updated tests where it made sense (we know coverage is light, adding any is welcome).

CI runs all of the above on every PR. A red CI is a blocker for review.

## Code style

- **Formatter / linter:** Biome (`pnpm check`). Don't hand-format.
- **TypeScript** everywhere. Avoid `any`; prefer narrow types or generics.
- **Imports** should be sorted (Biome does this for you).
- **No comments restating what the code does**. Well-named identifiers do that. Comments are for the _why_ behind a non-obvious decision.
- **No emoji in code or commit messages** unless the file already uses them (e.g. the README).

## Architecture conventions

- **Shared logic** lives in `packages/api/src/lib/`. Both the tRPC routers and the REST API import from there; don't duplicate.
- **Server-side errors**: throw `TRPCError` from tRPC procedures, return `{ error: "<code>" }` JSON from REST routes. Error codes are stable and documented in `apps/docs/src/content/docs/api/errors.md`.
- **Validation**: every input goes through a Zod schema. Don't trust `req.body` directly.
- **Database access**: through Prisma. No raw SQL unless there's a measured reason.
- **Auth**: tRPC `protectedProcedure` / `adminProcedure` for the in-app routes; the REST middleware in `apps/server/src/public-api.ts` for `/v1/*`.

## Documentation changes

The docs site at `apps/docs` is Astro Starlight. Pages live under `apps/docs/src/content/docs`. To preview:

```bash
pnpm -F docs dev
```

If you add a new page, also update the sidebar in `apps/docs/astro.config.mjs`.

## Reviewing & merging

- Maintainers will try to acknowledge new PRs within a few days. We're a small project; please be patient.
- We may request changes, that's normal. Push additional commits to the same branch; don't force-push unless asked.
- PRs are merged with **Squash and merge** to keep `main` linear.

## Releasing

Maintainers cut releases by tagging a commit on `main` with `vX.Y.Z` (semver). The [release workflow](./.github/workflows/release.yml) publishes a GitHub Release whose notes are generated automatically from merged PRs, categorized by label via [`.github/release.yml`](./.github/release.yml). Tags containing a `-` (e.g. `v1.0.0-beta.1`) are marked as pre-releases.

There's no published npm package, the monorepo is consumed by self-hosters who deploy from source.

## Questions?

If something isn't covered here, open a [discussion](https://github.com/TurboPaste/TurboPaste/discussions) or a draft PR, we'd rather help you ship than have you guess.
