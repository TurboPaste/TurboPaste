<!--
Thanks for sending a PR! Please fill in the sections below.
For larger changes, consider opening an issue first to align on the approach.

Every commit on this branch MUST follow Conventional Commits, because PRs
are merged into main without squashing, each commit lands on main verbatim
and release-please reads them to decide the next version and write the
changelog. The PR title should also follow the format (a CI check enforces
it), but the per-commit messages are what drive releases.

  feat: short description       (new user-facing feature, bumps version)
  fix: short description        (bug fix, bumps version)
  docs: short description       (documentation only)
  refactor: short description   (internal change, no user-visible behavior)
  perf: short description       (performance improvement)
  build: short description      (build system / dependencies)
  ci: short description         (GitHub Actions / workflows)
  chore: short description      (everything else)
  feat!: short description      (breaking change, bumps major)
-->

# Pull Request Template

## Summary

<!-- What does this PR change, and why? One or two short paragraphs is plenty. -->

## Related issues

<!-- Link issues this closes or relates to, e.g. "Closes #123". -->

## Checklist

- [ ] Every commit on this branch follows Conventional Commits (`feat:`, `fix:`, `docs:`, etc.), fixup commits cleaned up with `git rebase -i`
- [ ] PR title also follows Conventional Commits
- [ ] `pnpm check` passes (Biome lint + format)
- [ ] `pnpm check-types` passes
- [ ] `pnpm build` passes
- [ ] If I changed Prisma schema, I ran `pnpm db:generate` and the generated client compiles
- [ ] If I changed the public REST API, tRPC routers, or env vars, I updated the relevant page under `apps/docs/src/content/docs`
- [ ] I added or updated tests where it made sense
- [ ] My branch is named `<type>/<short-slug>` (e.g. `feat/burn-after-read`)

## Screenshots / recordings

<!-- For UI changes, drop before/after screenshots or a short recording here. -->

## Notes for reviewers

<!-- Anything reviewers should focus on, known gaps, follow-ups planned, etc. -->
