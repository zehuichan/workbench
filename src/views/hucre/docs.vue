<script setup lang="ts">
import { inject } from 'vue';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/card';
import CodeBlock from '@/components/code-block.vue';
import { LAYOUT_RIGHT_PANEL } from '@/layouts/injection-keys';

const rightPanelMount = inject(LAYOUT_RIGHT_PANEL);

const highlevelRows = [
  {
    name: 'read(input, options?)',
    ret: 'Promise<Workbook>',
    desc: '自动检测格式（XLSX/ODS），返回 Workbook',
  },
  {
    name: 'write(options)',
    ret: 'Promise<Uint8Array>',
    desc: '写入 XLSX 或 ODS（通过 format 选项控制）',
  },
  {
    name: 'readObjects(input, options?)',
    ret: 'Promise<T[]>',
    desc: '文件 → 对象数组（首行为表头）',
  },
  {
    name: 'writeObjects(data, options?)',
    ret: 'Promise<Uint8Array>',
    desc: '对象数组 → XLSX/ODS',
  },
];

const xlsxRows = [
  {
    name: 'readXlsx(input, options?)',
    ret: 'Promise<Workbook>',
    desc: '解析 XLSX（Uint8Array | ArrayBuffer）',
  },
  { name: 'writeXlsx(options)', ret: 'Promise<Uint8Array>', desc: '生成 XLSX' },
  {
    name: 'openXlsx(input, options?)',
    ret: 'Promise<RoundtripWorkbook>',
    desc: '打开以进行往返修改（保留未知部分）',
  },
  {
    name: 'saveXlsx(workbook)',
    ret: 'Promise<Uint8Array>',
    desc: '保存往返 Workbook 为 XLSX',
  },
  {
    name: 'streamXlsxRows(input, options?)',
    ret: 'AsyncGenerator<StreamRow>',
    desc: '逐行流式读取',
  },
  { name: 'XlsxStreamWriter', ret: 'class', desc: '逐行流式写入' },
  {
    name: 'hashSheetPassword(password)',
    ret: 'number',
    desc: '生成 Sheet 保护的密码哈希',
  },
];

const odsRows = [
  {
    name: 'readOds(input, options?)',
    ret: 'Promise<Workbook>',
    desc: '解析 ODS（OpenDocument 电子表格）',
  },
  {
    name: 'writeOds(options)',
    ret: 'Promise<Uint8Array>',
    desc: '生成 ODS 文件',
  },
  {
    name: 'streamOdsRows(input)',
    ret: 'AsyncGenerator<OdsStreamRow>',
    desc: '逐行流式读取 ODS',
  },
];

const csvRows = [
  {
    name: 'parseCsv(input, options?)',
    ret: 'CellValue[][]',
    desc: '解析 CSV 字符串（RFC 4180）',
  },
  {
    name: 'parseCsvObjects(input, options?)',
    ret: '{ data, headers }',
    desc: '带表头解析为对象数组',
  },
  {
    name: 'writeCsv(rows, options?)',
    ret: 'string',
    desc: '二维数组 → CSV 字符串',
  },
  {
    name: 'writeCsvObjects(data, options?)',
    ret: 'string',
    desc: '对象数组 → CSV',
  },
  {
    name: 'writeTsv(rows, options?)',
    ret: 'string',
    desc: '二维数组 → TSV 字符串（Tab 分隔）',
  },
  {
    name: 'writeTsvObjects(data, options?)',
    ret: 'string',
    desc: '对象数组 → TSV',
  },
  { name: 'detectDelimiter(input)', ret: 'string', desc: '自动检测分隔符' },
  {
    name: 'streamCsvRows(input, options?)',
    ret: 'Generator',
    desc: '流式逐行读取 CSV',
  },
  { name: 'CsvStreamWriter', ret: 'class', desc: '增量流式写入 CSV' },
  {
    name: 'fetchCsv(url, options?)',
    ret: 'Promise',
    desc: '从 URL 获取并解析 CSV',
  },
  {
    name: 'formatCsvValue(value)',
    ret: 'string',
    desc: '将单个值格式化为 CSV 安全字符串',
  },
  { name: 'stripBom(input)', ret: 'string', desc: '移除字符串开头的 BOM 标记' },
];

