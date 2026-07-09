# Design: Flatten monorepo into a Vue 3 + Vite 8 app

Date: 2026-07-09  
Status: Approved

## Goal

Remove Turborepo and the pnpm workspace monorepo. Convert `component-labs` into a single Vue 3 + Vite 8 application. Keep PlusTable source under `src/components/plus-table`. Delete `docs/` and `playground/` as separate packages/directories.

## Non-goals

- Publishing PlusTable as an npm library (`build.lib`)
- Keeping VitePress documentation
- Keeping a separate playground package
- Preserving `pnpm catalog:` / workspace protocol

## Target layout

```text
component-labs/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── .prettierrc.js
├── scripts/clean.mjs
├── public/
├── README.md
└── src/
    ├── main.ts
    ├── App.vue
    ├── env.d.ts
    └── components/
        └── plus-table/          # former packages/plus-table/src/*
            ├── index.ts
            ├── table.vue
            ├── store/
            ├── table/
            ├── table-cell/
            ├── table-column/
            ├── editors/
            ├── column-settings/
            ├── styles/
            ├── tokens.ts
            └── util.ts
```

## Removals

- `turbo.json`, `.turbo/`, root `turbo` dependency
- `pnpm-workspace.yaml` (packages + catalog + rolldown-vite override)
- `docs/` (VitePress site)
- `playground/` (after promoting its app entry to root)
- `packages/` (after moving PlusTable source)
- Docs-only deps: `vitepress`, `hucre`, `immer`, `shiki`, `oxc-minify`
- `.github/workflows/deploy.yml` docs deploy (or delete the workflow)

## Dependencies

Single root `package.json`:

- **dependencies:** `vue`, `element-plus`, `@vue/shared`, `@vueuse/core`, `async-validator`, `es-toolkit`
- **devDependencies:** `vite@8`, `@vitejs/plugin-vue`, `typescript`, `vue-tsc`, `sass`, `prettier`, `@vue/tsconfig`, `@types/node`
- Pin versions directly (no `catalog:`, no `workspace:*`)
- Use official Vite 8 (drop `rolldown-vite` override)

## Scripts

| Script | Command |
|--------|---------|
| `dev` | `vite` |
| `build` | `vue-tsc -b && vite build` |
| `preview` | `vite preview` |
| `typecheck` | `vue-tsc --noEmit -p tsconfig.app.json` |
| `format` / `format:check` | Prettier (unchanged intent) |
| `clean` / `reinstall` | `scripts/clean.mjs` without `.turbo` targets |

## Tooling config

- `vite.config.ts`: `@vitejs/plugin-vue`, alias `@` → `src`, `server.port = 8000`
- TypeScript: standard Vue app split (`tsconfig.json` references `app` + `node`)
- Import rewrite: `@labs/plus-table` → `@/components/plus-table`
- `.gitignore`: remove Turborepo / VitePress entries that no longer apply
- `README.md`: describe single-app workflow

## Migration steps

1. Create `src/`; move playground app files (`main.ts`, `App.vue`, `env.d.ts`) to `src/`
2. Move `packages/plus-table/src/*` → `src/components/plus-table/`
3. Promote `playground/index.html` to repo root; add root `vite.config.ts`
4. Rewrite root `package.json` and `tsconfig*`; delete workspace/turbo configs
5. Update imports from `@labs/plus-table` to `@/components/plus-table`
6. Delete `docs/`, `playground/`, `packages/`; update clean script, gitignore, README, CI
7. Reinstall (`pnpm install`) and verify scripts

## Acceptance criteria

- `pnpm install` succeeds with a single package (no workspace packages)
- No `turbo`, `pnpm-workspace.yaml`, `docs/`, `playground/`, or `packages/` remain
- `pnpm dev` serves the app and renders PlusTable
- `pnpm typecheck` and `pnpm build` succeed

## Risks / notes

- GitHub Pages docs deploy will stop; intentional because docs are removed
- Internal relative imports inside PlusTable should keep working if the directory tree is moved intact
- After lockfile regeneration, review that Vite resolves to official `vite@8`, not `rolldown-vite`
