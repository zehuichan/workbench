<script setup lang="ts">
import { inject } from 'vue';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/card';
import { LAYOUT_RIGHT_PANEL } from '@/layouts/injection-keys';

const rightPanelMount = inject(LAYOUT_RIGHT_PANEL);

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
    def: 'false',
    desc: '视口自适应 maxHeight；AdaptiveConfig：offsetTop、offsetBottom、excludeSelectors',
  },
  {
    name: 'columnSettingKey',
    type: 'string',
    def: "'plus-table-default'",
    desc: '列设置持久化 key；多实例时需各自不同，否则互相覆盖',
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

const typesImport = `// 公共 API（从 index.ts 导出）
import { PlusTable, PLUS_TABLE_INJECTION_KEY } from '@/components/plus-table';
import type {
  PlusTableColumn,
  PlusTableProps,
  RowData,
  CellContext,
  DependencyApi,
  DependencyState,
  ColumnDependencies,
  HotkeyBinding,
  HotkeyContext,
  AdaptiveConfig,
  PaginationPayload,
} from '@/components/plus-table';

// 内部类型（子组件 inject 用）
import type { PlusTableContext } from '@/components/plus-table/types';`;

/** 与下方各 `el-card` 的 `id` 一致，供右侧目录锚点使用 */
const tocItems = [
  { id: 'quick-start', label: '快速开始' },
  { id: 'props', label: 'Props' },
  { id: 'events', label: '事件' },
  { id: 'slots', label: '插槽' },
  { id: 'column-config', label: '列配置' },
  { id: 'edit-modes', label: '编辑模式' },
  { id: 'dependencies', label: '单元格联动' },
  { id: 'dirty-tracking', label: '脏数据追踪' },
  { id: 'expose', label: '暴露方法' },
  { id: 'hotkeys', label: '键盘与热键' },
  { id: 'pagination', label: '分页' },
  { id: 'style-classes', label: '样式类名' },
  { id: 'types-export', label: '类型导出' },
] as const;

/** 与 `.doc-section` 的 `scroll-margin-top` 一致，传给 el-anchor 的 offset */
const DOC_ANCHOR_OFFSET = 72;

/** Hash 路由下需阻止 `<a href="#id">` 的默认跳转，否则会冲掉 `#/path` */
function onDocAnchorClick(e: MouseEvent) {
  e.preventDefault();
}
</script>

<template>
  <div>
    <Teleport v-if="rightPanelMount" :to="rightPanelMount">
      <nav class="doc-anchor-wrap" aria-label="本页目录">
        <div class="doc-anchor-wrap__title">本页目录</div>
        <el-anchor
          class="doc-anchor"
          container=".lab__main"
          :offset="DOC_ANCHOR_OFFSET"
          :marker="false"
          @click.capture="onDocAnchorClick"
        >
          <el-anchor-link
            v-for="item in tocItems"
            :key="item.id"
            :href="`#${item.id}`"
            :title="item.label"
          />
        </el-anchor>
      </nav>
    </Teleport>

    <header class="page-hero">
      <h1 class="page-hero__title">PlusTable</h1>
      <p class="page-hero__lead">
        基于 Element Plus
        <code>el-table</code>
        的增强表格：配置式列、可编辑单元格、键盘导航与热键、校验、行增删改与撤销重做、列设置持久化、单元格联动（dependencies）、脏数据追踪、分页与自适应高度。
      </p>
    </header>

    <Card id="quick-start" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">快速开始</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <pre class="code-block"><code>{{ quickStart }}</code></pre>
      </CardContent>
    </Card>

    <Card id="props" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">Props</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <p class="muted">
          未列出的属性通过 <code>v-bind="$attrs"</code> 传给
          <code>el-table</code>（如 <code>sort-change</code>）。
        </p>
        <el-table
          :data="propsRows"
          border
          stripe
          size="small"
          class="doc-table"
        >
          <el-table-column prop="name" label="属性" width="200" />
          <el-table-column prop="type" label="类型" min-width="220" />
          <el-table-column prop="def" label="默认值" width="120" />
          <el-table-column prop="desc" label="说明" min-width="240" />
        </el-table>
      </CardContent>
    </Card>

    <Card id="events" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">事件</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <p class="muted">
          <code>el-table</code> 原生事件（如
          <code>sort-change</code>）可直接监听。
        </p>
        <el-table
          :data="eventRows"
          border
          stripe
          size="small"
          class="doc-table"
        >
          <el-table-column prop="name" label="事件" width="200" />
          <el-table-column prop="payload" label="载荷" min-width="200" />
          <el-table-column prop="desc" label="说明" min-width="200" />
        </el-table>
      </CardContent>
    </Card>

    <Card id="slots" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">插槽</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <el-table :data="slotRows" border stripe size="small" class="doc-table">
          <el-table-column prop="name" label="插槽" width="200" />
          <el-table-column prop="desc" label="说明" min-width="360" />
        </el-table>
      </CardContent>
    </Card>

    <Card id="column-config" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">列配置 PlusTableColumn</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <ul class="bullet-list">
          <li><code>hidden</code>：列设置中可隐藏。</li>
          <li>
            <code>editable</code>：是否可编辑，可为
            <code>(row) =&gt; boolean</code>。
          </li>
          <li>
            <code>component</code>：编辑组件标识或组件，内置映射见
            <code>adapters/index.ts</code
            >（input、input-number、select、date-picker、switch、time-picker、time-select）。
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
            <code>renderHeader</code>：自定义表头（无
            <code>header-${prop}</code> 插槽时）。
          </li>
          <li><code>dependencies</code>：单元格联动（见下节）。</li>
          <li><code>children</code>：多级表头。</li>
          <li>
            特殊
            <code>type</code
            >：<code>selection</code>、<code>index</code>、<code>expand</code>。
          </li>
        </ul>
      </CardContent>
    </Card>

    <Card id="edit-modes" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">编辑模式</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <p class="muted">
          <code>editable</code> prop 决定表格的编辑行为，支持 5 种模式：
        </p>
        <ul class="bullet-list">
          <li><code>false</code>（默认）：只读模式，不可编辑。</li>
          <li>
            <code>'cell'</code>：单元格模式，双击 / F2 /
            可打印字符进入编辑，Enter 确认并下移，Esc 取消，Tab 横移并确认。
          </li>
          <li>
            <code>'row'</code>：行模式，同一行所有可编辑列同时进入编辑态；Tab
            在行内循环而非确认；切换到其他行时整行确认。
          </li>
          <li>
            <code>'manual'</code>：手动模式，需通过
            <code>startEdit(rowIndex, colIndex)</code> 或
            <code>focusAndEditByProp(rowIndex, prop)</code> 触发，不响应双击或
            F2。
          </li>
          <li>
            <code>true</code
            >：全量模式（all），所有可编辑单元格始终展示编辑器，无需进入/退出编辑。方向键和
            Tab 直接在编辑器间移动焦点。
          </li>
        </ul>
        <p class="muted">
          编辑支持 <strong>Ctrl+Z / Ctrl+Shift+Z</strong> 撤销重做（最多 50
          步），undo/redo 后脏标记自动同步。
        </p>
      </CardContent>
    </Card>

    <Card id="dependencies" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">单元格联动 dependencies</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <p class="muted">
          <code>DependencyApi</code> 提供
          <code>rowIndex</code
          >、<code>row</code>、<code>column</code>、<code>getFieldValue</code>、<code>setFieldValue</code>。
        </p>
        <pre class="code-block"><code>{{ depsExample }}</code></pre>
      </CardContent>
    </Card>

    <Card id="dirty-tracking" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">脏数据追踪</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <p class="muted">
          组件内部自动维护一份基线快照（data
          首次非空值的深拷贝），编辑后通过对比判断哪些单元格被修改。脏单元格左上角显示红色三角角标（<code>plus-table-cell--dirty</code>），脏行加
          <code>plus-table-row--dirty</code>。
        </p>
        <ul class="bullet-list">
          <li>
            <code>markDirty(rowIndex, prop)</code
            >：手动标记（通常由编辑系统自动调用）。
          </li>
          <li>
            <code>clearDirty(rowIndex?, prop?)</code
            >：清除脏标记；无参清空全部，仅 rowIndex 清该行，rowIndex + prop
            清单格。
          </li>
          <li>
            <code>resetTracking()</code>：将当前 data
            作为新基线，清空所有脏标记。
          </li>
          <li>
            <code>getModifiedRows()</code>：返回至少有一个脏单元格的行数据数组。
          </li>
          <li>
            <code>getDirtyCells()</code>：返回所有脏单元格 key 集合（格式
            <code>rowIndex:prop</code>）。
          </li>
          <li>
            <code>isCellDirty(rowIndex, prop)</code> /
            <code>isRowDirty(rowIndex)</code>：单格/行级查询。
          </li>
        </ul>
      </CardContent>
    </Card>

    <Card id="expose" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">暴露方法（ref）</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <ul class="bullet-list">
          <li>
            <strong>导航</strong
            >：<code>navigate</code>、<code>focusCell</code>、<code>getColIndexByProp</code>、<code>focusAndEditByProp</code>、<code>activeRowIndex</code>、<code>activeColIndex</code>、<code>activeRow</code>、<code
              >activeColumn</code
            >
          </li>
          <li>
            <strong>编辑</strong
            >：<code>startEdit</code>、<code>confirmEdit</code>、<code>cancelEdit</code>、<code>editMode</code>、<code
              >isEditing</code
            >
          </li>
          <li>
            <strong>校验</strong>：<code>validate(rows?)</code>、<code
              >validateField(rowIndex, prop)</code
            >、<code>clearValidation(rowIndex?, prop?)</code>、<code
              >scrollToFirstError()</code
            >
          </li>
          <li>
            <strong>行操作</strong>：<code
              >insertRow(index?, defaultRow?, count?)</code
            >、<code>deleteRow(index?)</code>、<code>moveRow(from, to)</code
            >、<code>duplicateRow(index?)</code>
          </li>
          <li>
            <strong>脏数据</strong
            >：<code>markDirty</code>、<code>clearDirty</code>、<code>resetTracking</code>、<code>getModifiedRows</code>、<code>getDirtyCells</code>、<code>isCellDirty</code>、<code
              >isRowDirty</code
            >
          </li>
          <li>
            <strong>撤销重做</strong
            >：<code>undo</code>、<code>redo</code>、<code>canUndo</code>、<code>canRedo</code>、<code
              >clearHistory</code
            >
          </li>
          <li>
            <strong>列操作</strong
            >：<code>toggleColumn</code>、<code>reorderColumns</code>、<code>setColumnWidth</code>、<code
              >resetColumns</code
            >
          </li>
          <li>
            <strong>el-table 透传</strong
            >：<code>getElTable</code>、<code>clearSelection</code>、<code>getSelectionRows</code>、<code>toggleRowSelection</code>、<code>toggleAllSelection</code>、<code>doLayout</code>、<code>sort</code>、<code
              >scrollTo</code
            >
            等
          </li>
        </ul>
        <p class="muted">
          行操作下标均为<strong>当前 data 数组下标</strong
          >（与服务端分页时「仅含当前页数据」一致）。
        </p>
      </CardContent>
    </Card>

    <Card id="hotkeys" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">内置键盘行为</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <p class="muted">表格容器需获得焦点（点击表格区域）后生效。</p>
        <ul class="bullet-list">
          <li><strong>方向键</strong>：移动激活单元格。</li>
          <li>
            <strong>Tab / Shift+Tab</strong>：横向移动；编辑中在 row
            模式下行内循环。
          </li>
          <li><strong>Enter / Esc</strong>：进入编辑或换行；取消编辑。</li>
          <li>
            <strong>Home / End</strong>：行首或行尾格；<strong
              >Ctrl+Home / Ctrl+End</strong
            >：全表首尾。
          </li>
          <li>
            <strong>F2</strong>、<strong>Delete / Backspace</strong
            >：进入编辑或清空（自动触发模式）。
          </li>
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
      </CardContent>
    </Card>

    <Card id="pagination" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">分页</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <p class="muted">
          设置 <code>total</code> 后出现分页条。<strong
            >请将当前页数据通过 data 传入</strong
          >，组件内部不对数据进行分页切片。<code>pagination</code> 与
          <code>update:currentPage</code> /
          <code>update:pageSize</code> 在变化时触发，用于请求接口。
        </p>
        <el-alert type="info" :closable="false" show-icon class="doc-alert">
          <template #title>与「示例」页的关系</template>
          <template #default>
            示例页为客户端全量数据，仅用于演示分页条 UI
            与事件；接入服务端时请按页更新
            <code>data</code>。
          </template>
        </el-alert>
      </CardContent>
    </Card>

    <Card id="style-classes" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">样式类名</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <p class="muted">
          <code>plus-table-cell--active</code
          >、<code>plus-table-row--active</code>、<code>plus-table-cell--error</code>、<code>plus-table-cell--dirty</code>、<code
            >plus-table-row--dirty</code
          >
          等，可用全局样式覆盖。
        </p>
      </CardContent>
    </Card>

    <Card id="types-export" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">类型导出</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <pre class="code-block"><code>{{ typesImport }}</code></pre>
      </CardContent>
    </Card>

    <footer class="docs-footer">
      <router-link class="cta" :to="{ name: 'plus-table-demo' }">
        打开交互示例 →
      </router-link>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.doc-section {
  margin-bottom: 24px;
  padding: 0;
  overflow: hidden;
  scroll-margin-top: 72px;
  gap: 0;
  border: 1px solid var(--separator);
  border-radius: var(--radius-sm);
}

.doc-section__header {
  padding: 16px 24px;
  background: var(--muted);
  border-bottom: 1px solid var(--separator);
}

.doc-section__body {
  padding: 24px;
}

.card-title {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: -0.2px;
  color: var(--foreground);

  &::before {
    content: '';
    display: inline-block;
    width: 3px;
    height: 14px;
    margin-right: 8px;
    vertical-align: -1px;
    border-radius: 0;
    background: var(--foreground);
  }
}

.muted {
  margin: 0 0 16px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--muted-foreground);

  code {
    padding: 2px 7px;
    font-size: 12px;
    font-weight: 500;
    background: var(--muted);
    border: 1px solid var(--border);
    border-radius: 0;
    color: var(--foreground);
  }
}

