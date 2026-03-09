<script setup lang="ts">
import { ref } from 'vue';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table';

// ──── 3.2.1 行类型 ────
interface DemoRow {
  id: number;
  name: string;
  status: 'pending' | 'active' | 'done';
}

// ──── 3.2.2 列定义（createColumnHelper）────
const columnHelper = createColumnHelper<DemoRow>();

const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    enableSorting: true,
  }),
  columnHelper.accessor('name', {
    header: '名称',
    enableSorting: true,
  }),
  columnHelper.accessor('status', {
    header: '状态',
    enableSorting: true,
  }),
];

// ──── 3.2.3 示例数据 ────
const data = ref<DemoRow[]>([
  { id: 1, name: '任务 A', status: 'pending' },
  { id: 2, name: '任务 B', status: 'active' },
  { id: 3, name: '任务 C', status: 'done' },
  { id: 4, name: '任务 D', status: 'active' },
  { id: 5, name: '任务 E', status: 'pending' },
  { id: 6, name: '任务 F', status: 'done' },
  { id: 7, name: '任务 G', status: 'active' },
  { id: 8, name: '任务 H', status: 'pending' },
]);

// ──── 3.3 Table 实例（useVueTable + getCoreRowModel + 排序 + 分页）────
const table = useVueTable({
  get data() {
    return data.value;
  },
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  initialState: {
    pagination: { pageSize: 5 },
  },
});
</script>

<template>
  <div class="tanstack-table-demo">
    <div class="demo-header">
      <h2 class="title">TanStack Vue Table 起步示例</h2>
      <p class="desc">
        createVueTable（useVueTable）+ 列定义 + getCoreRowModel，并演示排序与分页。
      </p>
    </div>

    <div class="table-wrapper">
      <table class="demo-table">
        <thead>
          <tr
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
          >
            <th
              v-for="header in headerGroup.headers"
              :key="header.id"
              scope="col"
              class="demo-th"
              :class="{ sortable: header.column.getCanSort() }"
              @click="header.column.getToggleSortingHandler()?.($event)"
            >
              {{
                typeof header.column.columnDef.header === 'function'
                  ? (header.column.columnDef.header as (ctx: unknown) => string)(header.getContext())
                  : header.column.columnDef.header
              }}
              <span v-if="header.column.getCanSort()" class="sort-indicator">
                {{ { asc: '↑', desc: '↓' }[header.column.getIsSorted() as string] ?? '⇅' }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            class="demo-tr"
          >
            <td
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              class="demo-td"
            >
              {{ cell.getValue() }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination-toolbar">
      <button
        type="button"
        class="demo-btn"
        :disabled="!table.getCanPreviousPage()"
        @click="table.previousPage()"
      >
        上一页
      </button>
      <span class="page-info">
        第 {{ table.getState().pagination.pageIndex + 1 }} / {{ table.getPageCount() }} 页
        （共 {{ table.getRowCount() }} 条）
      </span>
      <button
        type="button"
        class="demo-btn"
        :disabled="!table.getCanNextPage()"
        @click="table.nextPage()"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tanstack-table-demo {
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
    line-height: 1.6;
  }
}

.table-wrapper {
  overflow-x: auto;
  margin-bottom: 16px;
}

.demo-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  background: var(--el-bg-color-page);
}

.demo-th {
  padding: 10px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 13px;
  color: var(--el-text-color-primary);
  background: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color);

  &.sortable {
    cursor: pointer;
    user-select: none;

    &:hover {
      background: var(--el-fill-color);
    }
  }
}

.sort-indicator {
  margin-left: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.demo-td {
  padding: 10px 12px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.demo-tr:last-child .demo-td {
  border-bottom: none;
}

.pagination-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.demo-btn {
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);

  &:hover:not(:disabled) {
    border-color: var(--el-color-primary);
    color: var(--el-color-primary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.page-info {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
</style>
