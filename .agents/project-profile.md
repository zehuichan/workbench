---
vibe-harness-profile: 1
project: workbench
commands:
  install: pnpm install
  focused-test: pnpm test -- <target>
  full-test: pnpm test
  coverage: none
  typecheck: pnpm typecheck
  lint: pnpm lint
  format: pnpm format
  build: pnpm build
  docs-check: none
  e2e: none
  bench: pnpm test:benchmark
  change-scope: git diff --name-status <base>...HEAD
vcs:
  host: github
  default-branch: main
  pr-cli: gh
surfaces:
  ui: true
  localized-ui: false
  bilingual-docs: false
  public-api: false
---

# Project profile: workbench

This file holds the project facts that the vibe-harness skills read: commands, version-control host, and enabled surfaces. Skills stay project-neutral and refer to these keys, for example "the profile's `commands.focused-test`". Keep every value verified against the repository. An unfilled marker is replaced only with a command that was run or a fact that was confirmed, and with `none` when the project has no such command.

## Keys

- `commands.*`: exact shell commands run from the repository root. Use `<target>` for a test file or name, `<base>` for a base ref, and `<file>` for a path. `focused-test` runs one test file or test name; `full-test` runs the whole unit suite; `docs-check` validates documentation; `change-scope` lists changed paths against a verified base.
- `vcs.host`: `github`, `gitlab`, or `other`. `vcs.pr-cli`: `gh`, `glab`, or `none`.
- `surfaces.ui`: the project ships a user-visible GUI. Enables `ui-ux-review`, `responsive-ui`, and `record-browser-gif`.
- `surfaces.localized-ui`: user-visible copy goes through a locale mechanism; reviews reject hardcoded copy.
- `surfaces.bilingual-docs`: documentation is maintained as paired translations that must stay aligned.
- `surfaces.public-api`: something outside the repository depends on the project (published packages, CLI flags, configuration keys, wire formats, persisted user data). Breaking changes need upgrade guides.

## Evidence by surface

Map each kind of change to the narrowest evidence that would fail for its regression. `pre-push-checks` selects from this table.

| Change touches | Required evidence |
| --- | --- |
| Source behavior | `commands.focused-test` on the owning tests |
| Public types or exports | `commands.typecheck`, then `commands.build` |
| Documentation | `commands.docs-check` and `git diff --check` |
| User-visible output | none. No snapshot or end-to-end suite. Exercise the affected route with `pnpm dev` at http://localhost:9527. |
| Build, packaging, or entry points | `commands.build`, then `pnpm preview` |

## Hooks and CI

Local hooks come from `lefthook.yml`. pre-commit runs oxlint, oxfmt, eslint, and stylelint on staged files, then `pnpm typecheck`. commit-msg runs commitlint. post-merge runs `pnpm install`.

CI is `.github/workflows/deploy.yml`. It runs on push to `main`, not on pull requests. The single job uses `ubuntu-latest`: `pnpm install --frozen-lockfile`, `pnpm run build` with `BASE_PATH=/workbench/`, then GitHub Pages.

## Project-specific rules

- Repository conventions, secrets, and the two UI stacks live in [AGENTS.md](../AGENTS.md), outside the vibe-harness block.
- Visual tokens live in [DESIGN.md](../DESIGN.md).
- Composable shape lives in the Composable shape entry in [AGENTS.md](../AGENTS.md).
- Workbench skills `workbench-code-review`, `workbench-ui-ux`, `workbench-find-simplifications`, and `workbench-agent-experience` live under `.agents/skills/`.
