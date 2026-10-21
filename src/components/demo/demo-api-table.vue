<script setup lang="ts">
defineOptions({ name: 'DemoApiTable' });

withDefaults(
  defineProps<{
    headers?: readonly string[];
    title: string;
  }>(),
  { headers: () => ['名称', '类型', '说明'] },
);
</script>

<template>
  <h2 class="demo__api-title">{{ title }}</h2>
  <table class="demo__table">
    <thead>
      <tr>
        <th v-for="header in headers" :key="header">{{ header }}</th>
      </tr>
    </thead>
    <tbody>
      <slot></slot>
    </tbody>
  </table>
</template>
