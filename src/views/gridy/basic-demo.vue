<script setup lang="ts">
import { ref } from 'vue';
import { ElButton, ElMessage } from 'element-plus';
import DemoApiTable from '@/components/demo/demo-api-table.vue';
import DemoBlock from '@/components/demo/demo-block.vue';
import DemoPage from '@/components/demo/demo-page.vue';
import { Gridy, type GridyColumn, type GridyExposed } from '@/components/gridy';

defineOptions({ name: 'GridyBasicDemo' });

interface Row {
  amount: number;
  dueDate: string;
  enabled: boolean;
  id: number;
  name: string;
  status: string;
}

const gridRef = ref<GridyExposed>();
const nextId = ref(4);

const data = ref<Row[]>([
  {
    amount: 1200,
    dueDate: '2026-07-20',
    enabled: true,
    id: 1,
    name: '需求评审',
    status: 'todo',
  },
  {
    amount: 3400,
    dueDate: '2026-07-25',
    enabled: true,
    id: 2,
    name: '接口开发',
    status: 'doing',
  },
  {
    amount: 800,
    dueDate: '2026-07-30',
    enabled: false,
    id: 3,
    name: '联调测试',
    status: 'done',
  },
]);

const statusOptions = [
  { label: '待办', value: 'todo' },
  { label: '进行中', value: 'doing' },
  { label: '完成', value: 'done' },
];

const columns: GridyColumn[] = [
  { type: 'selection', width: 48 },
  { type: 'index', width: 56 },
  {
    component: 'input',
    field: 'name',
    rules: 'required',
    title: '名称',
    width: 160,
  },
  {
    align: 'right',
    component: 'input-number',
    componentProps: { min: 0, step: 100 },
    field: 'amount',
    formatter: ({ value }) => `¥ ${Number(value ?? 0).toLocaleString('zh-CN')}`,
    summary: ({ values }) =>
      values.reduce<number>((total, value) => total + (Number(value) || 0), 0),
    title: '金额',
    width: 140,
  },
  {
    component: 'select',
    componentProps: { options: statusOptions, clearable: true },
    field: 'status',
    rules: 'selectRequired',
    title: '状态',
    width: 140,
  },
  {
    component: 'date-picker',
    componentProps: { type: 'date', valueFormat: 'YYYY-MM-DD' },
    field: 'dueDate',
    title: '截止日期',
    width: 168,
  },
  {
    align: 'center',
    component: 'switch',
    field: 'enabled',
    title: '启用',
    width: 80,
  },
  { type: 'action', width: 88 },
];

function createRow(): Row {
  const id = nextId.value++;
  return {
    amount: 0,
    dueDate: '',
    enabled: true,
    id,
    name: '',
    status: '',
  };
}

async function validateAll() {
  const result = await gridRef.value?.validate();
  if (!result) return;
  if (result.valid) {
    ElMessage.success('校验通过');
  } else {
    ElMessage.warning(`有 ${Object.keys(result.errors).length} 处错误`);
  }
}
</script>

<template>
  <DemoPage width="wide">
    <template #description>
      单元格常驻 Element Plus 编辑控件：<code>input</code> / <code>input-number</code> /
      <code>select</code> / <code>date-picker</code> /
      <code>switch</code>。底部可添加行，操作列默认删除，金额列带合计。
    </template>

    <template #api>
      <DemoApiTable title="Gridy Props（本页用到）">
        <tr>
          <td><code>v-model</code></td>
          <td><code>GridyRecord[]</code></td>
          <td>行数据；单元格写入走 <code>change</code>。</td>
        </tr>
        <tr>
          <td><code>columns</code></td>
          <td><code>GridyColumn[]</code></td>
          <td>选择 / 序号 / 数据列 / 操作列。</td>
        </tr>
        <tr>
          <td><code>create-row</code></td>
          <td><code>() =&gt; GridyRecord</code></td>
          <td>新增行的默认值。</td>
        </tr>
        <tr>
          <td><code>row-key</code></td>
          <td><code>string</code></td>
          <td>本页用 <code>id</code>。</td>
        </tr>
      </DemoApiTable>
    </template>

    <DemoBlock>
      <template #hint> 名称、状态为空时点「校验」会标红；hover 单元格可看错误文案。 </template>
      <Gridy
        ref="gridRef"
        v-model="data"
        bordered
        :columns="columns"
        :create-row="createRow"
        row-key="id"
        :toolbar="{ title: '任务明细' }"
      >
        <template #toolbar="{ selectedRows, removeSelected }">
          <span class="gridy-demo-title">任务明细</span>
          <ElButton
            :disabled="selectedRows.length === 0"
            size="small"
            type="danger"
            @click="removeSelected"
          >
            删除所选
          </ElButton>
          <ElButton size="small" @click="validateAll">校验</ElButton>
        </template>
      </Gridy>
    </DemoBlock>
  </DemoPage>
</template>

<style scoped>
.gridy-demo-title {
  margin-right: 8px;
  font-weight: 500;
}
</style>
