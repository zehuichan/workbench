<script setup lang="ts">
import { ref } from 'vue';

import { ReTableNext } from '@/components';
import type { ReTableNextColumn } from '@/components/re-table-next';

interface TableRow {
  id: string;
  name: string;
  status: string;
  amount: number;
  startDate: string;
  endDate: string;
  remark: string;
  col1: string;
  col2: number;
  col3: string;
  col4: number;
  col5: string;
  col6: string;
  col7: number;
  col8: string;
  col9: number;
  col10: string;
  [key: string]: unknown;
}

function createRow(i: number): TableRow {
  const statuses = ['待开始', '进行中', '已完成'];
  return {
    id: String(i),
    name: `任务 ${i}`,
    status: statuses[i % 3],
    amount: 500 + (i % 20) * 100,
    startDate: `2025-0${(i % 9) + 1}-${String((i % 28) + 1).padStart(2, '0')}`,
    endDate: `2025-0${(i % 9) + 1}-${String((i % 28) + 15).padStart(2, '0')}`,
    remark: `备注 ${i}`,
    col1: `A${i}`,
    col2: i * 10,
    col3: `B${i}`,
    col4: i % 100,
    col5: `C${i}`,
    col6: `D${i}`,
    col7: i * 2,
    col8: `E${i}`,
    col9: i % 50,
    col10: `F${i}`,
  };
}

const tableData = ref<TableRow[]>(
  Array.from({ length: 100 }, (_, i) => createRow(i + 1)),
);

const adaptiveEnabled = ref(true);

const columns: ReTableNextColumn<TableRow>[] = [
  { type: 'selection', width: 55 },
  { type: 'index', label: '#', width: 55 },
  {
    prop: 'name',
    label: '名称',
    formatter: (value) => `📋 ${value}`,
  },
  {
    prop: 'status',
    label: '状态',
  },
  {
    prop: 'amount',
    label: '金额',
    formatter: (value) => `¥${Number(value).toFixed(2)}`,
  },
  {
    prop: 'startDate',
    label: '开始日期',
  },
  {
    prop: 'endDate',
    label: '结束日期',
  },
  { prop: 'remark', label: '备注' },
  { prop: 'col1', label: '列1' },
  { prop: 'col2', label: '列2' },
  { prop: 'col3', label: '列3' },
  { prop: 'col4', label: '列4' },
  { prop: 'col5', label: '列5' },
  { prop: 'col6', label: '列6' },
  { prop: 'col7', label: '列7' },
  { prop: 'col8', label: '列8' },
  { prop: 'col9', label: '列9' },
  { prop: 'col10', label: '列10' },
];
</script>

<template>
  <div class="re-table-next-demo">
    <div class="demo-header">
      <h2 class="title">ReTableNext 基础演示</h2>
      <p class="desc">
        基于 el-table 的增强表格组件。阶段 0：基础渲染（斑马纹、边框、对齐） +
        自适应高度。
      </p>
    </div>

    <div class="toolbar">
      <el-space wrap>
        <span class="label">自适应高度：</span>
        <el-switch v-model="adaptiveEnabled" />
        <span class="hint">（开启后表格高度自动填满剩余视口）</span>
      </el-space>
    </div>

    <ReTableNext
      :columns="columns"
      :data="tableData"
      :adaptive="adaptiveEnabled"
    >
      <template #cell-status="{ row }">
        <el-tag
          :type="
            row.status === '已完成'
              ? 'success'
              : row.status === '进行中'
                ? 'warning'
                : 'info'
          "
          size="small"
        >
          {{ row.status }}
        </el-tag>
      </template>
    </ReTableNext>
  </div>
</template>

<style scoped lang="scss">
.re-table-next-demo {
  padding: 16px;
  background: var(--el-bg-color);
  border-radius: 8px;
}

.demo-header {
  margin-bottom: 16px;

  .title {
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 600;
  }

  .desc {
    margin: 0;
    color: var(--el-text-color-secondary);
    font-size: 13px;
  }
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 12px;
  margin-bottom: 12px;
  background: var(--el-fill-color-light);
  border-radius: 6px;

  .label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .hint {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }
}
</style>
