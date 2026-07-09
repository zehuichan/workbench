# Flatten to Vue 3 + Vite 8 App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the Turborepo/pnpm monorepo into a single Vue 3 + Vite 8 application with PlusTable under `src/components/plus-table`.

**Architecture:** Promote playground app entry to repo root; move PlusTable source into `src/components/plus-table`; delete workspace packages (`docs`, `playground`, `packages`), Turbo, and pnpm catalog/workspace config.

**Tech Stack:** Vue 3, Vite 8, TypeScript, Element Plus, pnpm, Sass, Prettier

## Global Constraints

- Single root `package.json` only (no workspace packages)
- Official `vite@8` (no `rolldown-vite` override)
- Import path: `@/components/plus-table` (not `@labs/plus-table`)
- Delete `docs/`, `playground/`, `packages/` after migration
- Keep Prettier; no ESLint/Stylelint

---

### Task 1: Move source into single-app layout

**Files:**
- Create: `src/main.ts`, `src/App.vue`, `src/env.d.ts`, `src/components/plus-table/**`, `index.html`, `vite.config.ts`
- Delete after copy: `playground/`, `packages/` (Task 3)

- [ ] **Step 1: Create directories and move files**

```bash
mkdir -p src/components
cp playground/src/main.ts src/main.ts
cp playground/src/App.vue src/App.vue
cp playground/src/env.d.ts src/env.d.ts
cp -R packages/plus-table/src src/components/plus-table
cp playground/index.html index.html
```

- [ ] **Step 2: Write root `vite.config.ts`**

```ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 8000,
  },
})
```

- [ ] **Step 3: Update `src/App.vue` imports**

Replace:
```ts
import { PlusTable } from '@labs/plus-table'
import type { EditMode } from '@labs/plus-table'
```
with:
```ts
import { PlusTable } from '@/components/plus-table'
import type { EditMode } from '@/components/plus-table'
```

- [ ] **Step 4: Update `index.html` title**

Set title to `Component Labs`.

---

### Task 2: Rewrite root package and TypeScript config

**Files:**
- Modify: `package.json`, `tsconfig.json`
- Create: `tsconfig.app.json`, `tsconfig.node.json`
- Delete: `pnpm-workspace.yaml`, `turbo.json`

- [ ] **Step 1: Rewrite `package.json`**

```json
{
  "name": "component-labs",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "vue-tsc --noEmit -p tsconfig.app.json",
    "format": "prettier . --write --cache --log-level warn",
    "format:check": "prettier . --check --cache --log-level warn",
    "clean": "node ./scripts/clean.mjs",
    "reinstall": "pnpm clean --del-lock && pnpm install"
  },
  "dependencies": {
    "@vue/shared": "^3.5.30",
    "@vueuse/core": "^14.2.1",
    "async-validator": "^4.2.5",
    "element-plus": "^2.14.2",
    "es-toolkit": "^1.45.1",
    "vue": "^3.5.30"
  },
  "devDependencies": {
    "@types/node": "^25.5.0",
    "@vitejs/plugin-vue": "^6.0.5",
    "@vue/tsconfig": "^0.9.0",
    "prettier": "^3.8.1",
    "sass": "^1.98.0",
    "typescript": "~5.9.3",
    "vite": "8.0.1",
    "vue-tsc": "^3.2.6"
  },
  "engines": {
    "node": ">=20.19.0",
    "pnpm": ">=10.0.0"
  },
  "packageManager": "pnpm@10.33.4"
}
```

- [ ] **Step 2: Write TypeScript configs**

`tsconfig.json`:
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

`tsconfig.app.json`:
```json
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "strict": true,
    "noEmit": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"]
}
```

`tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 3: Delete monorepo configs**

```bash
rm -f pnpm-workspace.yaml turbo.json
```

---

### Task 3: Remove old packages and update housekeeping

**Files:**
- Delete: `docs/` (except keep `docs/superpowers/`), `playground/`, `packages/`, `.github/workflows/deploy.yml`
- Modify: `scripts/clean.mjs`, `.gitignore`, `README.md`

Note: Preserve `docs/superpowers/specs/` and `docs/superpowers/plans/` design/plan docs. Delete only the VitePress docs site content (`docs/.vitepress`, `docs/components`, `docs/libraries`, `docs/index.md`, `docs/package.json`, `docs/tsconfig.json`).

- [ ] **Step 1: Delete obsolete trees**

```bash
rm -rf playground packages
rm -rf docs/.vitepress docs/components docs/libraries docs/index.md docs/package.json docs/tsconfig.json docs/node_modules docs/.turbo
rm -f .github/workflows/deploy.yml
```

- [ ] **Step 2: Update `scripts/clean.mjs` targets**

Change targets from `['node_modules', 'dist', '.turbo', 'dist.zip']` to `['node_modules', 'dist', 'dist.zip']`.

- [ ] **Step 3: Update `.gitignore`**

Remove Turborepo and VitePress sections; keep standard Vite/Node ignores.

- [ ] **Step 4: Rewrite `README.md` for single-app usage**

Document `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm typecheck`, and `src/components/plus-table` location.

---

### Task 4: Reinstall and verify

- [ ] **Step 1: Clean install**

```bash
rm -rf node_modules pnpm-lock.yaml .turbo
pnpm install
```

Expected: install succeeds; lockfile has no `turbo` workspace packages.

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: exit 0

- [ ] **Step 3: Build**

```bash
pnpm build
```

Expected: exit 0, `dist/` produced

- [ ] **Step 4: Confirm removals**

```bash
test ! -e turbo.json && test ! -e pnpm-workspace.yaml && test ! -d playground && test ! -d packages && test ! -d docs/.vitepress
rg -n "turbo|@labs/plus-table|workspace:|catalog:" --glob '!pnpm-lock.yaml' --glob '!docs/superpowers/**' || true
```

Expected: no matches outside historical docs under `docs/superpowers/`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor!: flatten monorepo into Vue 3 + Vite 8 app"
```
