<script setup lang="ts">
import '@/styles/demo-docs.css';

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

<style scoped>
.playground {
  display: flex;
  min-height: 100vh;
  background: var(--demo-bg, #f5f7fa);
  color: var(--demo-text, #303133);
}

.playground__nav {
  width: 240px;
  flex-shrink: 0;
  padding: 24px 16px;
  background: #fff;
  border-right: 1px solid var(--demo-border, #e4e7ed);
}

.playground__brand {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.01em;
  margin: 0 8px 28px;
  color: var(--demo-text, #303133);
}

.playground__group + .playground__group {
  margin-top: 24px;
}

.playground__group-title {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--demo-text-muted, #909399);
  margin: 0 8px 10px;
}

.playground__link {
  display: block;
  padding: 9px 12px;
  border-radius: 4px;
  color: var(--demo-text-secondary, #606266);
  text-decoration: none;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 2px;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.playground__link:hover {
  background: var(--demo-primary-soft, #ecf5ff);
  color: var(--demo-primary, #409eff);
}

.playground__link.is-active {
  background: var(--demo-primary-soft, #ecf5ff);
  color: var(--demo-primary, #409eff);
  font-weight: 600;
}

.playground__main {
  flex: 1;
  min-width: 0;
  padding: 32px 40px 64px;
}
</style>
