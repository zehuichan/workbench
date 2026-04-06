<script setup lang="ts">
import { inject } from 'vue';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LAYOUT_RIGHT_PANEL } from '@/layouts/injection-keys';

const rightPanelMount = inject(LAYOUT_RIGHT_PANEL);

const highlevelRows = [
  { name: 'read(input, options?)', ret: 'Promise<Workbook>', desc: '自动检测格式（XLSX/ODS），返回 Workbook' },
  { name: 'write(options)', ret: 'Promise<Uint8Array>', desc: '写入 XLSX 或 ODS（通过 format 选项控制）' },
  { name: 'readObjects(input, options?)', ret: 'Promise<T[]>', desc: '文件 → 对象数组（首行为表头）' },
  { name: 'writeObjects(data, options?)', ret: 'Promise<Uint8Array>', desc: '对象数组 → XLSX/ODS' },
];

const xlsxRows = [
  { name: 'readXlsx(input, options?)', ret: 'Promise<Workbook>', desc: '解析 XLSX（Uint8Array | ArrayBuffer）' },
  { name: 'writeXlsx(options)', ret: 'Promise<Uint8Array>', desc: '生成 XLSX' },
  { name: 'openXlsx(input, options?)', ret: 'Promise<RoundtripWorkbook>', desc: '打开以进行往返修改（保留未知部分）' },
  { name: 'saveXlsx(workbook)', ret: 'Promise<Uint8Array>', desc: '保存往返 Workbook 为 XLSX' },
  { name: 'streamXlsxRows(input, options?)', ret: 'AsyncGenerator<StreamRow>', desc: '逐行流式读取' },
  { name: 'XlsxStreamWriter', ret: 'class', desc: '逐行流式写入' },
];

const csvRows = [
  { name: 'parseCsv(input, options?)', ret: 'CellValue[][]', desc: '解析 CSV 字符串（RFC 4180）' },
  { name: 'parseCsvObjects(input, options?)', ret: '{ data, headers }', desc: '带表头解析为对象数组' },
  { name: 'writeCsv(rows, options?)', ret: 'string', desc: '二维数组 → CSV 字符串' },
  { name: 'writeCsvObjects(data, options?)', ret: 'string', desc: '对象数组 → CSV' },
  { name: 'detectDelimiter(input)', ret: 'string', desc: '自动检测分隔符' },
  { name: 'streamCsvRows(input, options?)', ret: 'Generator', desc: '流式逐行读取 CSV' },
  { name: 'fetchCsv(url, options?)', ret: 'Promise', desc: '从 URL 获取并解析 CSV' },
];

const exportRows = [
  { name: 'toHtml(sheet, options?)', ret: 'string', desc: 'HTML <table>，支持样式和无障碍' },
  { name: 'toMarkdown(sheet, options?)', ret: 'string', desc: 'Markdown 表格，自动对齐' },
  { name: 'toJson(sheet, options?)', ret: 'object', desc: 'JSON（objects / arrays / columns 格式）' },
  { name: 'fromHtml(html, options?)', ret: 'Sheet', desc: '解析 HTML table → Sheet' },
];

const sheetOpsRows = [
  { name: 'insertRows(sheet, index, count)', desc: '插入行' },
  { name: 'deleteRows(sheet, index, count)', desc: '删除行' },
  { name: 'insertColumns(sheet, index, count)', desc: '插入列' },
  { name: 'deleteColumns(sheet, index, count)', desc: '删除列' },
  { name: 'moveRows(sheet, from, count, to)', desc: '移动行' },
  { name: 'cloneSheet(sheet, name)', desc: '深拷贝 sheet' },
  { name: 'sortRows(sheet, col, order?)', desc: '按列排序' },
  { name: 'findCells(sheet, predicate)', desc: '查找单元格' },
  { name: 'replaceCells(sheet, find, replace)', desc: '查找替换' },
];

const utilRows = [
  { name: 'formatValue(value, numFmt, options?)', desc: '应用 Excel 数字格式（支持 locale）' },
  { name: 'validateWithSchema(rows, schema, options?)', desc: '按 schema 校验和类型转换' },
  { name: 'serialToDate(serial, is1904?)', desc: 'Excel 序列号 → Date (UTC)' },
  { name: 'dateToSerial(date, is1904?)', desc: 'Date → Excel 序列号' },
  { name: 'isDateFormat(numFmt)', desc: '判断格式串是否为日期格式' },
  { name: 'formatDate(date, format)', desc: '按 Excel 格式串格式化日期' },
  { name: 'parseCellRef(ref)', desc: '"AA15" → { row: 14, col: 26 }' },
  { name: 'cellRef(row, col)', desc: '(14, 26) → "AA15"' },
  { name: 'colToLetter(col)', desc: '26 → "AA"' },
  { name: 'rangeRef(r1, c1, r2, c2)', desc: '(0,0,9,3) → "A1:D10"' },
];

