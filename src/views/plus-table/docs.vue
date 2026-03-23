<script setup lang="ts">
import PlusTableSubnav from './subnav.vue';

const propsRows = [
  {
    name: 'data',
    type: 'T[]',
    def: '[]',
    desc: '表格数据，支持 v-model:data',
  },
  {
    name: 'columns',
    type: 'PlusTableColumn[]',
    def: '[]',
    desc: '列配置',
  },
  {
    name: 'rowKey',
    type: 'string | (row) => string | number',
    def: '—',
    desc: '与 el-table 一致',
  },
  {
    name: 'stripe / border / showOverflowTooltip',
    type: 'boolean',
    def: 'false / true / true',
    desc: '展示相关',
  },
  {
    name: 'maxHeight',
    type: 'string | number',
    def: '—',
    desc: '固定最大高度；未设且开启 adaptive 时由自适应计算',
  },
  {
    name: 'cellActive / rowActive',
    type: 'boolean',
    def: 'true',
    desc: '是否高亮当前激活单元格 / 行',
  },
  {
    name: 'editable',
    type: "boolean | 'cell' | 'row' | 'manual'",
    def: 'false',
    desc: 'cell 双击进入；row 行编辑；manual 需 startEdit',
  },
  {
    name: 'rules',
    type: 'Record<string, RuleItem | RuleItem[]>',
    def: '—',
    desc: '表级校验（async-validator），按列 prop 聚合',
  },
  {
    name: 'validateTrigger',
    type: "'change' | 'blur' | 'manual'",
    def: 'manual',
    desc: '校验触发时机',
  },
  {
    name: 'validateOnCellExit',
    type: 'boolean',
    def: 'false',
    desc: '离开单元格（确认编辑）时是否校验',
  },
  {
    name: 'columnSetting',
    type: 'boolean',
    def: 'true',
    desc: '列设置（显隐、排序、列宽，可本地持久化）',
  },
  {
    name: 'hotkeyEnabled / hotkeys',
    type: 'boolean / HotkeyBinding[]',
    def: 'true / —',
    desc: '键盘导航与自定义热键',
  },
  {
    name: 'currentPage / pageSize / total',
    type: 'number',
    def: '—',
    desc: '传入 total 即启用底部分页；data 须由父组件按页传入，组件不切片',
  },
  {
    name: 'pageSizes / paginationLayout',
    type: '—',
    def: '—',
    desc: '分页器配置，见 plus-table-pagination.vue',
  },
  {
    name: 'adaptive',
    type: 'boolean | AdaptiveConfig',
    def: 'true',
    desc: '视口自适应 maxHeight；AdaptiveConfig：offsetTop、offsetBottom、excludeSelectors',
  },
];

const eventRows = [
  {
    name: 'update:data',
    payload: 'T[]',
    desc: '数据变更（编辑、行操作等）',
  },
  {
    name: 'cell-edit-start / cell-edit-end',
    payload: '{ rowIndex, column, value }',
    desc: '单元格进入 / 退出编辑',
  },
  {
    name: 'cell-value-change',
    payload: '{ rowIndex, column, oldValue, newValue }',
    desc: '单元格值变化',
  },
  {
    name: 'update:currentPage / update:pageSize',
    payload: 'number',
    desc: '分页同步',
  },
  {
    name: 'pagination',
    payload: '{ currentPage, pageSize }',
    desc: '页码或每页条数变化，用于拉取数据',
  },
];

const slotRows = [
  { name: 'title', desc: '顶部左侧标题区' },
  { name: 'actions', desc: '顶部右侧，与列设置按钮同排' },
  { name: 'summary', desc: '底部左侧（与分页同排）' },
  {
    name: 'pagination',
    desc: '覆盖默认分页器；total != null 时默认显示内置分页',
  },
  { name: 'expand', desc: "type: 'expand' 列的展开内容" },
  { name: 'append / empty', desc: '透传 el-table' },
  {
    name: 'cell-${prop}',
    desc: '按列 prop 自定义展示单元格',
  },
  { name: 'header-${prop}', desc: '自定义表头' },
  {
    name: 'editor-${prop}',
    desc: '按列自定义编辑器（需该列 editable）',
  },
];

const quickStart = `<script setup lang="ts">
import { ref } from 'vue';
import { PlusTable } from '@/components';
import type { PlusTableColumn } from '@/components/plus-table';

interface Row {
  id: number;
  name: string;
}

const data = ref<Row[]>([{ id: 1, name: '示例' }]);
const columns: PlusTableColumn<Row>[] = [
  { type: 'selection', width: 48 },
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '名称', editable: true, component: 'input' },
];
<\/script>

<template>
  <PlusTable v-model:data="data" :columns="columns" row-key="id" border />
</template>`;

const depsExample = `dependencies: {
  triggerFields: ['department'],
  disabled: (values, api) => false,
  required: (values, api) => values.status === 'active',
  rules: (values, api) => [{ required: true, message: '...' }],
  componentProps: (values, api) => ({ options: [...] }),
  trigger: (values, api) => { api.setFieldValue('remark', ''); },
}`;

