<script setup lang="ts">
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
  background: #f5f7fa;
  color: #303133;
}

.playground__nav {
  width: 220px;
  flex-shrink: 0;
  padding: 20px 12px;
  background: #fff;
  border-right: 1px solid #e4e7ed;
}

.playground__brand {
  font-size: 15px;
  font-weight: 600;
  margin: 0 8px 20px;
}

.playground__group + .playground__group {
  margin-top: 16px;
}

.playground__group-title {
  font-size: 12px;
  color: #909399;
  margin: 0 8px 8px;
}

.playground__link {
  display: block;
  padding: 8px 10px;
  border-radius: 6px;
  color: #606266;
  text-decoration: none;
  font-size: 13px;
  margin-bottom: 2px;
}

.playground__link:hover {
  background: #f2f6fc;
  color: #409eff;
}

.playground__link.is-active {
  background: #ecf5ff;
  color: #409eff;
  font-weight: 600;
}

.playground__main {
  flex: 1;
  min-width: 0;
  padding: 24px 28px 40px;
}
</style>
