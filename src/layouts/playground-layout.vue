<script setup lang="ts">
import '@/styles/index.scss';

defineOptions({ name: 'PlaygroundLayout' });

const plusTableLinks = [
  { to: '/plus-table/basic-editing', label: '基础编辑' },
  { to: '/plus-table/dependencies-validation', label: '联动与校验' },
  { to: '/plus-table/history-dirty', label: '历史与脏追踪' },
  { to: '/plus-table/pagination-rows', label: '分页与行操作' },
] as const;

const composablesLinks = [
  { to: '/composables/use-auto-save', label: 'useAutoSave' },
  { to: '/composables/use-form-draft', label: 'useFormDraft' },
  { to: '/composables/use-save-hotkey', label: 'useSaveHotkey' },
] as const;
</script>

<template>
  <div class="playground">
    <aside class="playground__nav">
      <div class="playground__brand">Component Labs</div>
      <div class="playground__group">
        <div class="playground__group-title">PlusTable</div>
        <router-link
          v-for="link in plusTableLinks"
          :key="link.to"
          class="playground__link"
          active-class="is-active"
          :to="link.to"
        >
          {{ link.label }}
        </router-link>
      </div>
      <div class="playground__group">
        <div class="playground__group-title">Composables</div>
        <router-link
          v-for="link in composablesLinks"
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
