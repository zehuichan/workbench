# AGENTS.md

Workbench is a Vue 3 + TypeScript + Vite playground for business data entry and field linkage. Read [DESIGN.md](DESIGN.md) before changing playground, brand, or theme UI. Review a non-trivial change with [workbench-code-review](.agents/skills/workbench-code-review/SKILL.md).

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
brand/                     logo and preview HTML
scripts/                   local scripts
.agents/skills/            on-demand skills
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

Match the command to the change. A composable fix runs its colocated Vitest file, and `pnpm typecheck` when types moved. A shell change also runs `src/layouts/__tests__/`. Run `pnpm typecheck` and `pnpm test` before calling a non-trivial change done. Report the commands actually run. Do not rerun a check that already passed for the same diff.

UI changes: exercise the affected route in the playground. Judgment lives in [workbench-ui-ux](.agents/skills/workbench-ui-ux/SKILL.md).

## Secrets

WeChat and WeCom demos read `VITE_WECHAT_APPID`, `VITE_WORK_WECHAT_CORP_ID`, `VITE_WORK_WECHAT_AGENT_ID`, and the `VITE_*_ENABLED` flags. Those values are option defaults only. Never commit `.env` or credentials.

## Conventions

- ESM (`"type": "module"`). Import app code through the aliases in `components.json`: `@/components`, `@/composables`, `@/ui`, `@/utils`.
- **Composable shape** for `src/composables/` and `src/utils/` is the [vueuse rule](.cursor/rules/vueuse-composables.mdc): positional required args, trailing options, `UseXxxOptions` / `UseXxxReturn`, object returns, `MaybeRefOrGetter` + `toValue`, `tryOnScopeDispose`, `ConfigurableWindow`, no import-time side effects. File names stay kebab-case (`use-auto-save/use-auto-save.ts`).
- **Field controls register once.** `initComponentAdapter()` writes `useGlobalShareState`. PlusTable resolves editors with `resolveEditor`; Filters use the same `component` ids. Do not open a second map. `input-number` stays `controls: false` so a cell can leave edit mode on blur.
- **PlusTable** renders an `el-table`. `defineColumns` returns its array unchanged. New table behavior is a composable under `src/components/plus-table/composables/`, wired in `useTable` by explicit arguments. Descendants read context only through `usePlusTable()`.
- **emit-effect.** A bare function is `{ compute }`. `compute` overwrites user edits; `default` is a suggestion the user may override. `defineEmitRules` returns its argument unchanged.
- **Two UI stacks.** Playground chrome uses `src/ui/` (shadcn-vue). Data-entry demos use Element Plus through `src/adapter`, including `ElMessage` and `ElMessageBox`. Tokens live in [DESIGN.md](DESIGN.md) and `src/styles/tailwind.css`.
- **Prefer a maintained dependency** (`@vueuse/core`, `es-toolkit`, Element Plus, Vue Router) when it deletes owned code and tests. Say in the PR why the existing library cannot do the job.
- **Trust TypeScript at typed same-process boundaries.** Do not add runtime validation solely for values the static types already require. Validate at JSON parse, `localStorage` drafts, OAuth callbacks, and WeChat or WeCom SDK payloads.
- **No new assertions to `unknown`** (`as unknown` or `<unknown>`). Narrow the type, or validate at a boundary above. Do not add a cast to keep a call compiling.
- **Closed unions** switch on their tag. The leftover case assigns to `never`.
- **Misconfiguration fails loud.** A missing required referent throws at the first point it can be known. Do not skip it.
- **An empty `catch` names the error** and why. Keep the `try` to one statement.
- **Keep comments local.** State the obligation the code cannot show. Do not restate the next line or narrate the change. Prose bans live in [workbench-code-review](.agents/skills/workbench-code-review/SKILL.md).
- **Prefer symmetry for parallel values.** An unexplained one-off usually means a shared value was missed.
- **Tests describe behavior.** Change obsolete behavior together with its tests. Do not assert private fields or call counts.
- Naming: `PascalCase` components and classes, `camelCase` functions (`useXxx`), `SCREAMING_SNAKE_CASE` only for exported config constants. Oxfmt owns semicolons, single quotes, and trailing commas (`oxfmt.config.ts`).
- Ask before deleting behavior that looks intentional.
- TODO markers: `FIXME` blocks this change, `TODO` is deferred, `XXX` is a known hazard.
- Files end with exactly one trailing newline.

## Type safety and documentation

`strict: true` in the app and node tsconfigs. Every remaining `any` says why narrowing is infeasible.

Public composable and component exports carry JSDoc for obligations the signature does not show: ownership, failure, and what `undefined` means. Composable JSDoc is English and includes `@example`.