const writeSheetFields = [
  { name: 'name', type: 'string', desc: 'Sheet 名称' },
  { name: 'columns', type: 'ColumnDef[]', desc: '列定义（header、key、width、numFmt、autoWidth 等）' },
  { name: 'data', type: 'T[]', desc: '对象数组数据（配合 columns.key 使用）' },
  { name: 'rows', type: 'CellValue[][]', desc: '二维数组数据（与 data 二选一）' },
  { name: 'freezePane', type: '{ rows?, columns? }', desc: '冻结行/列' },
  { name: 'autoFilter', type: '{ range }', desc: '自动筛选范围' },
  { name: 'merges', type: 'MergeRange[]', desc: '合并单元格' },
  { name: 'dataValidations', type: 'DataValidation[]', desc: '数据验证规则' },
  { name: 'cells', type: 'Map<string, Cell>', desc: '单元格级别覆盖（key 为 "row,col"）' },
  { name: 'images', type: 'SheetImage[]', desc: '插入图片（PNG/JPEG/GIF/SVG/WebP）' },
  { name: 'protection', type: 'SheetProtection', desc: 'Sheet 保护' },
];

const schemaFieldRows = [
  { name: 'type', type: '"string" | "number" | "integer" | "boolean" | "date"', desc: '目标类型（带自动转换）' },
  { name: 'required', type: 'boolean', desc: '拒绝 null/空值' },
  { name: 'pattern', type: 'RegExp', desc: '正则校验（字符串）' },
  { name: 'min / max', type: 'number', desc: '最小/最大值（数字）或长度（字符串）' },
  { name: 'enum', type: 'unknown[]', desc: '允许的值列表' },
  { name: 'default', type: 'unknown', desc: 'null/空时的默认值' },
  { name: 'validate', type: '(v) => boolean | string', desc: '自定义校验函数' },
  { name: 'transform', type: '(v) => unknown', desc: '校验后转换' },
];

const quickStart = `import { readXlsx, writeXlsx } from 'hucre';

// 读取 XLSX
const workbook = await readXlsx(buffer);
console.log(workbook.sheets[0].rows);

// 写入 XLSX
const xlsx = await writeXlsx({
  sheets: [{
    name: 'Products',
    columns: [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Price', key: 'price', width: 12, numFmt: '$#,##0.00' },
      { header: 'Stock', key: 'stock', width: 10 },
    ],
    data: [
      { name: 'Widget', price: 9.99, stock: 142 },
      { name: 'Gadget', price: 24.50, stock: 87 },
    ],
  }],
});`;

const treeShaking = `// XLSX only (~14 KB gzipped)
import { readXlsx, writeXlsx } from 'hucre/xlsx';

// CSV only (~2 KB gzipped)
import { parseCsv, writeCsv } from 'hucre/csv';

// ODS only
import { readOds, writeOds } from 'hucre/ods';

// 统一 API（自动检测格式）
import { read, write, readObjects, writeObjects } from 'hucre';`;

const builderExample = `import { WorkbookBuilder } from 'hucre';

const xlsx = await WorkbookBuilder.create()
  .addSheet('Products')
    .columns([
      { header: 'Name', key: 'name', autoWidth: true },
      { header: 'Price', key: 'price', numFmt: '$#,##0.00' },
    ])
    .row(['Widget', 9.99])
    .row(['Gadget', 24.50])
    .freeze(1)
  .done()
  .build();`;

const streamExample = `import { streamXlsxRows, XlsxStreamWriter } from 'hucre/xlsx';

// 流式读取 — AsyncGenerator 逐行产出
for await (const row of streamXlsxRows(buffer)) {
  console.log(row.index, row.values);
}

// 流式写入 — 增量添加行
const writer = new XlsxStreamWriter({
  name: 'BigData',
  columns: [{ header: 'ID' }, { header: 'Value' }],
  freezePane: { rows: 1 },
});
for (let i = 0; i < 100_000; i++) {
  writer.addRow([i + 1, Math.random()]);
}
const buffer = await writer.finish();`;

const roundtripExample = `import { openXlsx, saveXlsx } from 'hucre/xlsx';

// 打开 → 修改 → 保存，不丢失图表、宏等
const workbook = await openXlsx(buffer);
workbook.sheets[0].rows[0][0] = 'Updated!';
const output = await saveXlsx(workbook);`;