const typesImport = `import type {
  PlusTableColumn,
  PlusTableProps,
  PlusTableContext,
  DependencyApi,
  ColumnDependencies,
  HotkeyBinding,
  HotkeyContext,
  AdaptiveConfig,
} from '@/components/plus-table';`;
</script>

<template>
  <div class="plus-table-docs">
    <PlusTableSubnav />

    <header class="docs-hero">
      <h1 class="title">PlusTable</h1>
      <p class="lead">
        基于 Element Plus <code>el-table</code> 的增强表格：配置式列、可编辑单元格、键盘导航与热键、校验、行增删改与撤销重做、列设置持久化、单元格联动（dependencies）、脏数据追踪、分页与自适应高度。
      </p>
      <p class="source-hint">
        与仓库内
        <code>src/components/plus-table/README.md</code> 同步维护；需要可拷贝 Markdown 到项目文档站。
      </p>
    </header>

    <el-card class="doc-section" shadow="never">
      <template #header>
        <span class="card-title">快速开始</span>
      </template>
      <pre class="code-block"><code>{{ quickStart }}</code></pre>
    </el-card>

    <el-card class="doc-section" shadow="never">
      <template #header>
        <span class="card-title">Props</span>
      </template>
      <p class="muted">
        未列出的属性通过 <code>v-bind="$attrs"</code> 传给
        <code>el-table</code>（如 <code>sort-change</code>）。
      </p>
      <el-table :data="propsRows" border stripe size="small" class="doc-table">
        <el-table-column prop="name" label="属性" width="200" />
        <el-table-column prop="type" label="类型" min-width="220" />
        <el-table-column prop="def" label="默认值" width="120" />
        <el-table-column prop="desc" label="说明" min-width="240" />
      </el-table>
    </el-card>

    <el-card class="doc-section" shadow="never">
      <template #header>
        <span class="card-title">事件</span>
      </template>
      <p class="muted">
        <code>el-table</code> 原生事件（如 <code>sort-change</code>）可直接监听。
      </p>
      <el-table :data="eventRows" border stripe size="small" class="doc-table">
        <el-table-column prop="name" label="事件" width="200" />
        <el-table-column prop="payload" label="载荷" min-width="200" />
        <el-table-column prop="desc" label="说明" min-width="200" />
      </el-table>
    </el-card>

    <el-card class="doc-section" shadow="never">
      <template #header>
        <span class="card-title">插槽</span>
      </template>
      <el-table :data="slotRows" border stripe size="small" class="doc-table">
        <el-table-column prop="name" label="插槽" width="200" />
        <el-table-column prop="desc" label="说明" min-width="360" />
      </el-table>
    </el-card>

    <el-card class="doc-section" shadow="never">
      <template #header>
        <span class="card-title">列配置 PlusTableColumn</span>
      </template>
      <ul class="bullet-list">
        <li><code>hidden</code>：列设置中可隐藏。</li>
        <li>
          <code>editable</code>：是否可编辑，可为 <code>(row) =&gt; boolean</code>。
        </li>
        <li>
          <code>component</code>：编辑组件标识或组件，内置映射见
          <code>adapter.ts</code>。
        </li>
        <li>
          <code>componentProps</code>：编辑组件 props，或
          <code>(row, column) =&gt; props</code>。
        </li>
        <li>
          <code>rules</code> / <code>required</code>：列级校验（可与表级
          <code>rules</code> 合并）。
        </li>
        <li>
          <code>render</code>：展示态 VNode
          <code>(ctx: CellContext) =&gt; VNode</code>。
        </li>
        <li><code>formatter</code>：与 el-table-column 一致。</li>
        <li>
          <code>renderHeader</code>：自定义表头（无 <code>header-${prop}</code> 插槽时）。
        </li>
        <li><code>dependencies</code>：单元格联动（见下节）。</li>
        <li><code>children</code>：多级表头。</li>
        <li>
          特殊 <code>type</code>：<code>selection</code>、<code>index</code>、<code>expand</code>。
        </li>
      </ul>
    </el-card>

    <el-card class="doc-section" shadow="never">
      <template #header>
        <span class="card-title">单元格联动 dependencies</span>
      </template>
      <p class="muted">
        <code>DependencyApi</code> 提供 <code>rowIndex</code>、<code>row</code>、<code>column</code>、<code>getFieldValue</code>、<code>setFieldValue</code>。
      </p>
      <pre class="code-block"><code>{{ depsExample }}</code></pre>
    </el-card>

    <el-card class="doc-section" shadow="never">
      <template #header>
        <span class="card-title">暴露方法（ref）</span>
      </template>
      <p class="muted">
        常用：<code>validate</code>、<code>clearValidation</code>、<code>scrollToFirstError</code>、<code>focusCell</code>、<code>focusAndEditByProp</code>、<code>getColIndexByProp</code>、<code>startEdit</code>、<code>confirmEdit</code>、<code>cancelEdit</code>、<code>insertRow</code>、<code>deleteRow</code>、<code>moveRow</code>、<code>duplicateRow</code>、<code>getModifiedRows</code>、<code>undo</code> /
        <code>redo</code>、<code>clearSelection</code>、<code>getSelectionRows</code>、<code>getElTable</code>
        等；完整列表见 <code>plus-table.vue</code> 中
        <code>defineExpose</code>。
      </p>
      <p class="muted">
        行操作下标均为<strong>当前 data 数组下标</strong>（与服务端分页时「仅含当前页数据」一致）。
      </p>
    </el-card>

    <el-card class="doc-section" shadow="never">
      <template #header>
        <span class="card-title">内置键盘行为</span>
      </template>
      <p class="muted">表格容器需获得焦点（点击表格区域）后生效。</p>
      <ul class="bullet-list">
        <li><strong>方向键</strong>：移动激活单元格。</li>
        <li>
          <strong>Tab / Shift+Tab</strong>：横向移动；编辑中在 row 模式下行内循环。
        </li>
        <li>
          <strong>Enter / Esc</strong>：进入编辑或换行；取消编辑。
        </li>
        <li>
          <strong>Home / End</strong>：行首或行尾格；<strong>Ctrl+Home / Ctrl+End</strong>：全表首尾。
        </li>
        <li><strong>F2</strong>、<strong>Delete / Backspace</strong>：进入编辑或清空（自动触发模式）。</li>
        <li>
          <strong>Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y</strong>：撤销 / 重做。
        </li>
        <li>可打印字符：自动触发模式下可直接开编并填入首字符。</li>
      </ul>
      <p class="muted">
        自定义热键：<code
          >{ key, handler, preventDefault?, override?, when? }</code
        >；<code>override: true</code> 时优先于内置处理。
      </p>
    </el-card>

    <el-card class="doc-section" shadow="never">
      <template #header>
        <span class="card-title">分页</span>
      </template>
      <p class="muted">
        设置 <code>total</code> 后出现分页条。<strong>请将当前页数据通过 data 传入</strong>，组件内部不对数据进行分页切片。<code>pagination</code> 与 <code>update:currentPage</code> / <code>update:pageSize</code> 在变化时触发，用于请求接口。
      </p>
      <el-alert type="info" :closable="false" show-icon class="doc-alert">
        <template #title>与「示例」页的关系</template>
        <template #default>
          示例页为客户端全量数据，仅用于演示分页条 UI 与事件；接入服务端时请按页更新
          <code>data</code>。
        </template>
      </el-alert>
    </el-card>

    <el-card class="doc-section" shadow="never">
      <template #header>
        <span class="card-title">样式类名</span>
      </template>
      <p class="muted">
        <code>plus-table-cell--active</code>、<code>plus-table-row--active</code>、<code>plus-table-cell--error</code>、<code>plus-table-cell--dirty</code>、<code>plus-table-row--dirty</code> 等，可用全局样式覆盖。
      </p>
    </el-card>

    <el-card class="doc-section" shadow="never">
      <template #header>
        <span class="card-title">类型导出</span>
      </template>
      <pre class="code-block"><code>{{ typesImport }}</code></pre>
    </el-card>

    <footer class="docs-footer">
      <router-link class="cta" :to="{ name: 'plus-table-demo' }">
        打开交互示例 →
      </router-link>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.plus-table-docs {
  padding: 16px;
  max-width: 960px;
  margin: 0 auto;
}

