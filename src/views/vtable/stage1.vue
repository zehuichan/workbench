<script setup lang="ts">
import { ref } from 'vue'

import { ElSwitch } from 'element-plus'

import { VTablePlus } from '@/components'
import type { VTablePlusColumn } from '@/components/vtable'

interface StageRow {
  id: number
  name: string
  status: string
  amount: number
  department: string
}

const columns: VTablePlusColumn<StageRow>[] = [
  { prop: 'id', label: 'ID', width: 80, sortable: true },
  { prop: 'name', label: '任务名称', width: 200 },
  { prop: 'status', label: '状态', width: 100, sortable: true },
  { prop: 'amount', label: '金额', width: 100 },
  { prop: 'department', label: '部门', width: 120 },
]

const tableData = ref<StageRow[]>(
  Array.from({ length: 500 }, (_, i) => ({
    id: i + 1,
    name: `任务 ${i + 1}`,
    status: ['待开始', '进行中', '已完成'][i % 3]!,
    amount: 1000 + (i % 20) * 500,
    department: ['技术部', '产品部', '设计部'][i % 3]!,
  })),
)

const adaptive = ref(true)
</script>

<template>
  <div class="flex h-screen flex-col p-4">
    <div class="mb-4 flex shrink-0 items-center justify-between">
      <div>
        <h1 class="text-lg font-semibold">VTable 配置适配 Demo（阶段 1）</h1>
        <p class="mt-1 text-sm text-gray-500">
          columns + data 驱动，与 PlusTable 用法一致
        </p>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm">adaptive</span>
        <el-switch v-model="adaptive" />
      </div>
    </div>

    <div class="min-h-0 flex-1 rounded border border-gray-200 bg-white p-2">
      <VTablePlus
        :columns="columns"
        :data="tableData"
        :adaptive="adaptive"
        :width="800"
        :height="500"
        class="h-full w-full"
      />
    </div>
  </div>
</template>
