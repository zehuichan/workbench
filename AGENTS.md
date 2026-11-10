# AGENTS.md

Workbench is a Vue 3 + TypeScript + Vite playground for business data entry and field linkage. Read [DESIGN.md](DESIGN.md) before changing playground, brand, or theme UI. Review a non-trivial change with [code-review](.agents/skills/code-review/SKILL.md).

## Repository layout

```
src/
  components/plus-table/   grid on el-table
  components/filters/      filter bar
  components/demo/         playground demo shell
  composables/             useEmitEffect, form draft, WeChat
  layouts/                 playground and site shell
  views/                   demo routes under src/views/<area>/
  ui/                      shadcn-vue primitives
  styles/                  Tailwind tokens (tailwind.css) and SCSS
  adapter/                 Element Plus field-control registry
  router/  api/  utils/
server/                    dev-only h3 mock for /api/*, mounted by the Vite dev server
brand/                     logo and preview HTML
scripts/                   local scripts
docs/                      documentation standard and defensive patterns
.agents/skills/            on-demand skills
.agents/notes/             Agent Notes
.agents/project-profile.md commands and surfaces the skills read
```

Prefer the closest existing module. Demo routes stay under `src/views/<area>/`. Reusable logic stays under `src/composables/` or `src/components/`.

## Commands

```sh
pnpm install            # Node >=20.19, pnpm >=10 (packageManager pins 10.33.4); prepare installs lefthook
pnpm dev                # Vite playground, http://localhost:9527
pnpm typecheck          # vue-tsc
pnpm lint               # oxfmt --check, oxlint --type-aware, eslint, stylelint
pnpm format             # stylelint --fix, oxfmt, oxlint --fix, eslint --fix
pnpm format:check       # oxfmt --check
pnpm test               # Vitest, happy-dom
pnpm test:benchmark     # Vitest bench, *.benchmark.ts
pnpm build              # typecheck, then production assets
pnpm preview
pnpm clean              # node_modules, dist, and local residue
pnpm reinstall          # clean, then install
```

Pre-commit (lefthook) runs oxlint, oxfmt, eslint, and stylelint on staged files, then a full typecheck. commit-msg runs commitlint (`commitlint.config.ts`).

### Run relevant checks locally

Match the command to the change. A composable fix runs its colocated Vitest file, and `pnpm typecheck` when types moved. A shell change also runs `src/layouts/__tests__/`. Run `pnpm typecheck` and `pnpm test` before calling a non-trivial change done. Do not rerun a check that already passed for the same diff.

UI changes: exercise the affected route in the playground. Judgment lives in [ui-ux-review](.agents/skills/ui-ux-review/SKILL.md).

## Secrets

WeChat and WeCom demos read `VITE_WECHAT_APPID`, `VITE_WORK_WECHAT_CORP_ID`, `VITE_WORK_WECHAT_AGENT_ID`, and the `VITE_*_ENABLED` flags. Those values are option defaults only. Never commit `.env` or credentials.

## Conventions

