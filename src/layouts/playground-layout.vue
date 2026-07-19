<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import '@/styles/index.scss';

defineOptions({ name: 'PlaygroundLayout' });

type CategoryKey = 'components' | 'composables' | 'packages';

interface CategoryConfig {
  key: CategoryKey;
  groups: readonly string[];
}

const categories: readonly CategoryConfig[] = [
  { key: 'components', groups: ['PlusTable', 'ERP 场景'] },
  { key: 'composables', groups: ['Form', 'WeChat'] },
  { key: 'packages', groups: [] },
];

const route = useRoute();
const router = useRouter();
const activeCategory = ref<CategoryKey>('components');

function groupRoutes(group: string) {
  return router
    .getRoutes()
    .filter((item) => item.meta.group === group)
    .sort((left, right) => Number(left.meta.order) - Number(right.meta.order));
}

function categoryForGroup(group: unknown): CategoryKey | undefined {
  if (typeof group !== 'string') return undefined;
  return categories.find((category) => category.groups.includes(group))?.key;
}

const navGroups = computed(() => {
  const groups =
    categories.find((category) => category.key === activeCategory.value)
      ?.groups ?? [];

  return groups.map((group) => ({
    name: group,
    links: groupRoutes(group).map((item) => ({
      to: item.path,
      label: String(item.meta.title),
    })),
  }));
});

watch(
  () => route.meta.group,
  (group) => {
    const category = categoryForGroup(group);
    if (category) activeCategory.value = category;
  },
  { immediate: true },
);

function selectCategory(category: CategoryConfig): void {
  const firstRoute = category.groups.flatMap(groupRoutes)[0];
  if (!firstRoute) return;

  activeCategory.value = category.key;
  if (route.path !== firstRoute.path) void router.push(firstRoute.path);
}
</script>

<template>
  <div class="playground">
    <header class="playground__header">
      <div class="playground__brand">Workbench</div>
      <nav class="playground__categories" aria-label="Playground categories">
        <button
          v-for="category in categories"
          :key="category.key"
          type="button"
          class="playground__category"
          :class="{ 'is-active': activeCategory === category.key }"
          :aria-current="activeCategory === category.key ? 'page' : undefined"
          :disabled="category.groups.length === 0"
          @click="selectCategory(category)"
        >
          {{ category.key }}
        </button>
      </nav>
    </header>

    <div class="playground__body">
      <aside class="playground__nav">
        <div
          v-for="group in navGroups"
          :key="group.name"
          class="playground__group"
        >
          <div class="playground__group-title">{{ group.name }}</div>
          <router-link
            v-for="link in group.links"
            :key="link.to"
            class="playground__link"
            active-class="is-active"
            :to="link.to"
          >
            {{ link.label }}
          </router-link>
        </div>
      </aside>
      <main class="playground__main">
        <router-view />
      </main>
    </div>
  </div>
</template>
