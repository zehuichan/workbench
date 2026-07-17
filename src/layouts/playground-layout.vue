<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import '@/styles/index.scss';

defineOptions({ name: 'PlaygroundLayout' });

const router = useRouter();
const groupOrder = ['PlusTable', 'ERP 场景', 'Composables'] as const;
const navGroups = computed(() =>
  groupOrder.map((group) => ({
    name: group,
    links: router
      .getRoutes()
      .filter((route) => route.meta.group === group)
      .sort((left, right) => Number(left.meta.order) - Number(right.meta.order))
      .map((route) => ({
        to: route.path,
        label: String(route.meta.title),
      })),
  })),
);
</script>

<template>
  <div class="playground">
    <aside class="playground__nav">
      <div class="playground__brand">Component Labs</div>
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
</template>