.doc-table {
  width: 100%;
}

.code-block {
  margin: 0;
  padding: 16px 20px;
  font-size: 12px;
  line-height: 1.6;
  overflow-x: auto;
  color: var(--foreground);
  background: var(--muted);
  border-radius: 0;
  border: 1px solid var(--separator);

  code {
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
      'Courier New', monospace;
    white-space: pre;
  }
}

.bullet-list {
  margin: 0;
  padding-left: 20px;
  font-size: 12px;
  line-height: 1.75;
  color: var(--foreground);

  li {
    margin-bottom: 6px;

    &::marker {
      color: var(--muted-foreground);
    }
  }

  code {
    padding: 2px 7px;
    font-size: 12px;
    font-weight: 500;
    background: var(--muted);
    border: 1px solid var(--border);
    border-radius: 0;
  }
}

.doc-alert {
  margin-top: 12px;
}

.docs-footer {
  padding: 32px 0 16px;
  text-align: center;
}

.cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 24px;
  font-size: 12px;
  font-weight: 400;
  font-family:
    'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    monospace;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: var(--primary-foreground);
  background: var(--primary);
  border-radius: 0;
  text-decoration: none;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
}

.doc-anchor-wrap {
  &__title {
    margin: 0 0 14px;
    padding-bottom: 10px;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.65px;
    text-transform: uppercase;
    color: var(--muted-foreground);
    border-bottom: 1px solid var(--border);
  }

  :deep(.doc-anchor.el-anchor) {
    --el-anchor-bg-color: transparent;
    background-color: transparent;
  }

  :deep(.el-anchor.el-anchor--vertical .el-anchor__list) {
    display: block;
    padding-left: 0;
  }

  :deep(.el-anchor__item) {
    display: block;
    padding-left: 10px;
    border-left: 1px solid var(--border);
  }

  :deep(.el-anchor__link) {
    display: block;
    box-sizing: border-box;
    max-width: 100%;
    padding: 5px 10px;
    font-size: 12px;
    line-height: 1.45;
    white-space: normal;
    word-break: break-word;
    color: var(--muted-foreground);
    text-decoration: none;
    border-left: 2px solid transparent;
    margin-left: -12px;
    padding-left: 12px;
    transition:
      color 0.2s,
      border-color 0.2s;

    &:hover {
      color: var(--foreground);
      border-left-color: var(--border);
    }
  }

  :deep(.el-anchor__link.is-active) {
    color: var(--foreground);
    border-left-color: var(--foreground);
  }
}
</style>