const tocItems = [
  { id: 'quick-start', label: '快速开始' },
  { id: 'tree-shaking', label: 'Tree Shaking' },
  { id: 'highlevel-api', label: '高级 API' },
  { id: 'xlsx-api', label: 'XLSX' },
  { id: 'csv-api', label: 'CSV' },
  { id: 'export-api', label: '导出' },
  { id: 'write-sheet', label: 'WriteSheet 配置' },
  { id: 'builder-api', label: 'Builder API' },
  { id: 'streaming', label: '流式处理' },
  { id: 'roundtrip', label: '往返保存' },
  { id: 'sheet-ops', label: 'Sheet 操作' },
  { id: 'utils', label: '工具函数' },
  { id: 'schema', label: 'Schema 校验' },
  { id: 'platform', label: '平台支持' },
] as const;

const DOC_SCROLL_HEADER_OFFSET = 72;

function scrollToDocSection(sectionId: string) {
  const target = document.getElementById(sectionId);
  const container = document.querySelector('.lab__main') as HTMLElement | null
    ?? document.querySelector('[data-slot="sidebar-inset"] .lab__main') as HTMLElement | null;
  if (!target || !container) return;
  const top =
    target.getBoundingClientRect().top -
    container.getBoundingClientRect().top +
    container.scrollTop -
    DOC_SCROLL_HEADER_OFFSET;
  container.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}
</script>

