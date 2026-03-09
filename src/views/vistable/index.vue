<script setup lang="ts">
import { ref } from 'vue'

import { ElSwitch } from 'element-plus'

import { VTablePlus } from '@/components'

const adaptive = ref(true)
</script>

<template>
  <div class="flex h-screen flex-col p-4">
    <div class="mb-4 flex shrink-0 items-center justify-between">
      <div>
        <h1 class="text-lg font-semibold">VTable 基础 Demo（阶段 0）</h1>
        <p class="mt-1 text-sm text-gray-500">
          1000 行 × 5 列，Canvas 渲染；开启 adaptive 时表格填满容器
        </p>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm">adaptive</span>
        <el-switch v-model="adaptive" />
      </div>
    </div>

    <div class="min-h-0 flex-1 rounded border border-gray-200 bg-white p-2">
      <VTablePlus
        :adaptive="adaptive"
        :width="800"
        :height="500"
        class="h-full w-full"
      />
    </div>
  </div>
</template>