- ESM (`"type": "module"`). Import app code through the aliases in `components.json`: `@/components`, `@/composables`, `@/ui`, `@/utils`.
- **Composable shape** for `src/composables/` and `src/utils/` mirrors [VueUse](https://github.com/vueuse/vueuse): positional required args, trailing options, `UseXxxOptions` / `UseXxxReturn`, object returns, `MaybeRefOrGetter` + `toValue`, `tryOnScopeDispose`, `ConfigurableWindow`, no import-time side effects. File names stay kebab-case (`use-auto-save/use-auto-save.ts`).
- **Field controls register once.** `initComponentAdapter()` writes `useGlobalShareState`. PlusTable resolves editors with `resolveEditor`; Filters use the same `component` ids. Do not open a second map. `input-number` stays `controls: false` so a cell can leave edit mode on blur.
- **PlusTable** renders an `el-table`. `defineColumns` returns its array unchanged. New table behavior is a composable under `src/components/plus-table/composables/`, wired in `useTable` by explicit arguments. Descendants read context only through `usePlusTable()`.
- **emit-effect.** A bare function is `{ compute }`. `compute` overwrites user edits; `default` is a suggestion the user may override. `defineEmitRules` returns its argument unchanged.
- **Two UI stacks.** Playground chrome uses `src/ui/` (shadcn-vue). Data-entry demos use Element Plus through `src/adapter`. Tokens live in [DESIGN.md](DESIGN.md) and `src/styles/tailwind.css`. The two stacks divide the UI; they are not duplicate implementations.
- **Feedback surfaces.** A transient result uses `ElMessage`. A bulk rewrite that needs consent uses `useConfirmDialog` and `describeConfirmation` (`src/components/demo/use-confirm-dialog.ts`). Do not add a second toast system.
- **Playground exports are public.** The exports of `src/composables/index.ts` and `src/components/plus-table/index.ts` are the playground's public surface; few callers inside the repo do not make one dead. Check the README routes and demo pages first.
- **ERP demo pages are scenario samples.** Similar pages are not duplication unless they copy logic that would break together.
- **Check existing dependencies first**: `@vueuse/core`, `es-toolkit`, Element Plus, and Vue Router. A PR that adds a dependency says why they cannot do the job.
- **Runtime validation boundaries** are JSON parse, `localStorage` drafts, OAuth callbacks, and WeChat or WeCom SDK payloads.
- **No new assertions to `unknown`** (`as unknown` or `<unknown>`). Narrow the type, or validate at a boundary above. Do not add a cast to keep a call compiling.
- **Closed unions** switch on their tag. The leftover case assigns to `never`.
- Naming: `PascalCase` components and classes, `camelCase` functions (`useXxx`), `SCREAMING_SNAKE_CASE` only for exported config constants. Oxfmt owns semicolons, single quotes, and trailing commas (`oxfmt.config.ts`).
- Ask before deleting behavior that looks intentional.
- TODO markers: `FIXME` blocks this change, `TODO` is deferred, `XXX` is a known hazard.
- Files end with exactly one trailing newline.

## Type safety and documentation

`strict: true` in the app and node tsconfigs. Every remaining `any` says why narrowing is infeasible.

Public composable and component exports carry JSDoc for obligations the signature does not show: ownership, failure, and what `undefined` means. Composable JSDoc is English and includes `@example`.

## Testing

Vitest, happy-dom. Colocate tests in `__tests__/` or `*.test.ts` (`src/composables/__tests__/`, `src/components/plus-table/__tests__/`, `server/__tests__/`). Shared fixtures live under `__tests__/helpers`. Shell changes update `src/layouts/__tests__/`. Assert behavior, not private fields or call counts.

## Git

Conventional commits: `type(scope): subject`, imperative, at most 72 characters. Do not commit, push, or rewrite history unless the user asks. Do not skip hooks. Stage explicit paths.

## Agent skills

Load a skill when its description matches. Do not paste the skill back into this file. vibe-harness installs most of `.agents/skills/` and records them in `.agents/vibe-harness.lock.json`; `shadcn-vue` and `git-commit` come from `skills-lock.json`. Put a workbench rule in this file or the [project profile](.agents/project-profile.md), not in an installed skill: vibe-harness upgrades replace unmodified skills and three-way merge edited ones.

- [code-review](.agents/skills/code-review/SKILL.md) — before calling a non-trivial change done.
- [ui-ux-review](.agents/skills/ui-ux-review/SKILL.md) — product-visible UI.
- [shadcn-vue](.agents/skills/shadcn-vue/SKILL.md) — adding or styling `src/ui/` primitives.
- [find-simplifications](.agents/skills/find-simplifications/SKILL.md) — dead or speculative code.
- [agent-experience](.agents/skills/agent-experience/SKILL.md) and [prose-standard](.agents/skills/prose-standard/SKILL.md) — this file, skill descriptions, public JSDoc.

## Editing these instructions

Keep each rule to a few lines and link the skill or file that holds the procedure. If a section starts repeating a skill or the vibe-harness block, move the detail back. A change that adds, renames, or removes a skill updates its links here and in the project profile.

<!-- prettier-ignore-start -->
<!-- vibe-harness:begin -->
## Working agreement (vibe-harness)

These standing orders apply to every agent session. Project facts (commands, enabled surfaces, evidence per surface) live in the [project profile](.agents/project-profile.md); reusable workflows live in [.agents/skills/](.agents/skills/). Put project-specific rules outside this managed block: `vibe-harness` upgrades rewrite only the text between its markers.

### Evidence

- Run the narrowest check that would fail for the regression you are preventing. Leave exhaustive coverage to CI unless the user asks or the change is genuinely repository-wide. Before pushing, follow `pre-push-checks`; report only commands you actually ran.
- Tests describe behavior. When behavior changes on purpose, change its tests and state why in the pull request.
- Put every mechanically checkable rule into an executed check, and prove each new or changed check rejects an invalid case. Use narrow, justified exceptions instead of disabling a rule globally.
- A change that can move the cost of a hot path carries before-and-after measurements (`perf-evidence`).
- When a required command fails because the agent sandbox blocks credentials, network, inter-process communication, file watching, or a nested sandbox, retry it unchanged with the narrowest escalation the host offers. Require evidence that the sandbox caused the failure; never escalate to bypass a test failure or the product's own sandbox.
- Never commit credentials, and never print secret values.

### History

- Split independent changes. Fix a defect in the change that introduced it, then propagate the fix to the changes built on it.
- Unless the project rules outside this block restrict it, branches may merge-forward or rebase, including after review. A rewrite publishes with an exact `--force-with-lease` and aborts when the remote moved; raw `--force` is never used. Preserve an in-progress merge-forward checkpoint before taking a newer base.

### Design

- Explicit beats implicit at module and package boundaries. Defaulting is an explicit resolve step owned by the implementation, never a hidden fallback inside the operation.
- Deployment-varying choices are validated configuration, not hardcoded constants or test hooks. Protocol constants, external specifications, and security invariants stay fixed.
- Misconfiguration fails loudly at load when it is self-contained, otherwise at the earliest point where it can be resolved. Never silently skip a missing referent.
- Trust the type system at typed same-process boundaries: do not add runtime validation, fallback behavior, or hostile-input tests solely for values the static interface already requires. Validate at parsers, configuration, queues, model or tool JSON, files, workers, processes, and wire boundaries.
- Shared state has one named owner with a lifecycle; do not add module-level singletons or global caches. Registrations return their disposers, and teardown awaits quiescence (`lifecycle-review`).
- New behavior attaches through an existing extension point instead of adding a business branch to a central runtime, controller, or dispatcher.
- Prefer a maintained dependency when it genuinely deletes owned code and tests.
- Prefer symmetry for parallel values; unexplained asymmetry usually signals a missed extraction.
- When the profile enables `surfaces.ui`, `ui-ux-review` is the design and review entry point for UI changes; load its references only as needed.
- Failures are typed and structured, with a handling owner, containment, and a visible, actionable report (`error-handling`). An empty `catch` names the error and the reason, and its `try` holds one statement.

### Prose

- Comments and documentation state complete current contracts (behavior, failure, timing, ownership), not reasoning transcripts, change history, or review dialogue (`prose-standard`, `trim-cot-leakage`).
- Each fact has one home; elsewhere, link to it ([documentation standard](docs/AGENTS.md), `docs-standard`).
- Documentation accompanies every code change: a change to a documented type, configuration key, command, or behavior updates its owning page and inline contract documentation in the same change.
- Record durable decision rationale (what was chosen, what lost, and what it cost) as an [Agent Note](.agents/notes/README.md) (`agent-notes`). Mechanical and local edits are exempt.
- Record every externally perceptible breaking change in an upgrade guide in the same change (`upgrade-guide`).

### Before changing code

Read the [defensive patterns](docs/defensive-patterns/README.md) page for the artifact you are changing and any active Agent Note that owns the decision. Treat disagreement with an Agent Note as a design discussion, not as permission to ignore it.
<!-- vibe-harness:end -->
<!-- prettier-ignore-end -->
