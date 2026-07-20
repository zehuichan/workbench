# Playground Sidebar Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the playground shell into a full shadcn-vue Sidebar layout with grouped side nav (always expanded) and a NavigationMenu top category bar, split across three `layouts/` files.

**Architecture:** `playground-layout.vue` owns category/route state and assembles `SidebarProvider` → `playground-sidebar.vue` + `SidebarInset` (`playground-header.vue` + `router-view`). Menu data still comes from Vue Router `meta.group` / `meta.title` / `meta.order`. Shell SCSS (`.playground*`) is removed in favor of Tailwind + sidebar tokens.

**Tech Stack:** Vue 3, Vue Router 5, shadcn-vue (reka-ui), Tailwind v4, Vitest + happy-dom, pnpm

## Global Constraints

- UI components install into `src/ui` (`components.json` `aliases.ui` → `@/ui`)
- Utils stay at `@/lib/utils` (`cn`); do not leave `cn` only under `src/utils`
- Side nav groups: always visible; no `Collapsible`
- Sidebar: `collapsible="none"`; no rail, footer, icons, dark-mode toggle
- Top categories: `NavigationMenuLink` only; no Trigger/dropdown
- Do not change `src/router/index.ts` route table unless a tiny fix is required for assembly
- Keep Element Plus + `.demo*` SCSS; only remove `.playground*` shell styles
- Package runner: `pnpm dlx shadcn-vue@latest`

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/lib/utils.ts` | Ensure `cn` exists for CLI-generated UI (restore if missing) |
| `src/ui/sidebar/*` | shadcn Sidebar primitives (CLI) |
| `src/ui/navigation-menu/*` | shadcn Navigation Menu primitives (CLI) |
| `src/layouts/playground-sidebar.vue` | Brand + grouped `SidebarMenu` links |
| `src/layouts/playground-header.vue` | Category NavigationMenu |
| `src/layouts/playground-layout.vue` | State + assemble shell |
| `src/styles/index.scss` | Delete `.playground` block only |
| `src/layouts/__tests__/playground-sidebar.test.ts` | Sidebar render / active link |
| `src/layouts/__tests__/playground-header.test.ts` | Category select / disabled |

---

### Task 1: Ensure `cn` utils + install shadcn UI

**Files:**
- Create/restore: `src/lib/utils.ts`
- Create (CLI): `src/ui/sidebar/**`, `src/ui/navigation-menu/**` (+ CLI transitive deps)
- Verify: `components.json` aliases unchanged

**Interfaces:**
- Consumes: existing `components.json` (`aliases.utils` → `@/lib/utils`, `aliases.ui` → `@/ui`)
- Produces: `export function cn(...inputs: ClassValue[]): string` at `@/lib/utils`; importable `@/ui/sidebar` and `@/ui/navigation-menu`

- [ ] **Step 1: Restore `src/lib/utils.ts` if missing**

If `src/lib/utils.ts` does not exist (e.g. working tree moved `cn` to `src/utils`), recreate:

```ts
import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

If `src/utils/util.ts` only duplicated `cn` for this move, leave unrelated cleanup out of this commit unless it blocks the CLI (YAGNI: do not refactor `src/utils` in this task unless typecheck/import fails).

- [ ] **Step 2: Install components**

Run:

```bash
pnpm dlx shadcn-vue@latest add sidebar navigation-menu
```

Expected: files under `src/ui/sidebar` and `src/ui/navigation-menu`; any required peers (button, separator, sheet, tooltip, skeleton, etc.) also under `src/ui`.

- [ ] **Step 3: Smoke-check imports**

Run:

```bash
pnpm typecheck
```

Expected: PASS (or only pre-existing unrelated errors). If `@/lib/utils` missing, fix Step 1 and re-run.

- [ ] **Step 4: Commit**

```bash
git add src/lib/utils.ts src/ui components.json package.json pnpm-lock.yaml src/styles/tailwind.css
git commit -m "$(cat <<'EOF'
feat(ui): add sidebar and navigation-menu components

EOF
)"
```

Only stage files the CLI actually touched. Do not stage unrelated dirty files.

---

### Task 2: `playground-sidebar.vue` (TDD)

**Files:**
- Create: `src/layouts/playground-sidebar.vue`
- Test: `src/layouts/__tests__/playground-sidebar.test.ts`

**Interfaces:**
- Consumes: `@/ui/sidebar` (`Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupContent`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`)
- Produces: component props:

```ts
type NavLink = { to: string; label: string }
type NavGroup = { name: string; links: NavLink[] }

defineProps<{
  groups: NavGroup[]
}>()
```

- [ ] **Step 1: Write the failing test**

Create `src/layouts/__tests__/playground-sidebar.test.ts`:

```ts
import { createApp, h, nextTick } from 'vue'
import {
  createMemoryHistory,
  createRouter,
  RouterLink,
  type Router,
} from 'vue-router'
import { afterEach, describe, expect, it } from 'vitest'
import PlaygroundSidebar from '../playground-sidebar.vue'

describe('playground-sidebar', () => {
  const mounted: Array<{ app: ReturnType<typeof createApp>; host: Element }> =
    []

  async function mountWithRouter(
    groups: { name: string; links: { to: string; label: string }[] }[],
    initialPath = '/composables/use-auto-save',
  ) {
    const router: Router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div />' } },
        {
          path: '/composables/use-auto-save',
          component: { template: '<div />' },
        },
        {
          path: '/composables/use-form-draft',
          component: { template: '<div />' },
        },
      ],
    })
    await router.push(initialPath)
    await router.isReady()

    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp({
      render: () => h(PlaygroundSidebar, { groups }),
    })
    app.use(router)
    app.component('RouterLink', RouterLink)
    app.mount(host)
    await nextTick()
    mounted.push({ app, host })
    return host
  }

  afterEach(() => {
    for (const { app, host } of mounted.splice(0)) {
      app.unmount()
      host.remove()
    }
  })

  it('renders brand, group labels, and links', async () => {
    const host = await mountWithRouter([
      {
        name: 'Form',
        links: [
          { to: '/composables/use-auto-save', label: 'use-auto-save' },
          { to: '/composables/use-form-draft', label: 'use-form-draft' },
        ],
      },
    ])

    expect(host.textContent).toContain('Workbench')
    expect(host.textContent).toContain('Form')
    expect(host.textContent).toContain('use-auto-save')
    expect(host.textContent).toContain('use-form-draft')
  })

  it('marks the current route link active', async () => {
    const host = await mountWithRouter(
      [
        {
          name: 'Form',
          links: [
            { to: '/composables/use-auto-save', label: 'use-auto-save' },
            { to: '/composables/use-form-draft', label: 'use-form-draft' },
          ],
        },
      ],
      '/composables/use-auto-save',
    )

    const active = host.querySelector('[data-active="true"], [data-state="active"], .is-active, a.router-link-active')
    expect(active?.textContent).toContain('use-auto-save')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm test src/layouts/__tests__/playground-sidebar.test.ts
```

Expected: FAIL (module not found or component missing).

- [ ] **Step 3: Implement `playground-sidebar.vue`**

```vue
<script setup lang="ts">
import { useRoute } from 'vue-router'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/ui/sidebar'

defineOptions({ name: 'PlaygroundSidebar' })

export interface PlaygroundNavLink {
  to: string
  label: string
}

export interface PlaygroundNavGroup {
  name: string
  links: PlaygroundNavLink[]
}

defineProps<{
  groups: PlaygroundNavGroup[]
}>()

const route = useRoute()
</script>

<template>
  <Sidebar collapsible="none" class="h-svh border-r">
    <SidebarHeader class="px-4 py-3">
      <div class="text-sm font-bold tracking-tight">Workbench</div>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup v-for="group in groups" :key="group.name">
        <SidebarGroupLabel>{{ group.name }}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="link in group.links" :key="link.to">
              <SidebarMenuButton
                as-child
                :is-active="route.path === link.to"
              >
                <RouterLink :to="link.to">
                  <span>{{ link.label }}</span>
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
</template>
```

Adjust active-attribute assertion in the test if the installed `SidebarMenuButton` uses a different active marker (`data-active`, `aria-current`, etc.) — match the real DOM from the installed component.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
pnpm test src/layouts/__tests__/playground-sidebar.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/layouts/playground-sidebar.vue src/layouts/__tests__/playground-sidebar.test.ts
git commit -m "$(cat <<'EOF'
feat(layouts): add playground sidebar with grouped menu

EOF
)"
```

---

### Task 3: `playground-header.vue` (TDD)

**Files:**
- Create: `src/layouts/playground-header.vue`
- Test: `src/layouts/__tests__/playground-header.test.ts`

**Interfaces:**
- Consumes: `@/ui/navigation-menu`
- Produces:

```ts
defineProps<{
  categories: { key: string; groups: readonly string[] }[]
  activeCategory: string
}>()

const emit = defineEmits<{
  select: [key: string]
}>()
```

- [ ] **Step 1: Write the failing test**

Create `src/layouts/__tests__/playground-header.test.ts`:

```ts
import { createApp, h, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import PlaygroundHeader from '../playground-header.vue'

describe('playground-header', () => {
  const mounted: Array<{ app: ReturnType<typeof createApp>; host: Element }> =
    []

  async function mountHeader(
    props: {
      categories: { key: string; groups: readonly string[] }[]
      activeCategory: string
    },
    onSelect = vi.fn(),
  ) {
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp({
      render: () =>
        h(PlaygroundHeader, {
          ...props,
          onSelect: (key: string) => onSelect(key),
        }),
    })
    app.mount(host)
    await nextTick()
    mounted.push({ app, host })
    return { host, onSelect }
  }

  afterEach(() => {
    for (const { app, host } of mounted.splice(0)) {
      app.unmount()
      host.remove()
    }
  })

  const categories = [
    { key: 'components', groups: ['PlusTable'] },
    { key: 'composables', groups: ['Form'] },
    { key: 'packages', groups: [] as string[] },
  ] as const

  it('renders category labels', async () => {
    const { host } = await mountHeader({
      categories: [...categories],
      activeCategory: 'composables',
    })
    expect(host.textContent).toContain('components')
    expect(host.textContent).toContain('composables')
    expect(host.textContent).toContain('packages')
  })

  it('emits select when an enabled category is clicked', async () => {
    const { host, onSelect } = await mountHeader({
      categories: [...categories],
      activeCategory: 'composables',
    })
    const buttons = [...host.querySelectorAll('button, a')].filter((el) =>
      el.textContent?.includes('components'),
    )
    expect(buttons[0]).toBeTruthy()
    ;(buttons[0] as HTMLElement).click()
    await nextTick()
    expect(onSelect).toHaveBeenCalledWith('components')
  })

  it('does not emit select for empty-groups category', async () => {
    const { host, onSelect } = await mountHeader({
      categories: [...categories],
      activeCategory: 'composables',
    })
    const packagesEl = [...host.querySelectorAll('button, a')].find((el) =>
      el.textContent?.includes('packages'),
    ) as HTMLElement | undefined
    expect(packagesEl).toBeTruthy()
    packagesEl!.click()
    await nextTick()
    expect(onSelect).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm test src/layouts/__tests__/playground-header.test.ts
```

Expected: FAIL (module not found).

- [ ] **Step 3: Implement `playground-header.vue`**

```vue
<script setup lang="ts">
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/ui/navigation-menu'
import { cn } from '@/lib/utils'

defineOptions({ name: 'PlaygroundHeader' })

const props = defineProps<{
  categories: { key: string; groups: readonly string[] }[]
  activeCategory: string
}>()

const emit = defineEmits<{
  select: [key: string]
}>()

function onSelect(key: string, disabled: boolean) {
  if (disabled) return
  emit('select', key)
}
</script>

<template>
  <header
    class="flex h-14 shrink-0 items-center border-b bg-background px-4"
  >
    <NavigationMenu :viewport="false" class="max-w-none">
      <NavigationMenuList class="gap-6">
        <NavigationMenuItem
          v-for="category in categories"
          :key="category.key"
        >
          <NavigationMenuLink
            as-child
            :class="
              cn(
                navigationMenuTriggerStyle(),
                'cursor-pointer bg-transparent',
                activeCategory === category.key && 'text-primary',
                category.groups.length === 0 &&
                  'pointer-events-none opacity-50',
              )
            "
            :data-active="activeCategory === category.key || undefined"
            :aria-current="
              activeCategory === category.key ? 'page' : undefined
            "
            :aria-disabled="category.groups.length === 0 || undefined"
          >
            <button
              type="button"
              :disabled="category.groups.length === 0"
              @click="onSelect(category.key, category.groups.length === 0)"
            >
              {{ category.key }}
            </button>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  </header>
</template>
```

If `as-child` + `button` composition fails with the installed reka API, keep the button as the interactive element and apply `navigationMenuTriggerStyle()` directly on it (same behavior, still no dropdown).

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
pnpm test src/layouts/__tests__/playground-header.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/layouts/playground-header.vue src/layouts/__tests__/playground-header.test.ts
git commit -m "$(cat <<'EOF'
feat(layouts): add playground header navigation menu

EOF
)"
```

---

### Task 4: Assemble `playground-layout.vue` + remove shell SCSS

**Files:**
- Modify: `src/layouts/playground-layout.vue`
- Modify: `src/styles/index.scss` (delete `.playground { ... }` block through its closing `}` before `// Block: demo`)
- Keep: router logic already in layout (`categories`, `navGroups`, `selectCategory`, watch)

**Interfaces:**
- Consumes: `PlaygroundSidebar` props `groups`; `PlaygroundHeader` props `categories` / `activeCategory` and `@select`
- Produces: full-page shell wrapping `<router-view />`

- [ ] **Step 1: Rewrite `playground-layout.vue` template/script imports**

Keep the existing script logic for categories and routes; replace template and add imports:

```vue
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SidebarInset, SidebarProvider } from '@/ui/sidebar'
import PlaygroundHeader from './playground-header.vue'
import PlaygroundSidebar from './playground-sidebar.vue'
import '@/styles/index.scss'

defineOptions({ name: 'PlaygroundLayout' })

type CategoryKey = 'components' | 'composables' | 'packages'

interface CategoryConfig {
  key: CategoryKey
  groups: readonly string[]
}

const categories: readonly CategoryConfig[] = [
  { key: 'components', groups: ['PlusTable', 'ERP 场景'] },
  { key: 'composables', groups: ['Form', 'WeChat'] },
  { key: 'packages', groups: [] },
]

const route = useRoute()
const router = useRouter()
const activeCategory = ref<CategoryKey>('components')

function groupRoutes(group: string) {
  return router
    .getRoutes()
    .filter((item) => item.meta.group === group)
    .sort((left, right) => Number(left.meta.order) - Number(right.meta.order))
}

function categoryForGroup(group: unknown): CategoryKey | undefined {
  if (typeof group !== 'string') return undefined
  return categories.find((category) => category.groups.includes(group))?.key
}

const navGroups = computed(() => {
  const groups =
    categories.find((category) => category.key === activeCategory.value)
      ?.groups ?? []

  return groups.map((group) => ({
    name: group,
    links: groupRoutes(group).map((item) => ({
      to: item.path,
      label: String(item.meta.title),
    })),
  }))
})

watch(
  () => route.meta.group,
  (group) => {
    const category = categoryForGroup(group)
    if (category) activeCategory.value = category
  },
  { immediate: true },
)

function selectCategory(key: string): void {
  const category = categories.find((item) => item.key === key)
  if (!category) return

  const firstRoute = category.groups.flatMap(groupRoutes)[0]
  if (!firstRoute) return

  activeCategory.value = category.key
  if (route.path !== firstRoute.path) void router.push(firstRoute.path)
}
</script>

<template>
  <SidebarProvider class="min-h-svh">
    <PlaygroundSidebar :groups="navGroups" />
    <SidebarInset class="min-w-0">
      <PlaygroundHeader
        :categories="[...categories]"
        :active-category="activeCategory"
        @select="selectCategory"
      />
      <main class="min-h-0 flex-1 overflow-auto px-10 pt-8 pb-16">
        <router-view />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
```

- [ ] **Step 2: Remove `.playground` SCSS block**

In `src/styles/index.scss`, delete the entire block starting at `// Block: playground (shell)` through the closing `}` of `.playground` (immediately before `// Block: demo`). Leave `.demo` and everything after unchanged.

Also remove `import '@/styles/index.scss'` from layout only if demo pages no longer need shell tokens — **keep the import** because demo pages still depend on `.demo*` rules loaded via layout today.

- [ ] **Step 3: Typecheck + targeted tests**

Run:

```bash
pnpm typecheck
pnpm test src/layouts/__tests__/playground-sidebar.test.ts src/layouts/__tests__/playground-header.test.ts
```

Expected: all PASS.

- [ ] **Step 4: Manual smoke (dev server)**

With `pnpm dev` running, verify:

1. `/plus-table/basic-editing` — left groups PlusTable / ERP 场景; top `components` active
2. Click `composables` — navigates to first Form demo; left shows Form / WeChat groups, always expanded
3. Active link highlights current page
4. `packages` is disabled / non-navigating
5. No expand/collapse controls on groups

- [ ] **Step 5: Commit**

```bash
git add src/layouts/playground-layout.vue src/styles/index.scss
git commit -m "$(cat <<'EOF'
refactor(layouts): assemble playground shell with sidebar provider

EOF
)"
```

---

## Spec Coverage Check

| Spec requirement | Task |
|------------------|------|
| Full Sidebar shell (`Provider` + `Sidebar` + `Inset`) | 4 |
| Grouped menu, no Collapsible | 2 |
| `collapsible="none"` | 2 |
| Top NavigationMenu, no dropdown | 3 |
| Files under `layouts/` peer assembly | 2, 3, 4 |
| Keep meta.group / selectCategory logic | 4 |
| Install sidebar + navigation-menu into `src/ui` | 1 |
| Remove `.playground*` SCSS | 4 |
| typecheck + browsable routes | 4 |

## Placeholder / Consistency Review

- Prop names aligned: `groups`, `categories`, `activeCategory`, emit `select`
- Import alias `@/ui/*` matches `components.json`
- No TBD / TODO left in steps