const exportRows = [
  {
    name: 'toHtml(sheet, options?)',
    ret: 'string',
    desc: 'HTML <table>，支持样式、无障碍、caption',
  },
  {
    name: 'toMarkdown(sheet, options?)',
    ret: 'string',
    desc: 'Markdown 表格，自动对齐，支持截断',
  },
  {
    name: 'toJson(sheet, options?)',
    ret: 'string',
    desc: 'JSON（objects / arrays / columns 格式）',
  },
  {
    name: 'fromHtml(html, options?)',
    ret: 'Sheet',
    desc: '解析 HTML table → Sheet（支持 colspan/rowspan）',
  },
];

const sheetOpsRows = [
  {
    name: 'insertRows(sheet, index, count)',
    desc: '插入行，自动更新合并、验证、条件规则等',
  },
  {
    name: 'deleteRows(sheet, index, count)',
    desc: '删除行，调整部分重叠的合并区域',
  },
  {
    name: 'insertColumns(sheet, index, count)',
    desc: '插入列，自动更新相关引用',
  },
  {
    name: 'deleteColumns(sheet, index, count)',
    desc: '删除列，自动更新相关引用',
  },
  { name: 'moveRows(sheet, from, count, to)', desc: '移动行到指定位置' },
  { name: 'hideRows(sheet, start, count, hidden?)', desc: '隐藏/取消隐藏行' },
  {
    name: 'hideColumns(sheet, start, count, hidden?)',
    desc: '隐藏/取消隐藏列',
  },
  {
    name: 'groupRows(sheet, start, end, level?)',
    desc: '设置行大纲级别（分组）',
  },
  {
    name: 'cloneSheet(sheet, name)',
    desc: '深拷贝 sheet（数据、样式、合并等）',
  },
  {
    name: 'copySheetToWorkbook(sheet, wb, name?)',
    desc: '复制 sheet 到另一个 workbook',
  },
  {
    name: 'copyRange(sheet, source, target)',
    desc: '在同一 sheet 内复制单元格范围',
  },
  { name: 'moveSheet(wb, from, to)', desc: '调整 sheet 顺序' },
  { name: 'removeSheet(wb, index)', desc: '从 workbook 移除 sheet' },
  { name: 'sortRows(sheet, col, order?)', desc: '按列排序（null 排在最后）' },
  { name: 'findCells(sheet, predicate)', desc: '按值或函数查找单元格' },
  {
    name: 'replaceCells(sheet, find, replace)',
    desc: '查找替换（支持 RegExp）',
  },
];

