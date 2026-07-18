<script setup lang="ts">
import DemoApiTable from '@/components/demo/demo-api-table.vue';
import DemoPage from '@/components/demo/demo-page.vue';

defineOptions({ name: 'ApiOverviewDemo' });
</script>

<template>
  <DemoPage width="wide">
    <template #description>stub</template>
    <template #api>
      <DemoApiTable title="Props">
        <tr>
          <td><code>data</code></td>
          <td><code>T[]</code></td>
          <td>stub</td>
        </tr>
      </DemoApiTable>
    </template>
  </DemoPage>
</template>
