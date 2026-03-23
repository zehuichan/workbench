<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const isDocs = computed(() => route.name === 'plus-table-docs');
const isDemo = computed(() => route.name === 'plus-table-demo');
</script>

<template>
  <nav class="plus-table-subnav" aria-label="PlusTable 页面导航">
    <router-link
      class="link"
      :class="{ 'is-active': isDocs }"
      :to="{ name: 'plus-table-docs' }"
    >
      文档
    </router-link>
    <span class="sep" aria-hidden="true">·</span>
    <router-link
      class="link"
      :class="{ 'is-active': isDemo }"
      :to="{ name: 'plus-table-demo' }"
    >
      示例
    </router-link>
  </nav>
</template>

<style scoped lang="scss">
.plus-table-subnav {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
  font-size: 14px;

  .sep {
    color: var(--el-text-color-placeholder);
    user-select: none;
  }

  .link {
    color: var(--el-text-color-secondary);
    text-decoration: none;
    font-weight: 500;
    padding: 4px 0;
    border-bottom: 2px solid transparent;
    transition: color 0.15s ease;

    &:hover {
      color: var(--el-color-primary);
    }

    &.is-active {
      color: var(--el-color-primary);
      border-bottom-color: var(--el-color-primary);
    }
  }
}
</style>