const utilRows = [
  {
    name: 'formatValue(value, numFmt, options?)',
    desc: '应用 Excel 数字格式（支持 locale）',
  },
  {
    name: 'validateWithSchema(rows, schema, options?)',
    desc: '按 schema 校验和类型转换',
  },
  { name: 'serialToDate(serial, is1904?)', desc: 'Excel 序列号 → Date (UTC)' },
  { name: 'dateToSerial(date, is1904?)', desc: 'Date → Excel 序列号' },
  {
    name: 'serialToTime(serial)',
    desc: '序列号小数部分 → { hours, minutes, seconds, milliseconds }',
  },
  { name: 'timeToSerial(h, m, s?, ms?)', desc: '时间分量 → Excel 序列号小数' },
  {
    name: 'parseDate(value)',
    desc: '解析日期字符串 → Date（支持 ISO 8601 及常见格式）',
  },
  { name: 'isDateFormat(numFmt)', desc: '判断格式串是否为日期格式' },
  { name: 'formatDate(date, format)', desc: '按 Excel 格式串格式化日期' },
  { name: 'parseCellRef(ref)', desc: '"AA15" → { row: 14, col: 26 }' },
  { name: 'cellRef(row, col)', desc: '(14, 26) → "AA15"' },
  { name: 'colToLetter(col)', desc: '26 → "AA"' },
  { name: 'letterToCol(letter)', desc: '"AA" → 26（colToLetter 的逆操作）' },
  { name: 'rangeRef(r1, c1, r2, c2)', desc: '(0,0,9,3) → "A1:D10"' },
  {
    name: 'parseRange(range)',
    desc: '"A1:D10" → { startRow, startCol, endRow, endCol }',
  },
  { name: 'isInRange(row, col, range)', desc: '判断单元格是否在范围内' },
  { name: 'r1c1ToA1(formula, row, col)', desc: 'R1C1 引用 → A1 引用' },
  { name: 'a1ToR1C1(formula, row?, col?)', desc: 'A1 引用 → R1C1 引用' },
  { name: 'measureValueWidth(value, numFmt?)', desc: '计算单元格值的显示宽度' },
  {
    name: 'calculateColumnWidth(values, options?)',
    desc: '计算最优列宽（字体感知）',
  },
  {
    name: 'calculateRowHeight(values, options?)',
    desc: '计算最优行高（文本换行感知）',
  },
  {
    name: 'imageFromBase64(base64, type, anchor)',
    desc: '从 Base64 创建 SheetImage',
  },
  {
    name: 'sheetToObjects(sheet, options?)',
    desc: 'Sheet → 对象数组（首行为表头）',
  },
  { name: 'sheetToArrays(sheet)', desc: 'Sheet → { headers, data }' },
];

const workerRows = [
  {
    name: 'serializeWorkbook(wb)',
    ret: 'SerializedWorkbook',
    desc: '序列化 Workbook 以便 postMessage 传输',
  },
  {
    name: 'deserializeWorkbook(data)',
    ret: 'Workbook',
    desc: '反序列化还原 Workbook',
  },
  {
    name: 'WORKER_SAFE_FUNCTIONS',
    ret: 'string[]',
    desc: '所有可在 Web Worker 中安全调用的函数列表',
  },
];

const writeSheetFields = [
  { name: 'name', type: 'string', desc: 'Sheet 名称' },
  {
    name: 'columns',
    type: 'ColumnDef[]',
    desc: '列定义（header、key、width、numFmt、autoWidth 等）',
  },
  { name: 'data', type: 'T[]', desc: '对象数组数据（配合 columns.key 使用）' },
  {
    name: 'rows',
    type: 'CellValue[][]',
    desc: '二维数组数据（与 data 二选一）',
  },
  { name: 'freezePane', type: '{ rows?, columns? }', desc: '冻结行/列' },
  { name: 'autoFilter', type: '{ range }', desc: '自动筛选范围' },
  { name: 'merges', type: 'MergeRange[]', desc: '合并单元格' },
  { name: 'dataValidations', type: 'DataValidation[]', desc: '数据验证规则' },
  {
    name: 'cells',
    type: 'Map<string, Cell>',
    desc: '单元格级别覆盖（key 为 "row,col"）',
  },
  {
    name: 'images',
    type: 'SheetImage[]',
    desc: '插入图片（PNG/JPEG/GIF/SVG/WebP）',
  },
  { name: 'protection', type: 'SheetProtection', desc: 'Sheet 保护' },
];

