<script setup lang="ts">
import { ref, computed, unref } from 'vue'
import { ElMessage } from 'element-plus'

import { ReTable } from '@/components'
import type { ReTableColumn } from '@/components/re-table'
import type { RuleItem } from 'async-validator'

type EditableMode = boolean | 'row' | 'cell' | 'manual'
type ValidateTrigger = 'change' | 'blur' | 'manual'

interface TableRow {
  id: string
  name: string
  status: string
  amount: number
  startDate: string
  endDate: string
  remark: string
  col1: string
  col2: number
  col3: string
  col4: number
  col5: string
  col6: string
  col7: number
  col8: string
  col9: number
  col10: string
  col11: string
  col12: number
  [key: string]: unknown
}

function createRow(i: number): TableRow {
  const statuses = ['待开始', '进行中', '已完成']
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
    col11: `G${i}`,
    col12: i * 3,
  }
}

const tableRef = ref<InstanceType<typeof ReTable> | null>(null)
const editable = ref<EditableMode>('cell')
const validateTrigger = ref<ValidateTrigger>('change')
const validateOnCellExit = ref(true)

// 300 行、20 列（含 selection、index）用于 Performance 面板测试
const tableData = ref<TableRow[]>(
  Array.from({ length: 30 }, (_, i) => createRow(i + 1)),
)

const statusOptions = [
  { label: '待开始', value: '待开始' },
  { label: '进行中', value: '进行中' },
  { label: '已完成', value: '已完成' },
]

const tableRules = computed<Record<string, RuleItem | RuleItem[]>>(() => ({
  name: [
    { required: true, message: '名称为必填项', trigger: 'change' },
    { min: 2, max: 50, message: '名称长度为 2-50 个字符', trigger: 'change' },
  ],
}))

const columns: ReTableColumn[] = [
  { type: 'selection', width: 55 },
  { type: 'index', label: '#', width: 55 },
  {
    prop: 'name',
    label: '名称',
    required: true,
    component: 'Input',
    tooltip: '任务名称，支持编辑',
    cellClassName: (scope) =>
      scope.row.status === '已完成' ? 're-table-cell--done' : '',
    rules: [
      { required: true, message: '名称不能为空', trigger: 'change' },
      { min: 2, max: 50, message: '名称需 2-50 字符', trigger: 'change' },
    ],
  },
  {
    prop: 'status',
    label: '状态',
    required: true,
    component: 'Select',
    componentProps: { options: statusOptions },
    rules: [{ required: true, message: '请选择状态', trigger: 'change' }],
  },
  {
    prop: 'amount',
    label: '金额',
    component: 'InputNumber',
    componentProps: {
      min: 0,
      precision: 2,
      style: { width: '100%' },
    },
    cellClassName: (scope) =>
      (scope.row.amount ?? 0) >= 2000 ? 're-table-cell--highlight' : '',
  },
  {
    prop: 'startDate',
    label: '开始日期',
    required: true,
    component: 'DatePicker',
    componentProps: {
      type: 'date',
      valueFormat: 'YYYY-MM-DD',
      style: { width: '100%' },
    },
    rules: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  },
  {
    prop: 'endDate',
    label: '结束日期',
    required: true,
    component: 'DatePicker',
    componentProps: {
      type: 'date',
      valueFormat: 'YYYY-MM-DD',
      style: { width: '100%' },
    },
    rules: [
      { required: true, message: '请选择结束日期', trigger: 'change' },
      {
        validator: (
          _rule: any,
          value: string,
          callback: (e?: Error) => void,
          source?: Record<string, any>,
        ) => {
          const start = source?.startDate
          if (!value || !start) return callback()
          if (value <= start) {
            return callback(new Error('结束日期必须大于开始日期'))
          }
          callback()
        },
        dependencies: ['startDate'],
        trigger: 'change',
      },
    ],
  },
  { prop: 'remark', label: '备注', component: 'Input' },
  { prop: 'col1', label: '列1', width: 80 },
  { prop: 'col2', label: '列2', width: 80 },
  { prop: 'col3', label: '列3', width: 80 },
  { prop: 'col4', label: '列4', width: 80 },
  { prop: 'col5', label: '列5', width: 80 },
  { prop: 'col6', label: '列6', width: 80 },
  { prop: 'col7', label: '列7', width: 80 },
  { prop: 'col8', label: '列8', width: 80 },
  { prop: 'col9', label: '列9', width: 80 },
  { prop: 'col10', label: '列10', width: 80 },
  { prop: 'col11', label: '列11', width: 80 },
  { prop: 'col12', label: '列12', width: 80 },
]

