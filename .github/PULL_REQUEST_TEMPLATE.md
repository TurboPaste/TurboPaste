<!--
Thanks for sending a PR! Please fill in the sections below.
For larger changes, consider opening an issue first to align on the approach.
-->

# Pull Request Template

## Summary

<!-- What does this PR change, and why? One or two short paragraphs is plenty. -->

## Related issues

<!-- Link issues this closes or relates to, e.g. "Closes #123". -->

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Refactor / internal change (no user-visible behavior)
- [ ] Documentation
- [ ] Build / CI / tooling
- [ ] Breaking change

## Checklist

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