Comments and docs state the current behavior, failure, timing, and ownership. One fact has one home: this file, the vueuse rule, `DESIGN.md`, or a skill. A decision that rejected an alternative goes in the commit or PR body, not in a comment. Details: [workbench-agent-experience](.agents/skills/workbench-agent-experience/SKILL.md).

## Testing

Vitest, happy-dom. Colocate tests in `__tests__/` or `*.test.ts` (`src/composables/__tests__/`, `src/components/plus-table/__tests__/`). Shared fixtures live under `__tests__/helpers`. Shell changes update `src/layouts/__tests__/`.

## Git

Conventional commits: `type(scope): subject`, imperative, at most 72 characters. Do not commit, push, or rewrite history unless the user asks. Do not skip hooks. Stage explicit paths.

## Agent skills

Load a skill when its description matches. Do not paste the skill back into this file.

- [workbench-code-review](.agents/skills/workbench-code-review/SKILL.md) — before calling a non-trivial change done.
- [workbench-ui-ux](.agents/skills/workbench-ui-ux/SKILL.md) — product-visible UI.
- [workbench-find-simplifications](.agents/skills/workbench-find-simplifications/SKILL.md) — dead or speculative code.
- [workbench-agent-experience](.agents/skills/workbench-agent-experience/SKILL.md) — this file, skill descriptions, public JSDoc.

Adapt a harness rule only when this repo has a place for it. Do not copy deepseek-harness `AGENTS.md` sections or `.agents/skills` that point at docs, gates, or packages this repo does not have.

## Editing these instructions

Keep each rule to a few lines and link the skill or file that holds the procedure. If a section starts repeating a skill, move the detail back.

<!-- vibe-harness:begin -->
## Working agreement (vibe-harness)

These standing orders apply to every agent session. Project facts (commands, enabled surfaces, evidence per surface) live in the [project profile](.agents/project-profile.md); reusable workflows live in [.agents/skills/](.agents/skills/). Put project-specific rules outside this managed block: `vibe-harness` upgrades rewrite only the text between its markers.

### Evidence

- Run the narrowest check that would fail for the regression you are preventing. Leave exhaustive coverage to CI unless the user asks or the change is genuinely repository-wide. Before pushing, follow `pre-push-checks`; report only commands you actually ran.
- Tests describe behavior. When behavior changes on purpose, change its tests and state why in the pull request.
- Put every mechanically checkable rule into an executed check, and prove each new or changed check rejects an invalid case.
- A change that can move the cost of a hot path carries before-and-after measurements (`perf-evidence`).

### Design

- Explicit beats implicit at module and package boundaries. Defaulting is an explicit resolve step owned by the implementation, never a hidden fallback inside the operation.
- Deployment-varying choices are validated configuration, not hardcoded constants or test hooks. Protocol constants, external specifications, and security invariants stay fixed.
- Misconfiguration fails loudly at load when it is self-contained, otherwise at the earliest point where it can be resolved. Never silently skip a missing referent.
- Trust the type system at typed same-process boundaries. Validate at parsers, configuration, queues, model or tool JSON, files, workers, processes, and wire boundaries.
- Shared state has one named owner with a lifecycle; do not add module-level singletons or global caches. Registrations return their disposers, and teardown awaits quiescence (`lifecycle-review`).
- New behavior attaches through an existing extension point instead of adding a business branch to a central runtime, controller, or dispatcher.
- Prefer a maintained dependency when it genuinely deletes owned code and tests.
- Prefer symmetry for parallel values; unexplained asymmetry usually signals a missed extraction.
- Failures are typed and structured, with a handling owner, containment, and a visible, actionable report (`error-handling`). An empty `catch` names the error and the reason, and its `try` holds one statement.

### Prose

- Comments and documentation state complete current contracts (behavior, failure, timing, ownership), not reasoning transcripts, change history, or review dialogue (`prose-standard`, `trim-cot-leakage`).
- Each fact has one home; elsewhere, link to it ([documentation standard](docs/AGENTS.md), `docs-standard`).
- Record durable decision rationale (what was chosen, what lost, and what it cost) as an [Agent Note](.agents/notes/README.md) (`agent-notes`). Mechanical and local edits are exempt.
- Record every externally perceptible breaking change in an upgrade guide in the same change (`upgrade-guide`).

### Before changing code

Read the [defensive patterns](docs/defensive-patterns/README.md) page for the artifact you are changing and any active Agent Note that owns the decision. Treat disagreement with an Agent Note as a design discussion, not as permission to ignore it.
<!-- vibe-harness:end -->