<template>
  <div>
    <Teleport v-if="rightPanelMount" :to="rightPanelMount">
      <nav class="doc-toc" aria-label="本页目录">
        <div class="doc-toc__title">本页目录</div>
        <ul class="doc-toc__list">
          <li v-for="item in tocItems" :key="item.id">
            <a
              class="doc-toc__link"
              href="#"
              @click.prevent="scrollToDocSection(item.id)"
            >
              {{ item.label }}
            </a>
          </li>
        </ul>
      </nav>
    </Teleport>

    <header class="page-hero">
      <h1 class="page-hero__title">hucre</h1>
      <p class="page-hero__lead">
        零依赖电子表格引擎。读写 XLSX、CSV、ODS，支持 Schema 校验、流式处理、Tree Shaking。纯 TypeScript，全平台运行。
      </p>
      <p class="page-hero__hint">
        安装：<code>npm install hucre</code>　|　仓库：<a href="https://github.com/productdevbook/hucre" target="_blank" rel="noopener">github.com/productdevbook/hucre</a>
        　|　体积：~18 KB gzipped，零依赖
      </p>
    </header>

    <!-- Quick Start -->
    <Card id="quick-start" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">快速开始</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <pre class="code-block"><code>{{ quickStart }}</code></pre>
      </CardContent>
    </Card>

    <!-- Tree Shaking -->
    <Card id="tree-shaking" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">Tree Shaking</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <p class="muted">按需导入，只引入需要的格式模块：</p>
        <pre class="code-block"><code>{{ treeShaking }}</code></pre>
      </CardContent>
    </Card>

    <!-- High-level API -->
    <Card id="highlevel-api" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">高级 API</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <p class="muted">统一入口，自动检测格式：</p>
        <el-table :data="highlevelRows" border stripe size="small" class="doc-table">
          <el-table-column prop="name" label="函数" min-width="240" />
          <el-table-column prop="ret" label="返回值" width="180" />
          <el-table-column prop="desc" label="说明" min-width="260" />
        </el-table>
      </CardContent>
    </Card>

    <!-- XLSX API -->
    <Card id="xlsx-api" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">XLSX</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <el-table :data="xlsxRows" border stripe size="small" class="doc-table">
          <el-table-column prop="name" label="函数" min-width="280" />
          <el-table-column prop="ret" label="返回值" width="200" />
          <el-table-column prop="desc" label="说明" min-width="260" />
        </el-table>
      </CardContent>
    </Card>

    <!-- CSV API -->
    <Card id="csv-api" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">CSV</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <el-table :data="csvRows" border stripe size="small" class="doc-table">
          <el-table-column prop="name" label="函数" min-width="280" />
          <el-table-column prop="ret" label="返回值" width="180" />
          <el-table-column prop="desc" label="说明" min-width="260" />
        </el-table>
      </CardContent>
    </Card>

    <!-- Export API -->
    <Card id="export-api" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">导出</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <el-table :data="exportRows" border stripe size="small" class="doc-table">
          <el-table-column prop="name" label="函数" min-width="260" />
          <el-table-column prop="ret" label="返回值" width="120" />
          <el-table-column prop="desc" label="说明" min-width="280" />
        </el-table>
      </CardContent>
    </Card>

    <!-- WriteSheet Config -->
    <Card id="write-sheet" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">WriteSheet 配置</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <p class="muted">
          <code>writeXlsx</code> 的 <code>sheets</code> 数组每项支持以下字段：
        </p>
        <el-table :data="writeSheetFields" border stripe size="small" class="doc-table">
          <el-table-column prop="name" label="字段" width="180" />
          <el-table-column prop="type" label="类型" min-width="200" />
          <el-table-column prop="desc" label="说明" min-width="300" />
        </el-table>
        <p class="muted" style="margin-top: 14px">
          还支持：<code>images</code>（图片插入）、<code>comments</code>（批注）、<code>conditionalFormatting</code>（条件格式）、<code>namedRanges</code>（命名范围）、<code>tables</code>（Excel 表格）、<code>sparklines</code>（迷你图）、<code>pageSetup</code>（打印设置）等。
        </p>
      </CardContent>
    </Card>

    <!-- Builder API -->
    <Card id="builder-api" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">Builder API</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <p class="muted">链式调用，流畅构建 Workbook：</p>
        <pre class="code-block"><code>{{ builderExample }}</code></pre>
      </CardContent>
    </Card>

    <!-- Streaming -->
    <Card id="streaming" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">流式处理</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <p class="muted">逐行处理大文件，无需全量加载到内存：</p>
        <pre class="code-block"><code>{{ streamExample }}</code></pre>
      </CardContent>
    </Card>

    <!-- Round-trip -->
    <Card id="roundtrip" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">往返保存（Round-trip）</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <p class="muted">打开 → 修改 → 保存，保留图表、VBA、主题等 hucre 未原生处理的部分：</p>
        <pre class="code-block"><code>{{ roundtripExample }}</code></pre>
      </CardContent>
    </Card>

    <!-- Sheet Operations -->
    <Card id="sheet-ops" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">Sheet 操作</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <el-table :data="sheetOpsRows" border stripe size="small" class="doc-table">
          <el-table-column prop="name" label="函数" min-width="320" />
          <el-table-column prop="desc" label="说明" min-width="200" />
        </el-table>
      </CardContent>
    </Card>

    <!-- Utilities -->
    <Card id="utils" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">工具函数</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <el-table :data="utilRows" border stripe size="small" class="doc-table">
          <el-table-column prop="name" label="函数" min-width="320" />
          <el-table-column prop="desc" label="说明" min-width="280" />
        </el-table>
      </CardContent>
    </Card>

    <!-- Schema Validation -->
    <Card id="schema" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">Schema 校验</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <p class="muted">
          <code>validateWithSchema</code> 对导入的二维数组按 schema 进行类型转换、模式匹配和错误收集：
        </p>
        <el-table :data="schemaFieldRows" border stripe size="small" class="doc-table">
          <el-table-column prop="name" label="选项" width="160" />
          <el-table-column prop="type" label="类型" min-width="300" />
          <el-table-column prop="desc" label="说明" min-width="240" />
        </el-table>
      </CardContent>
    </Card>

    <!-- Platform Support -->
    <Card id="platform" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">平台支持</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <p class="muted">
          hucre 核心不依赖 Node.js API（fs、crypto、Buffer），全平台运行：
        </p>
        <ul class="bullet-list">
          <li>Node.js 18+ / Deno / Bun</li>
          <li>现代浏览器（Chrome、Firefox、Safari、Edge）</li>
          <li>Cloudflare Workers / Vercel Edge Functions</li>
          <li>Web Workers</li>
        </ul>
        <p class="muted" style="margin-top: 14px">
          ZIP 引擎使用 <code>CompressionStream</code> / <code>DecompressionStream</code> Web API，带纯 TS 回退。
        </p>
      </CardContent>
    </Card>

    <footer class="docs-footer">
      <router-link class="cta" :to="{ name: 'hucre-demo' }">
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
  font-size: 16px;
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
  font-size: 14px;
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
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
  color: var(--foreground);
  background: var(--muted);
  border-radius: 0;
  border: 1px solid var(--separator);

  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
      'Liberation Mono', 'Courier New', monospace;
    white-space: pre;
  }
}

.bullet-list {
  margin: 0;
  padding-left: 20px;
  font-size: 14px;
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

.docs-footer {
  padding: 32px 0 16px;
  text-align: center;
}

.cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 24px;
  font-size: 14px;
  font-weight: 400;
  font-family: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: var(--primary-foreground);
  background: var(--primary);
  border-radius: 0;
  text-decoration: none;
  transition:
    opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
}

.doc-toc {
  &__title {
    margin: 0 0 14px;
    padding-bottom: 10px;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.65px;
    text-transform: uppercase;
    color: var(--muted-foreground);
    border-bottom: 1px solid var(--border);
  }

  &__list {
    margin: 0;
    padding: 0 0 0 10px;
    list-style: none;
    border-left: 1px solid var(--border);
  }

  &__link {
    display: block;
    margin: 0;
    padding: 5px 10px;
    font-size: 13px;
    line-height: 1.5;
    color: var(--muted-foreground);
    text-decoration: none;
    border-left: 2px solid transparent;
    margin-left: -12px;
    padding-left: 12px;
    transition:
      color 0.2s,
      border-color 0.2s;

    &:hover {
      color: rgba(255, 255, 255, 0.5);
      border-left-color: rgba(255, 255, 255, 0.2);
    }
  }
}
</style>
