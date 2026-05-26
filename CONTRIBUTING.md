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
- **Every commit must follow [Conventional Commits](https://www.conventionalcommits.org/).** PRs are merged into `main` without squashing, so each commit lands on `main` verbatim and release-please reads them to drive versioning and the changelog. Examples:
  - `feat: add password rotation endpoint`
  - `fix: prevent expired pastes from being viewed via cached link`
  - `docs: clarify burn-after-read semantics in the API reference`
  - `chore: bump biome to 2.5`
  - Breaking changes get a `!` after the type: `feat!: rename /v1/snippets to /v1/pastes`.
- The **PR title** should also follow Conventional Commits, a CI check enforces this and it keeps the PR list scannable, but the load-bearing thing for releases is the per-commit messages.
- If a branch has fixup/work-in-progress commits, clean them up with `git rebase -i` before merging so only the final, meaningful commits land on `main`.

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
- PRs are **merged directly into `main` without squashing**, so the branch's commit history is preserved on `main`. Make sure every commit on the branch follows Conventional Commits (see above) and represents a meaningful unit of change — clean up fixup commits with `git rebase -i` before requesting review.

## Releasing

Releases are automated with [release-please](https://github.com/googleapis/release-please) via [`.github/workflows/release-please.yml`](./.github/workflows/release-please.yml). Contributors don't tag anything by hand, the bot does the work as long as PR titles are conventional.

The flow:

1. PRs are merged into `main` without squashing, so each branch commit lands on `main` with its Conventional Commit message intact.
2. release-please-bot keeps an open **release PR** on `main` that bumps versions across all workspace `package.json` files, updates [`CHANGELOG.md`](./CHANGELOG.md), and updates [`.release-please-manifest.json`](./.release-please-manifest.json).
3. Every new conventional commit on `main` updates the release PR in place. `feat:` bumps the version, `fix:` and most others appear in the changelog under their section.
4. When a maintainer **merges the release PR**, release-please tags the commit (`vX.Y.Z`), creates a GitHub Release with the generated notes, and the release PR closes.

There's no published npm package, the monorepo is consumed by self-hosters who deploy from source.

## Questions?

If something isn't covered here, open a [discussion](https://github.com/TurboPaste/TurboPaste/discussions) or a draft PR, we'd rather help you ship than have you guess.
