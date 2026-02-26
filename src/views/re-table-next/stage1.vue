<script setup lang="ts">
import { h, ref, VNode } from 'vue';
import { ElTag, ElProgress, TableColumnCtx } from 'element-plus';

import { ReTableNext } from '@/components';
import type { ReTableNextColumn } from '@/components/re-table-next';

// ──── 数据类型 ────

interface TaskRow {
  id: number;
  name: string;
  status: 'pending' | 'active' | 'done';
  priority: 'low' | 'medium' | 'high';
  progress: number;
  amount: number;
  assignee: string;
  department: string;
  team: string;
  startDate: string;
  endDate: string;
  remark: string;
  [key: string]: unknown;
}

// ──── 模拟数据 ────

const statusMap: Record<
  string,
  { label: string; type: 'info' | 'warning' | 'success' }
> = {
  pending: { label: '待开始', type: 'info' },
  active: { label: '进行中', type: 'warning' },
  done: { label: '已完成', type: 'success' },
};

const priorityMap: Record<string, { label: string; color: string }> = {
  high: { label: '高', color: '#F56C6C' },
  medium: { label: '中', color: '#E6A23C' },
  low: { label: '低', color: '#909399' },
};

const departments = ['技术部', '产品部', '设计部', '市场部'];
const teams = ['前端组', '后端组', 'UI组', '运营组', '增长组'];
const assignees = ['张三', '李四', '王五', '赵六', '陈七', '周八'];

function createRow(i: number): TaskRow {
  const statuses: TaskRow['status'][] = ['pending', 'active', 'done'];
  const priorities: TaskRow['priority'][] = ['low', 'medium', 'high'];
  const status = statuses[i % 3];
  return {
    id: i,
    name: `任务 ${i} — ${['需求评审', '接口开发', '联调测试', 'UI 走查', '性能优化'][i % 5]}`,
    status,
    priority: priorities[i % 3],
    progress:
      status === 'done' ? 100 : status === 'active' ? 20 + (i % 6) * 15 : 0,
    amount: 1000 + (i % 20) * 500,
    assignee: assignees[i % assignees.length],
    department: departments[i % departments.length],
    team: teams[i % teams.length],
    startDate: `2025-0${(i % 9) + 1}-${String((i % 28) + 1).padStart(2, '0')}`,
    endDate: `2025-0${(i % 9) + 1}-${String((i % 28) + 15).padStart(2, '0')}`,
    remark: `这是一段较长的备注文本，用于演示文本溢出省略功能（ellipsis）。任务 ${i} 的详细描述信息放在这里。`,
  };
}

const tableData = ref<TaskRow[]>(
  Array.from({ length: 60 }, (_, i) => createRow(i + 1)),
);

// ──── 排序状态 ────

const sortInfo = ref({ prop: '', order: '' });

function handleSortChange({ prop, order }: { prop: string; order: string }) {
  sortInfo.value = { prop: prop ?? '', order: order ?? '' };
}

// ──── 列配置 ────

const columns: ReTableNextColumn<TaskRow>[] = [
  // 1.4 — 特殊列类型
  { type: 'expand', width: 55 },
  { type: 'selection', width: 55 },
  { type: 'index', label: '#', width: 55 },

  // 1.3 — formatter
  {
    prop: 'name',
    label: '任务名称',
    sortable: true,
  },

  // 1.1 — render 函数
  {
    prop: 'status',
    label: '状态',
    sortable: true,
    render: (scope) => {
      const info = statusMap[scope.row.status] ?? {
        label: scope.row.status,
        type: 'info' as const,
      };
      return h(ElTag, { type: info.type, size: 'small' }, () => info.label);
    },
  },

  // 1.1 — render 函数 (进度条)
  {
    prop: 'progress',
    label: '进度',
    render: (scope) =>
      h(ElProgress, {
        percentage: scope.row.progress,
        status: scope.row.progress === 100 ? 'success' : undefined,
      }),
  },

  // 1.1 — render 函数 (优先级)
  {
    prop: 'priority',
    label: '优先级',
    sortable: 'custom',
    render: (scope) => {
      const info = priorityMap[scope.row.priority] ?? {
        label: scope.row.priority,
        color: '#909399',
      };
      return h(
        'span',
        {
          style: {
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#fff',
            backgroundColor: info.color,
          },
        },
        info.label,
      );
    },
  },

  // 1.3 — formatter（金额格式化）
  {
    prop: 'amount',
    label: '金额',
    sortable: true,
    formatter: (
      row: any,
      column: any,
      cellValue: any,
      index: number,
    ): VNode | string =>
      `¥${Number(cellValue).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`,
  },

  // 1.5 — 通过插槽渲染（在模板中用 #cell-assignee）
  {
    prop: 'assignee',
    label: '负责人',
  },

  // 1.10 — 多级表头
  {
    label: '组织信息',
    children: [
      { prop: 'department', label: '部门', width: 100 },
      { prop: 'team', label: '团队', width: 100 },
    ],
  },

  // 1.8 — sortable (本地排序)
  {
    prop: 'startDate',
    label: '开始日期',
    sortable: true,
  },

  // 1.2 — renderHeader (自定义表头)
  {
    prop: 'endDate',
    label: '截止日期',
    sortable: true,
    renderHeader: ({ column }) =>
      h(
        'span',
        { style: 'color: var(--el-color-danger); font-weight: 600' },
        `⏰ ${column.label}`,
      ),
  },

  // 1.6 — showOverflowTooltip 溢出省略
  {
    prop: 'remark',
    label: '备注',
    showOverflowTooltip: true,
  },
];
</script>