const modifiedInfo = computed(() => {
  const result = tableRef.value?.getModifiedRows?.()
  return (
    (result as {
      added: TableRow[]
      modified: TableRow[]
      deleted: TableRow[]
    }) ?? { added: [] as TableRow[], modified: [] as TableRow[], deleted: [] as TableRow[] }
  )
})

const canUndo = computed(
  () => unref((tableRef.value as any)?.canUndo) ?? false,
)
const canRedo = computed(
  () => unref((tableRef.value as any)?.canRedo) ?? false,
)

const handleInsertRow = () => {
  tableRef.value?.insertRow?.(0, {
    id: `new-${Date.now()}`,
    name: '',
    status: '',
    amount: 0,
    startDate: '',
    endDate: '',
    remark: '新增行',
    col1: '',
    col2: 0,
    col3: '',
    col4: 0,
    col5: '',
    col6: '',
    col7: 0,
    col8: '',
    col9: 0,
    col10: '',
    col11: '',
    col12: 0,
  } as TableRow)
}

const handleDeleteSelected = () => {
  const rows = tableRef.value?.getSelectionRows?.() as TableRow[] | undefined
  if (!rows?.length) return
  const indices = rows
    .map((r) => tableData.value.findIndex((row) => row.id === r.id))
    .filter((i) => i >= 0)
    .sort((a, b) => b - a)
  tableRef.value?.deleteRow?.(indices)
}

const handleUndo = () => tableRef.value?.undo?.()
const handleRedo = () => tableRef.value?.redo?.()

const handleValidate = async () => {
  const result = await tableRef.value?.validate?.(true)
  if (result?.valid) {
    ElMessage.success('校验通过')
  } else {
    ElMessage.warning('存在校验错误，已定位到首个错误')
    tableRef.value?.scrollToFirstError?.()
  }
}

const handleClearValidation = () => {
  tableRef.value?.clearValidation?.()
  ElMessage.info('已清除校验错误')
}

const handleResetDirty = () => tableRef.value?.resetDirtyTracking?.()

const handleGetDirty = () => {
  const cells = tableRef.value?.getDirtyCells?.()
  ElMessage.info(`脏单元格数量：${cells?.size ?? 0}`)
}
</script>