.docs-hero {
  margin-bottom: 20px;

  .title {
    margin: 0 0 8px;
    font-size: 22px;
    font-weight: 600;
  }

  .lead {
    margin: 0 0 8px;
    font-size: 14px;
    line-height: 1.65;
    color: var(--el-text-color-regular);
  }

  .source-hint {
    margin: 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  code {
    padding: 1px 6px;
    font-size: 12px;
    background: var(--el-fill-color-light);
    border-radius: 4px;
  }
}

.doc-section {
  margin-bottom: 16px;

  :deep(.el-card__header) {
    padding: 12px 16px;
  }

  :deep(.el-card__body) {
    padding: 16px;
  }
}

.card-title {
  font-size: 15px;
  font-weight: 600;
}

.muted {
  margin: 0 0 12px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);

  code {
    padding: 1px 5px;
    font-size: 12px;
    background: var(--el-fill-color-light);
    border-radius: 3px;
  }
}

.doc-table {
  width: 100%;
}

.code-block {
  margin: 0;
  padding: 12px 14px;
  font-size: 12px;
  line-height: 1.5;
  overflow-x: auto;
  color: var(--el-text-color-primary);
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
  border: 1px solid var(--el-border-color-lighter);

  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
      'Liberation Mono', 'Courier New', monospace;
    white-space: pre;
  }
}

.bullet-list {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  line-height: 1.75;
  color: var(--el-text-color-regular);

  li {
    margin-bottom: 6px;
  }

  code {
    padding: 1px 5px;
    font-size: 12px;
    background: var(--el-fill-color-light);
    border-radius: 3px;
  }
}

.doc-alert {
  margin-top: 8px;
}

.docs-footer {
  padding: 16px 0 8px;
  text-align: center;
}

.cta {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-color-primary);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
