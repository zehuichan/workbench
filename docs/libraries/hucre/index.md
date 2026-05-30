---
title: hucre
description: 零依赖电子表格引擎（XLSX / CSV / ODS）
---

# hucre

零依赖电子表格引擎。读写 XLSX、CSV、ODS，支持模板引擎、Schema 校验、流式处理、往返保存、Web Worker、Tree Shaking。纯 TypeScript，全平台运行。

> 安装：`npm install hucre`　|　仓库：[github.com/productdevbook/hucre](https://github.com/productdevbook/hucre)　|　体积：~37 KB gzipped，零依赖

## 交互示例

体验 hucre 的读写、导出、工具函数与校验能力。

<demo src="./demo/playground.vue" description="导出 XLSX/CSV/TSV、导入文件/文本、导出预览、工具函数、模板引擎与 Schema 校验。">hucre 综合示例</demo>

## 快速开始

```ts
import { readXlsx, writeXlsx } from 'hucre';

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
});
```

## Tree Shaking

按需导入，只引入需要的格式模块：

```ts
// XLSX only (~14 KB gzipped)
import { readXlsx, writeXlsx } from 'hucre/xlsx';

// CSV only (~2 KB gzipped)
import { parseCsv, writeCsv, writeTsv } from 'hucre/csv';

// ODS only
import { readOds, writeOds, streamOdsRows } from 'hucre/ods';

// 统一 API（自动检测格式）
import { read, write, readObjects, writeObjects } from 'hucre';
```

## 高级 API

统一入口，自动检测格式：

| 函数 | 返回值 | 说明 |
| --- | --- | --- |
| `read(input, options?)` | `Promise<Workbook>` | 自动检测格式（XLSX/ODS），返回 Workbook |
| `write(options)` | `Promise<Uint8Array>` | 写入 XLSX 或 ODS（通过 format 选项控制） |
| `readObjects(input, options?)` | `Promise<T[]>` | 文件 → 对象数组（首行为表头） |
| `writeObjects(data, options?)` | `Promise<Uint8Array>` | 对象数组 → XLSX/ODS |

## XLSX

| 函数 | 返回值 | 说明 |
| --- | --- | --- |
| `readXlsx(input, options?)` | `Promise<Workbook>` | 解析 XLSX（Uint8Array \| ArrayBuffer） |
| `writeXlsx(options)` | `Promise<Uint8Array>` | 生成 XLSX |
| `openXlsx(input, options?)` | `Promise<RoundtripWorkbook>` | 打开以进行往返修改（保留未知部分） |
| `saveXlsx(workbook)` | `Promise<Uint8Array>` | 保存往返 Workbook 为 XLSX |
| `streamXlsxRows(input, options?)` | `AsyncGenerator<StreamRow>` | 逐行流式读取 |
| `XlsxStreamWriter` | `class` | 逐行流式写入 |
| `hashSheetPassword(password)` | `number` | 生成 Sheet 保护的密码哈希 |

## ODS

OpenDocument 电子表格格式（LibreOffice / OpenOffice）：

| 函数 | 返回值 | 说明 |
| --- | --- | --- |
| `readOds(input, options?)` | `Promise<Workbook>` | 解析 ODS |
| `writeOds(options)` | `Promise<Uint8Array>` | 生成 ODS 文件 |
| `streamOdsRows(input)` | `AsyncGenerator<OdsStreamRow>` | 逐行流式读取 ODS |

```ts
import { readOds, writeOds, streamOdsRows } from 'hucre/ods';

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
}
```

## CSV

| 函数 | 返回值 | 说明 |
| --- | --- | --- |
| `parseCsv(input, options?)` | `CellValue[][]` | 解析 CSV 字符串（RFC 4180） |
| `parseCsvObjects(input, options?)` | `{ data, headers }` | 带表头解析为对象数组 |
| `writeCsv(rows, options?)` | `string` | 二维数组 → CSV 字符串 |
| `writeCsvObjects(data, options?)` | `string` | 对象数组 → CSV |
| `writeTsv(rows, options?)` | `string` | 二维数组 → TSV 字符串（Tab 分隔） |
| `writeTsvObjects(data, options?)` | `string` | 对象数组 → TSV |
| `detectDelimiter(input)` | `string` | 自动检测分隔符 |
| `streamCsvRows(input, options?)` | `Generator` | 流式逐行读取 CSV |
| `CsvStreamWriter` | `class` | 增量流式写入 CSV |
| `fetchCsv(url, options?)` | `Promise` | 从 URL 获取并解析 CSV |
| `formatCsvValue(value)` | `string` | 将单个值格式化为 CSV 安全字符串 |
| `stripBom(input)` | `string` | 移除字符串开头的 BOM 标记 |

## 导出

| 函数 | 返回值 | 说明 |
| --- | --- | --- |
| `toHtml(sheet, options?)` | `string` | HTML `<table>`，支持样式、无障碍、caption |
| `toMarkdown(sheet, options?)` | `string` | Markdown 表格，自动对齐，支持截断 |
| `toJson(sheet, options?)` | `string` | JSON（objects / arrays / columns 格式） |
| `fromHtml(html, options?)` | `Sheet` | 解析 HTML table → Sheet（支持 colspan/rowspan） |

## WriteSheet 配置

`writeXlsx` 的 `sheets` 数组每项支持以下字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `name` | `string` | Sheet 名称 |
| `columns` | `ColumnDef[]` | 列定义（header、key、width、numFmt、autoWidth 等） |
| `data` | `T[]` | 对象数组数据（配合 columns.key 使用） |
| `rows` | `CellValue[][]` | 二维数组数据（与 data 二选一） |
| `freezePane` | `{ rows?, columns? }` | 冻结行/列 |
| `autoFilter` | `{ range }` | 自动筛选范围 |
| `merges` | `MergeRange[]` | 合并单元格 |
| `dataValidations` | `DataValidation[]` | 数据验证规则 |
| `cells` | `Map<string, Cell>` | 单元格级别覆盖（key 为 "row,col"） |
| `images` | `SheetImage[]` | 插入图片（PNG/JPEG/GIF/SVG/WebP） |
| `protection` | `SheetProtection` | Sheet 保护 |

还支持：`comments`（批注）、`conditionalFormatting`（条件格式）、`namedRanges`（命名范围）、`tables`（Excel 表格）、`sparklines`（迷你图）、`pageSetup`（打印设置）等。

## Builder API

链式调用，流畅构建 Workbook：

```ts
import { WorkbookBuilder } from 'hucre';

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
  .build();
```

## 模板引擎

在 XLSX 中使用 <code v-pre>{{ key }}</code> 占位符，用 `fillTemplate` 将数据填入模板。当单元格仅包含单个占位符且替换值为非字符串类型时，保留原始类型：

```ts
import { openXlsx, saveXlsx, fillTemplate } from 'hucre';

// 打开包含 {{占位符}} 的模板
const workbook = await openXlsx(templateBuffer);

// 用数据填充占位符
const filled = fillTemplate(workbook, {
  company: 'Acme 科技',
  total: 12500,
  date: new Date('2026-04-12'),
});

// 保存填充后的文件
const output = await saveXlsx(filled);
```

## 流式处理

逐行处理大文件，无需全量加载到内存：

```ts
import { streamXlsxRows, XlsxStreamWriter } from 'hucre/xlsx';

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
const buffer = await writer.finish();
```

## 往返保存（Round-trip）

打开 → 修改 → 保存，保留图表、VBA、主题等 hucre 未原生处理的部分：

```ts
import { openXlsx, saveXlsx } from 'hucre/xlsx';

const workbook = await openXlsx(buffer);
workbook.sheets[0].rows[0][0] = 'Updated!';
const output = await saveXlsx(workbook);
```

## Sheet 操作

| 函数 | 说明 |
| --- | --- |
| `insertRows(sheet, index, count)` | 插入行，自动更新合并、验证、条件规则等 |
| `deleteRows(sheet, index, count)` | 删除行，调整部分重叠的合并区域 |
| `insertColumns(sheet, index, count)` | 插入列，自动更新相关引用 |
| `deleteColumns(sheet, index, count)` | 删除列，自动更新相关引用 |
| `moveRows(sheet, from, count, to)` | 移动行到指定位置 |
| `hideRows(sheet, start, count, hidden?)` | 隐藏/取消隐藏行 |
| `hideColumns(sheet, start, count, hidden?)` | 隐藏/取消隐藏列 |
| `groupRows(sheet, start, end, level?)` | 设置行大纲级别（分组） |
| `cloneSheet(sheet, name)` | 深拷贝 sheet（数据、样式、合并等） |
| `copySheetToWorkbook(sheet, wb, name?)` | 复制 sheet 到另一个 workbook |
| `copyRange(sheet, source, target)` | 在同一 sheet 内复制单元格范围 |
| `moveSheet(wb, from, to)` | 调整 sheet 顺序 |
| `removeSheet(wb, index)` | 从 workbook 移除 sheet |
| `sortRows(sheet, col, order?)` | 按列排序（null 排在最后） |
| `findCells(sheet, predicate)` | 按值或函数查找单元格 |
| `replaceCells(sheet, find, replace)` | 查找替换（支持 RegExp） |

## 工具函数

| 函数 | 说明 |
| --- | --- |
| `formatValue(value, numFmt, options?)` | 应用 Excel 数字格式（支持 locale） |
| `validateWithSchema(rows, schema, options?)` | 按 schema 校验和类型转换 |
| `serialToDate(serial, is1904?)` | Excel 序列号 → Date (UTC) |
| `dateToSerial(date, is1904?)` | Date → Excel 序列号 |
| `serialToTime(serial)` | 序列号小数部分 → { hours, minutes, seconds, milliseconds } |
| `timeToSerial(h, m, s?, ms?)` | 时间分量 → Excel 序列号小数 |
| `parseDate(value)` | 解析日期字符串 → Date（支持 ISO 8601 及常见格式） |
| `parseCellRef(ref)` | "AA15" → { row: 14, col: 26 } |
| `cellRef(row, col)` | (14, 26) → "AA15" |
| `colToLetter(col)` / `letterToCol(letter)` | 列序号与字母互转 |
| `rangeRef(r1, c1, r2, c2)` / `parseRange(range)` | 范围引用与对象互转 |
| `isInRange(row, col, range)` | 判断单元格是否在范围内 |
| `calculateColumnWidth(values, options?)` | 计算最优列宽（字体感知） |
| `sheetToObjects(sheet, options?)` / `sheetToArrays(sheet)` | Sheet 与对象/二维数组互转 |

## Schema 校验

`validateWithSchema` 对导入的二维数组按 schema 进行类型转换、模式匹配和错误收集：

| 选项 | 类型 | 说明 |
| --- | --- | --- |
| `type` | `"string" \| "number" \| "integer" \| "boolean" \| "date"` | 目标类型（带自动转换） |
| `required` | `boolean` | 拒绝 null/空值 |
| `pattern` | `RegExp` | 正则校验（字符串） |
| `min` / `max` | `number` | 最小/最大值（数字）或长度（字符串） |
| `enum` | `unknown[]` | 允许的值列表 |
| `default` | `unknown` | null/空时的默认值 |
| `validate` | `(v) => boolean \| string` | 自定义校验函数 |
| `transform` | `(v) => unknown` | 校验后转换 |

## Web Worker

hucre 所有核心函数均可在 Web Worker 中安全运行。序列化辅助函数可用于跨线程传输 Workbook：

| 函数 | 返回值 | 说明 |
| --- | --- | --- |
| `serializeWorkbook(wb)` | `SerializedWorkbook` | 序列化 Workbook 以便 postMessage 传输 |
| `deserializeWorkbook(data)` | `Workbook` | 反序列化还原 Workbook |
| `WORKER_SAFE_FUNCTIONS` | `string[]` | 所有可在 Web Worker 中安全调用的函数列表 |

## 平台支持

hucre 核心不依赖 Node.js API（fs、crypto、Buffer），全平台运行：

- Node.js 18+ / Deno / Bun
- 现代浏览器（Chrome、Firefox、Safari、Edge）
- Cloudflare Workers / Vercel Edge Functions
- Web Workers

ZIP 引擎使用 `CompressionStream` / `DecompressionStream` Web API，带纯 TS 回退。