<template>
  <el-config-provider size="small">
    <div class="re-table-demo">
      <div class="demo-header">
        <h2 class="title">ReTable 综合演示</h2>
        <p class="desc">
          编辑模式、Undo/Redo、行操作、数据校验（实时/联动）、列设置、脏追踪。F2 或双击进入编辑，Tab/Enter 确认。
        </p>
      </div>

      <div class="toolbar">
        <el-space wrap>
          <span class="label">编辑模式：</span>
          <el-button-group>
            <el-button
              v-for="mode in [false, true, 'row', 'cell', 'manual']"
              :key="String(mode)"
              :type="editable === mode ? 'primary' : 'default'"
              size="small"
              @click="editable = mode as EditableMode"
            >
              {{
                mode === false
                  ? '关闭'
                  : mode === true
                    ? '全部'
                    : mode === 'row'
                      ? '行'
                      : mode === 'cell'
                        ? '单元格'
                        : '手动'
              }}
            </el-button>
          </el-button-group>
        </el-space>

        <el-divider direction="vertical" />

        <el-space wrap>
          <span class="label">编辑历史：</span>
          <el-button size="small" :disabled="!canUndo" @click="handleUndo">
            撤销 (Ctrl+Z)
          </el-button>
          <el-button size="small" :disabled="!canRedo" @click="handleRedo">
            重做 (Ctrl+Shift+Z)
          </el-button>
        </el-space>

        <el-divider direction="vertical" />

        <el-space wrap>
          <span class="label">行操作：</span>
          <el-button size="small" type="success" @click="handleInsertRow">
            新增行
          </el-button>
          <el-button size="small" type="danger" @click="handleDeleteSelected">
            删除选中
          </el-button>
        </el-space>

        <el-divider direction="vertical" />

        <el-space wrap>
          <span class="label">校验：</span>
          <el-button-group>
            <el-button
              v-for="t in ['change', 'blur', 'manual']"
              :key="t"
              :type="validateTrigger === t ? 'primary' : 'default'"
              size="small"
              @click="validateTrigger = t as ValidateTrigger"
            >
              {{ t === 'change' ? 'change' : t === 'blur' ? 'blur' : 'manual' }}
            </el-button>
          </el-button-group>
          <el-checkbox v-model="validateOnCellExit" size="small">
            离开单元格校验
          </el-checkbox>
          <el-button size="small" type="primary" @click="handleValidate">
            校验全部
          </el-button>
          <el-button size="small" @click="tableRef?.scrollToFirstError?.()">
            定位错误
          </el-button>
          <el-button size="small" @click="handleClearValidation">
            清除校验
          </el-button>
        </el-space>

        <el-divider direction="vertical" />

        <el-space wrap>
          <span class="label">脏追踪：</span>
          <el-button size="small" @click="handleGetDirty">查看脏数量</el-button>
          <el-button size="small" @click="handleResetDirty">重置脏标记</el-button>
        </el-space>
      </div>

      <ReTable
        ref="tableRef"
        :columns="columns"
        :data="tableData"
        :rules="tableRules"
        :editable="editable"
        :validate-trigger="validateTrigger"
        :validate-on-cell-exit="validateOnCellExit"
        row-key="id"
        table-key="re-table-demo"
        :column-setting="true"
      >
        <template #append>
          <div class="append-tip">
            提示：必填列带红色星号；校验错误有红色边框，hover 查看；金额≥2000
            高亮、已完成行名称灰色；右上角齿轮可设置列
          </div>
        </template>
      </ReTable>

      <div v-if="modifiedInfo.added?.length || modifiedInfo.modified?.length || modifiedInfo.deleted?.length" class="modified-panel">
        <div v-if="modifiedInfo.added?.length" class="modified-section">
          <span class="section-label">新增：</span>
          <div
            v-for="(row, i) in modifiedInfo.added"
            :key="`added-${i}`"
            class="flat-row"
          >
            {{ [row.id, row.name, row.status, row.remark].filter(Boolean).join(' | ') }}
          </div>
        </div>
        <div v-if="modifiedInfo.modified?.length" class="modified-section">
          <span class="section-label">修改：</span>
          <div
            v-for="(row, i) in modifiedInfo.modified"
            :key="`modified-${i}`"
            class="flat-row"
          >
            {{ [row.id, row.name, row.status, row.remark].filter(Boolean).join(' | ') }}
          </div>
        </div>
        <div v-if="modifiedInfo.deleted?.length" class="modified-section">
          <span class="section-label">删除：</span>
          <div
            v-for="(row, i) in modifiedInfo.deleted"
            :key="`deleted-${i}`"
            class="flat-row"
          >
            {{ [row.id, row.name, row.status, row.remark].filter(Boolean).join(' | ') }}
          </div>
        </div>
      </div>
    </div>
  </el-config-provider>
</template>

<style scoped lang="scss">
.re-table-demo {
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
}

.append-tip {
  padding: 8px 12px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-lighter);
}

.modified-panel {
  padding: 12px;
  margin-top: 12px;
  font-size: 12px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
}

.modified-section {
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-label {
  color: var(--el-color-primary);
  font-weight: 500;
}

.flat-row {
  padding: 2px 0 2px 12px;
  line-height: 1.5;
  color: var(--el-text-color-regular);
}
</style>

<style lang="scss">
.re-table-cell--highlight {
  background-color: var(--el-color-warning-light-9) !important;
}

.re-table-cell--done {
  color: var(--el-text-color-secondary);
}
</style>