<template>
  <el-config-provider size="small">
    <div class="stage1-demo">
      <div class="demo-header">
        <h2 class="title">ReTableNext — 阶段 1：配置式列 + 渲染器</h2>
        <p class="desc">
          演示：render 函数、renderHeader、formatter、selection / index / expand
          列类型、 #cell-* / #header-* 插槽、showOverflowTooltip 溢出省略、align
          对齐、sortable 排序、 渲染优先级、多级表头。
        </p>
      </div>

      <div class="feature-tags">
        <el-tag size="small">1.1 render</el-tag>
        <el-tag size="small" type="success">1.2 renderHeader</el-tag>
        <el-tag size="small" type="warning">1.3 formatter</el-tag>
        <el-tag size="small" type="danger">1.4 selection/index/expand</el-tag>
        <el-tag size="small" type="info">1.5 #cell / #header 插槽</el-tag>
        <el-tag size="small">1.6 showOverflowTooltip</el-tag>
        <el-tag size="small" type="success">1.7 align</el-tag>
        <el-tag size="small" type="warning">1.8 sortable</el-tag>
        <el-tag size="small" type="danger">1.9 渲染优先级</el-tag>
        <el-tag size="small" type="info">1.10 多级表头</el-tag>
      </div>

      <ReTableNext
        :columns="columns"
        :data="tableData"
        :adaptive="true"
        @sort-change="handleSortChange"
      >
        <!-- header 插槽 -->
        <template #title>
          <div class="flex items-center gap-2">
            <span class="text-base font-semibold">任务管理</span>
            <el-tag size="small" round>{{ tableData.length }} 条</el-tag>
          </div>
        </template>
        <template #actions>
          <el-space>
            <el-button type="primary" size="small">新建任务</el-button>
          </el-space>
        </template>

        <!-- 1.5 — #cell-assignee 插槽 -->
        <template #cell-assignee="{ row }">
          <div class="assignee-cell">
            <el-avatar :size="22" class="avatar">
              {{ (row as TaskRow)?.assignee?.charAt(0) ?? '' }}
            </el-avatar>
            <span>{{ (row as TaskRow)?.assignee ?? '' }}</span>
          </div>
        </template>

        <!-- 1.5 — #header-assignee 插槽（自定义表头） -->
        <template #header-assignee>
          <span style="color: var(--el-color-primary); font-weight: 600">
            👤 负责人
          </span>
        </template>

        <!-- 1.4 — expand 展开行内容 -->
        <template #expand="{ row }">
          <div class="expand-content">
            <p><strong>任务：</strong>{{ (row as TaskRow)?.name }}</p>
            <p>
              <strong>时间：</strong>{{ (row as TaskRow)?.startDate }} ~
              {{ (row as TaskRow)?.endDate }}
            </p>
            <p><strong>备注：</strong>{{ (row as TaskRow)?.remark }}</p>
          </div>
        </template>

        <!-- footer 插槽 -->
        <template #summary>
          <span class="text-xs text-gray-400">
            排序：
            {{ sortInfo.prop ? `${sortInfo.prop} (${sortInfo.order})` : '无' }}
          </span>
        </template>
        <template #pagination>
          <span class="text-xs text-gray-400">
            共 {{ tableData.length }} 条数据
          </span>
        </template>
      </ReTableNext>
    </div>
  </el-config-provider>
</template>

<style scoped lang="scss">
.stage1-demo {
  padding: 16px;
  background: var(--el-bg-color);
  border-radius: 8px;
}

.demo-header {
  margin-bottom: 12px;

  .title {
    margin: 0 0 6px;
    font-size: 18px;
    font-weight: 600;
  }

  .desc {
    margin: 0;
    color: var(--el-text-color-secondary);
    font-size: 13px;
    line-height: 1.6;
  }
}

.feature-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.assignee-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  .avatar {
    background: var(--el-color-primary-light-3);
    color: #fff;
    font-size: 12px;
  }
}

.expand-content {
  padding: 12px 24px;
  line-height: 1.8;
  font-size: 13px;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-lighter);
  border-radius: 4px;

  p {
    margin: 0 0 4px;
  }
}
</style>