const schemaFieldRows = [
  {
    name: 'type',
    type: '"string" | "number" | "integer" | "boolean" | "date"',
    desc: '目标类型（带自动转换）',
  },
  { name: 'required', type: 'boolean', desc: '拒绝 null/空值' },
  { name: 'pattern', type: 'RegExp', desc: '正则校验（字符串）' },
  {
    name: 'min / max',
    type: 'number',
    desc: '最小/最大值（数字）或长度（字符串）',
  },
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
import { parseCsv, writeCsv, writeTsv } from 'hucre/csv';

// ODS only
import { readOds, writeOds, streamOdsRows } from 'hucre/ods';

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

const templateExample = `import { openXlsx, saveXlsx, fillTemplate } from 'hucre';

// 打开包含 {{占位符}} 的模板
const workbook = await openXlsx(templateBuffer);

// 用数据填充占位符
const filled = fillTemplate(workbook, {
  company: 'Acme 科技',
  total: 12500,
  date: new Date('2026-04-12'),
});

// 保存填充后的文件
const output = await saveXlsx(filled);`;

const workerExample = `import { serializeWorkbook, deserializeWorkbook } from 'hucre';

// 主线程 → Worker：序列化以便 postMessage 传输
const serialized = serializeWorkbook(workbook);
worker.postMessage(serialized);

// Worker → 主线程：反序列化还原
worker.onmessage = (e) => {
  const wb = deserializeWorkbook(e.data);
  console.log(wb.sheets[0].rows);
};`;

const odsExample = `import { readOds, writeOds, streamOdsRows } from 'hucre/ods';

// 读取 ODS
const wb = await readOds(buffer);
console.log(wb.sheets[0].rows);

// 写入 ODS
const ods = await writeOds({
  sheets: [{ name: 'Sheet1', rows: [['Hello', 42]] }],
});

// 流式逐行读取
for await (const row of streamOdsRows(buffer)) {
  console.log(row.index, row.values);
}`;

const tocItems = [
  { id: 'quick-start', label: '快速开始' },
  { id: 'tree-shaking', label: 'Tree Shaking' },
  { id: 'highlevel-api', label: '高级 API' },
  { id: 'xlsx-api', label: 'XLSX' },
  { id: 'ods-api', label: 'ODS' },
  { id: 'csv-api', label: 'CSV' },
  { id: 'export-api', label: '导出' },
  { id: 'write-sheet', label: 'WriteSheet 配置' },
  { id: 'builder-api', label: 'Builder API' },
  { id: 'template-api', label: '模板引擎' },
  { id: 'streaming', label: '流式处理' },
  { id: 'roundtrip', label: '往返保存' },
  { id: 'sheet-ops', label: 'Sheet 操作' },
  { id: 'utils', label: '工具函数' },
  { id: 'schema', label: 'Schema 校验' },
  { id: 'worker-api', label: 'Web Worker' },
  { id: 'platform', label: '平台支持' },
] as const;

const DOC_ANCHOR_OFFSET = 72;

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
      <h1 class="page-hero__title">hucre</h1>
      <p class="page-hero__lead">
        零依赖电子表格引擎。读写 XLSX、CSV、ODS，支持模板引擎、Schema
        校验、流式处理、往返保存、Web Worker、Tree Shaking。纯
        TypeScript，全平台运行。
      </p>
      <p class="page-hero__hint">
        安装：<code>npm install hucre</code>　|　仓库：<a
          href="https://github.com/productdevbook/hucre"
          target="_blank"
          rel="noopener"
          >github.com/productdevbook/hucre</a
        >
        　|　体积：~37 KB gzipped，零依赖
      </p>
    </header>

    <!-- Quick Start -->
    <Card id="quick-start" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">快速开始</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <CodeBlock :code="quickStart" />
      </CardContent>
    </Card>

    <!-- Tree Shaking -->
    <Card id="tree-shaking" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">Tree Shaking</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <p class="muted">按需导入，只引入需要的格式模块：</p>
        <CodeBlock :code="treeShaking" />
      </CardContent>
    </Card>

    <!-- High-level API -->
    <Card id="highlevel-api" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">高级 API</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <p class="muted">统一入口，自动检测格式：</p>
        <el-table
          :data="highlevelRows"
          border
          stripe
          size="small"
          class="doc-table"
        >
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

    <!-- ODS API -->
    <Card id="ods-api" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">ODS</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <p class="muted">
          OpenDocument 电子表格格式（LibreOffice / OpenOffice）：
        </p>
        <el-table :data="odsRows" border stripe size="small" class="doc-table">
          <el-table-column prop="name" label="函数" min-width="280" />
          <el-table-column prop="ret" label="返回值" width="220" />
          <el-table-column prop="desc" label="说明" min-width="260" />
        </el-table>
        <CodeBlock :code="odsExample" style="margin-top: 16px" />
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
        <el-table
          :data="exportRows"
          border
          stripe
          size="small"
          class="doc-table"
        >
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
        <el-table
          :data="writeSheetFields"
          border
          stripe
          size="small"
          class="doc-table"
        >
          <el-table-column prop="name" label="字段" width="180" />
          <el-table-column prop="type" label="类型" min-width="200" />
          <el-table-column prop="desc" label="说明" min-width="300" />
        </el-table>
        <p class="muted" style="margin-top: 14px">
          还支持：<code>images</code>（图片插入）、<code>comments</code>（批注）、<code>conditionalFormatting</code>（条件格式）、<code>namedRanges</code>（命名范围）、<code>tables</code>（Excel
          表格）、<code>sparklines</code>（迷你图）、<code>pageSetup</code>（打印设置）等。
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
        <CodeBlock :code="builderExample" />
      </CardContent>
    </Card>

    <!-- Template Engine -->
    <Card id="template-api" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">模板引擎</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <p class="muted">
          在 XLSX 中使用 <code v-pre>{{ key }}</code> 占位符，用
          <code>fillTemplate</code> 将数据填入模板。
          当单元格仅包含单个占位符且替换值为非字符串类型时，保留原始类型：
        </p>
        <CodeBlock :code="templateExample" />
      </CardContent>
    </Card>

    <!-- Streaming -->
    <Card id="streaming" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">流式处理</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <p class="muted">逐行处理大文件，无需全量加载到内存：</p>
        <CodeBlock :code="streamExample" />
      </CardContent>
    </Card>

    <!-- Round-trip -->
    <Card id="roundtrip" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">往返保存（Round-trip）</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <p class="muted">
          打开 → 修改 → 保存，保留图表、VBA、主题等 hucre 未原生处理的部分：
        </p>
        <CodeBlock :code="roundtripExample" />
      </CardContent>
    </Card>

    <!-- Sheet Operations -->
    <Card id="sheet-ops" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">Sheet 操作</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <el-table
          :data="sheetOpsRows"
          border
          stripe
          size="small"
          class="doc-table"
        >
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
          <code>validateWithSchema</code> 对导入的二维数组按 schema
          进行类型转换、模式匹配和错误收集：
        </p>
        <el-table
          :data="schemaFieldRows"
          border
          stripe
          size="small"
          class="doc-table"
        >
          <el-table-column prop="name" label="选项" width="160" />
          <el-table-column prop="type" label="类型" min-width="300" />
          <el-table-column prop="desc" label="说明" min-width="240" />
        </el-table>
      </CardContent>
    </Card>

    <!-- Web Worker -->
    <Card id="worker-api" class="doc-section rounded-sm">
      <CardHeader class="doc-section__header">
        <CardTitle class="card-title">Web Worker</CardTitle>
      </CardHeader>
      <CardContent class="doc-section__body">
        <p class="muted">
          hucre 所有核心函数均可在 Web Worker
          中安全运行。序列化辅助函数可用于跨线程传输 Workbook：
        </p>
        <el-table
          :data="workerRows"
          border
          stripe
          size="small"
          class="doc-table"
        >
          <el-table-column prop="name" label="函数" min-width="280" />
          <el-table-column prop="ret" label="返回值" width="200" />
          <el-table-column prop="desc" label="说明" min-width="280" />
        </el-table>
        <CodeBlock :code="workerExample" style="margin-top: 16px" />
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
          ZIP 引擎使用 <code>CompressionStream</code> /
          <code>DecompressionStream</code> Web API，带纯 TS 回退。
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
