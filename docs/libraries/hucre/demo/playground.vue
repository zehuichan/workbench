<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue';
import { ElMessage } from 'element-plus';
import { parseCsv, writeCsv } from 'hucre/csv';
import {
  cellRef,
  colToLetter,
  openXlsx,
  parseCellRef,
  rangeRef,
  readXlsx,
  writeXlsx,
} from 'hucre/xlsx';
import {
  WorkbookBuilder,
  dateToSerial,
  fillTemplate,
  formatValue,
  isInRange,
  letterToCol,
  parseDate,
  parseRange,
  serialToDate,
  serialToTime,
  sheetToArrays,
  sheetToObjects,
  timeToSerial,
  toHtml,
  toJson,
  toMarkdown,
  validateWithSchema,
  writeTsv,
} from 'hucre';

interface Product {
  name: string;
  category: string;
  price: number;
  stock: number;
  active: boolean;
  date: string;
}

const sampleProducts: Product[] = [
  { name: 'Widget Pro', category: '配件', price: 29.99, stock: 142, active: true, date: '2026-01-15' },
  { name: 'Gadget X', category: '电子', price: 89.5, stock: 67, active: true, date: '2026-02-20' },
  { name: 'Bolt Set', category: '硬件', price: 5.25, stock: 530, active: false, date: '2026-01-05' },
  { name: 'Cable Pack', category: '配件', price: 12.0, stock: 0, active: false, date: '2025-12-01' },
  { name: 'Sensor V2', category: '电子', price: 45.0, stock: 213, active: true, date: '2026-03-10' },
  { name: 'Frame Kit', category: '硬件', price: 78.0, stock: 34, active: true, date: '2026-04-01' },
];

const tableData = ref<Product[]>([...sampleProducts]);
const exportFormat = ref<'xlsx' | 'csv' | 'tsv'>('xlsx');
const importMode = ref<'file' | 'csv-text'>('file');
const csvInput = ref(`Name,Price,Stock\nWidget,9.99,142\nGadget,24.50,87`);
const exportLog = ref('—');

// ── Read / Import ──

const fileInputRef = ref<HTMLInputElement | null>(null);
const importedData = shallowRef<Record<string, unknown>[]>([]);
const importedHeaders = ref<string[]>([]);
const headerRowMode = ref<'auto' | 'manual' | 'none'>('auto');
const manualHeaderRow = ref(1);
const importSheetIndex = ref(0);
const importSheetNames = ref<string[]>([]);
const lastWorkbook = shallowRef<{ sheets: { name: string; rows: unknown[][]; merges?: MergeRange[] }[] } | null>(null);

function triggerFileInput() {
  fileInputRef.value?.click();
}

interface MergeRange {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

function resolveSheetHeaders(
  rows: unknown[][],
  merges?: MergeRange[],
) {
  const colCount = Math.max(...rows.map((r) => r.length));
  const isEmpty = (v: unknown) => v == null || v === '';
  const nonNullCount = (row: unknown[]) => row.filter((v) => !isEmpty(v)).length;

  const fullWidthRows = new Set<number>();
  if (merges) {
    for (const m of merges) {
      if (m.startCol === 0 && m.endCol >= colCount - 1)
        for (let r = m.startRow; r <= m.endRow; r++) fullWidthRows.add(r);
    }
  }

  let headerStart = -1;
  for (let i = 0; i < rows.length; i++) {
    if (fullWidthRows.has(i)) continue;
    const nnc = nonNullCount(rows[i]);
    if (nnc >= 2 && (nnc >= 3 || nnc / (colCount || 1) >= 0.15)) {
      headerStart = i;
      break;
    }
  }
  if (headerStart === -1) return { headers: [] as string[], dataStart: 0 };

  let headerEnd = headerStart;
  const next = rows[headerStart + 1];
  if (next) {
    let curEmpty = 0;
    let filledByNext = 0;
    for (let c = 0; c < colCount; c++) {
      if (isEmpty(rows[headerStart][c])) {
        curEmpty++;
        if (!isEmpty(next[c])) filledByNext++;
      }
    }
    if (curEmpty > colCount * 0.3 && filledByNext > curEmpty * 0.4)
      headerEnd = headerStart + 1;
  }

  const expanded = rows.slice(headerStart, headerEnd + 1).map((r) => [...r]);
  if (merges) {
    for (const m of merges) {
      if (m.startRow > headerEnd || m.endRow < headerStart) continue;
      const val = rows[m.startRow]?.[m.startCol];
      if (isEmpty(val)) continue;
      for (let r = Math.max(m.startRow, headerStart); r <= Math.min(m.endRow, headerEnd); r++) {
        for (let c = m.startCol; c <= m.endCol; c++) {
          expanded[r - headerStart][c] = val;
        }
      }
    }
  }

  const merged: string[] = [];
  for (let c = 0; c < colCount; c++) {
    let sub: unknown = null;
    let group: unknown = null;
    for (let r = expanded.length - 1; r >= 0; r--) {
      const cell = expanded[r][c];
      if (!isEmpty(cell)) {
        if (!sub) sub = cell;
        else if (String(cell) !== String(sub)) { group = cell; break; }
      }
    }
    if (sub) {
      merged.push(group ? `${group}-${sub}` : String(sub));
    } else {
      merged.push(`列${c + 1}`);
    }
  }

  const seen = new Map<string, number>();
  const headers = merged.map((h) => {
    const count = seen.get(h) ?? 0;
    seen.set(h, count + 1);
    return count > 0 ? `${h}_${count}` : h;
  });

  return { headers, dataStart: headerEnd + 1 };
}

function displayImportCell(v: unknown): string {
  if (v == null) return 'null';
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}

function buildImportTable(sheet: { rows: unknown[][]; merges?: MergeRange[] }) {
  const rows = sheet.rows;
  if (!rows?.length) {
    importedHeaders.value = [];
    importedData.value = [];
    ElMessage.warning('未读取到数据');
    return;
  }

  let headers: string[];
  let dataStart: number;

  if (headerRowMode.value === 'none') {
    const colCount = Math.max(...rows.map((r) => r.length));
    headers = Array.from({ length: colCount }, (_, i) => `列 ${i + 1}`);
    dataStart = 0;
  } else if (headerRowMode.value === 'manual') {
    const idx = manualHeaderRow.value - 1;
    if (idx < 0 || idx >= rows.length) {
      ElMessage.warning('表头行号超出范围');
      return;
    }
    const colCount = Math.max(...rows.map((r) => r.length));
    headers = (rows[idx] ?? []).map((v, i) =>
      v != null && v !== '' ? String(v) : `列 ${i + 1}`,
    );
    while (headers.length < colCount) headers.push(`列 ${headers.length + 1}`);
    dataStart = idx + 1;
  } else {
    const result = resolveSheetHeaders(rows, sheet.merges);
    headers = result.headers;
    dataStart = result.dataStart;
  }

  if (!headers.length) {
    ElMessage.warning('未识别到表头');
    return;
  }

  const data = rows.slice(dataStart)
    .filter((row) => row.some((v) => v != null && v !== ''))
    .map((row) => {
      const obj: Record<string, unknown> = {};
      headers.forEach((h, i) => { obj[h] = row[i] ?? null; });
      return obj;
    });

  importedHeaders.value = headers;
  importedData.value = data;
  ElMessage.success(`已导入 ${data.length} 行 × ${headers.length} 列`);
}

async function handleFileImport(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  try {
    const buffer = await file.arrayBuffer();
    const wb = await readXlsx(new Uint8Array(buffer));

    lastWorkbook.value = wb;
    importSheetNames.value = wb.sheets.map((s) => s.name);
    importSheetIndex.value = 0;

    buildImportTable(wb.sheets[0]);
  } catch (e) {
    ElMessage.error(`导入失败：${(e as Error).message}`);
  }
}

function onSheetChange(idx: number) {
  const wb = lastWorkbook.value;
  if (!wb || !wb.sheets[idx]) return;
  buildImportTable(wb.sheets[idx]);
}

function onHeaderModeChange() {
  const wb = lastWorkbook.value;
  if (!wb) return;
  buildImportTable(wb.sheets[importSheetIndex.value]);
}

async function handleCsvParse() {
  try {
    const rows = parseCsv(csvInput.value, { typeInference: true });
    if (!rows.length) {
      ElMessage.warning('CSV 为空');
      return;
    }

    const headers = (rows[0] ?? []).map(String);
    const data = rows.slice(1).map((row) => {
      const obj: Record<string, unknown> = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    });

    importedHeaders.value = headers;
    importedData.value = data;
    ElMessage.success(`已解析 ${data.length} 行`);
  } catch (e) {
    ElMessage.error(`解析失败：${(e as Error).message}`);
  }
}

// ── Write / Export ──

async function handleExport() {
  try {
    if (exportFormat.value === 'xlsx') {
      const buffer = await writeXlsx({
        sheets: [{
          name: '产品列表',
          columns: [
            { header: '名称', key: 'name', width: 20 },
            { header: '分类', key: 'category', width: 12 },
            { header: '价格', key: 'price', width: 12, numFmt: '¥#,##0.00' },
            { header: '库存', key: 'stock', width: 10 },
            { header: '状态', key: 'active', width: 10 },
            { header: '日期', key: 'date', width: 15 },
          ],
          data: tableData.value,
          freezePane: { rows: 1 },
          autoFilter: { range: `A1:F${tableData.value.length + 1}` },
        }],
        defaultFont: { name: 'Microsoft YaHei', size: 11 },
      });

      downloadBlob(buffer, 'hucre-demo.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      exportLog.value = `导出 XLSX：${tableData.value.length} 行，${(buffer.length / 1024).toFixed(1)} KB`;
    } else {
      const rows = [
        ['名称', '分类', '价格', '库存', '状态', '日期'],
        ...tableData.value.map((p) => [p.name, p.category, p.price, p.stock, p.active, p.date]),
      ];
      if (exportFormat.value === 'tsv') {
        const tsv = writeTsv(rows as (string | number | boolean)[][], { bom: true });
        downloadBlob(new TextEncoder().encode(tsv), 'hucre-demo.tsv', 'text/tab-separated-values;charset=utf-8');
        exportLog.value = `导出 TSV：${tableData.value.length} 行`;
      } else {
        const csv = writeCsv(rows as (string | number | boolean)[][], { bom: true });
        downloadBlob(new TextEncoder().encode(csv), 'hucre-demo.csv', 'text/csv;charset=utf-8');
        exportLog.value = `导出 CSV：${tableData.value.length} 行`;
      }
    }

    ElMessage.success('导出成功');
  } catch (e) {
    ElMessage.error(`导出失败：${(e as Error).message}`);
  }
}

async function handleBuilderExport() {
  try {
    const buffer = await WorkbookBuilder.create()
      .properties({ creator: 'hucre demo', title: '产品报表' })
      .defaultFont({ name: 'Microsoft YaHei', size: 11 })
      .addSheet('产品')
        .columns([
          { header: '名称', width: 20 },
          { header: '分类', width: 12 },
          { header: '价格', width: 12 },
          { header: '库存', width: 10 },
        ])
        .rows(tableData.value.map((p) => [p.name, p.category, p.price, p.stock]))
        .freeze(1)
      .done()
      .build();

    downloadBlob(buffer, 'hucre-builder.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    exportLog.value = `Builder API 导出：${(buffer.length / 1024).toFixed(1)} KB`;
    ElMessage.success('Builder 导出成功');
  } catch (e) {
    ElMessage.error(`导出失败：${(e as Error).message}`);
  }
}

function downloadBlob(data: Uint8Array, filename: string, mime: string) {
  const blob = new Blob([new Uint8Array(data)], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Export Preview (HTML / Markdown / JSON) ──

type PreviewMode = 'html' | 'markdown' | 'json';
const previewMode = ref<PreviewMode>('html');

const previewContent = computed(() => {
  const sheet = {
    name: 'Preview',
    rows: [
      ['名称', '分类', '价格', '库存'],
      ...tableData.value.slice(0, 5).map((p) => [p.name, p.category, p.price, p.stock]),
    ] as (string | number)[][],
  };

  switch (previewMode.value) {
    case 'html':
      return toHtml(sheet, { headerRow: true, styles: true });
    case 'markdown':
      return toMarkdown(sheet);
    case 'json':
      return JSON.stringify(toJson(sheet, { format: 'objects' }), null, 2);
    default:
      return '';
  }
});

// ── Utility Playground ──

const fmtValue = ref(1234567.89);
const fmtPattern = ref('#,##0.00');
const formattedResult = computed(() => {
  try {
    return formatValue(fmtValue.value, fmtPattern.value);
  } catch {
    return '格式错误';
  }
});

const cellRefInput = ref('C15');
const cellRefParsed = computed(() => {
  try {
    const r = parseCellRef(cellRefInput.value);
    return `row: ${r.row}, col: ${r.col}  →  colToLetter: ${colToLetter(r.col)}  →  letterToCol("${colToLetter(r.col)}"): ${letterToCol(colToLetter(r.col))}  →  cellRef: ${cellRef(r.row, r.col)}`;
  } catch {
    return '无效引用';
  }
});

const rangeResult = computed(() => rangeRef(0, 0, 9, 3));

const rangeParseInput = ref('B2:E10');
const rangeParsed = computed(() => {
  try {
    const r = parseRange(rangeParseInput.value);
    const sample = { row: r.startRow, col: r.startCol };
    const inside = isInRange(sample.row, sample.col, r);
    const outside = isInRange(r.endRow + 1, r.endCol + 1, r);
    return `startRow: ${r.startRow}, startCol: ${r.startCol}, endRow: ${r.endRow}, endCol: ${r.endCol}  |  isInRange(${sample.row},${sample.col}): ${inside}  |  isInRange(${r.endRow + 1},${r.endCol + 1}): ${outside}`;
  } catch {
    return '无效范围';
  }
});

const serialInput = ref(45307);
const serialDateResult = computed(() => {
  try {
    const d = serialToDate(serialInput.value);
    return `${d.toISOString().slice(0, 10)}  (dateToSerial → ${dateToSerial(d)})`;
  } catch {
    return '无效序列号';
  }
});

const timeSerialInput = ref(0.75);
const timeSerialResult = computed(() => {
  try {
    const t = serialToTime(timeSerialInput.value);
    return `${String(t.hours).padStart(2, '0')}:${String(t.minutes).padStart(2, '0')}:${String(t.seconds).padStart(2, '0')}  (timeToSerial → ${timeToSerial(t.hours, t.minutes, t.seconds)})`;
  } catch {
    return '无效时间序列';
  }
});

const parseDateInput = ref('2026-04-12');
const parseDateResult = computed(() => {
  try {
    const d = parseDate(parseDateInput.value);
    return d ? `${d.toISOString().slice(0, 10)}  (dateToSerial → ${dateToSerial(d)})` : '无法解析';
  } catch {
    return '解析失败';
  }
});

// ── Template Engine ──

const templateData = ref<Record<string, string | number>>({
  company: 'Acme 科技',
  date: '2026-04-12',
  total: 12500,
});

const templateResult = ref('');

async function runTemplateDemo() {
  try {
    const wb = await WorkbookBuilder.create()
      .addSheet('Report')
        .columns([
          { header: '项目', width: 20 },
          { header: '值', width: 20 },
        ])
        .rows([
          ['公司', '{{company}}'],
          ['日期', '{{date}}'],
          ['总额', '{{total}}'],
        ])
      .done()
      .build();

    const rtWb = await openXlsx(wb);
    const filled = fillTemplate(rtWb, templateData.value);

    const rows = filled.sheets[0].rows;
    const lines = rows.map((r) => r.map((c) => c ?? '').join(' → '));
    templateResult.value = lines.join('\n');
    ElMessage.success('模板填充完成');
  } catch (e) {
    templateResult.value = `模板错误：${(e as Error).message}`;
  }
}

// ── Sheet Utils ──

const sheetUtilResult = ref('');

function runSheetUtilsDemo() {
  const sheet = {
    name: 'Demo',
    rows: [
      ['名称', '分类', '价格', '库存'],
      ['Widget Pro', '配件', 29.99, 142],
      ['Gadget X', '电子', 89.5, 67],
      ['Bolt Set', '硬件', 5.25, 530],
    ] as (string | number)[][],
  };

  const objects = sheetToObjects<{ 名称: string; 分类: string; 价格: number }>(sheet);
  const arrays = sheetToArrays(sheet);

  const lines = [
    'sheetToObjects →',
    JSON.stringify(objects, null, 2),
    '',
    'sheetToArrays →',
    `headers: ${JSON.stringify(arrays.headers)}`,
    `data: ${JSON.stringify(arrays.data)}`,
  ];
  sheetUtilResult.value = lines.join('\n');
}

// ── Schema Validation ──

const validationCsv = ref(`Name,Price,Stock,Status\nWidget,9.99,142,active\nGadget,abc,87,active\n,24.50,,unknown`);
const validationResult = ref('');

function runValidation() {
  try {
    const rows = parseCsv(validationCsv.value, { typeInference: false });
    const result = validateWithSchema(rows, {
      Name: { type: 'string', required: true },
      Price: { type: 'number', required: true, min: 0 },
      Stock: { type: 'integer', min: 0, default: 0 },
      Status: { type: 'string', enum: ['active', 'inactive', 'draft'] },
    }, { headerRow: 1 });

    const lines = [`有效数据：${result.data.length} 行`];
    if (result.errors.length) {
      lines.push(`错误：${result.errors.length} 个`);
      result.errors.forEach((e) => {
        lines.push(`  行 ${e.row}: [${e.field}] ${e.message} (值="${e.value}")`);
      });
    } else {
      lines.push('无校验错误');
    }
    validationResult.value = lines.join('\n');
  } catch (e) {
    validationResult.value = `校验异常：${(e as Error).message}`;
  }
}
</script>

<template>
  <div>
    <!-- ── Data Table ── -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <div class="demo-section__head">
          <span class="demo-section__title">示例数据</span>
          <el-tag size="small" type="info" effect="plain" :disable-transitions="true">
            {{ tableData.length }} 条
          </el-tag>
        </div>
      </template>
      <el-table :data="tableData" border stripe size="small" class="demo-table">
        <el-table-column prop="name" label="名称" min-width="130" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="price" label="价格" width="100" align="right">
          <template #default="{ row }">¥ {{ row.price.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" align="right" />
        <el-table-column prop="active" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.active ? 'success' : 'info'" size="small" :disable-transitions="true">
              {{ row.active ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="日期" width="120" />
      </el-table>
    </el-card>

    <!-- ── Export ── -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <span class="demo-section__title">导出 (writeXlsx / writeCsv / writeTsv)</span>
      </template>
      <div class="demo-field-stack">
        <div class="demo-field-row">
          <span class="demo-field-label">格式</span>
          <div class="demo-field-controls">
            <el-radio-group v-model="exportFormat" size="small">
              <el-radio-button value="xlsx">XLSX</el-radio-button>
              <el-radio-button value="csv">CSV</el-radio-button>
              <el-radio-button value="tsv">TSV</el-radio-button>
            </el-radio-group>
            <el-button size="small" type="primary" @click="handleExport">导出文件</el-button>
            <el-divider direction="vertical" class="demo-field-divider" />
            <el-button size="small" @click="handleBuilderExport">Builder API 导出</el-button>
            <el-divider direction="vertical" class="demo-field-divider" />
            <span class="demo-log">{{ exportLog }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- ── Import ── -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <span class="demo-section__title">导入 (readXlsx / parseCsv)</span>
      </template>
      <div class="demo-field-stack">
        <div class="demo-field-row">
          <span class="demo-field-label">方式</span>
          <div class="demo-field-controls">
            <el-radio-group v-model="importMode" size="small">
              <el-radio-button value="file">XLSX 文件</el-radio-button>
              <el-radio-button value="csv-text">CSV 文本</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <template v-if="importMode === 'file'">
          <input ref="fileInputRef" type="file" accept=".xlsx,.xls" hidden @change="handleFileImport">
          <div class="demo-field-row">
            <span class="demo-field-label">文件</span>
            <div class="demo-field-controls">
              <el-button size="small" type="primary" @click="triggerFileInput">选择 XLSX 文件</el-button>
            </div>
          </div>
          <div class="demo-field-row">
            <span class="demo-field-label">表头</span>
            <div class="demo-field-controls">
              <el-radio-group v-model="headerRowMode" size="small" @change="onHeaderModeChange">
                <el-radio-button value="auto">自动识别</el-radio-button>
                <el-radio-button value="manual">指定行</el-radio-button>
                <el-radio-button value="none">无表头</el-radio-button>
              </el-radio-group>
              <el-input-number
                v-if="headerRowMode === 'manual'"
                v-model="manualHeaderRow"
                size="small"
                class="demo-input-number-fixed"
                :min="1"
                :max="999"
                :step="1"
                :controls="true"
                @change="onHeaderModeChange"
              />
            </div>
          </div>
          <div v-if="importSheetNames.length > 1" class="demo-field-row">
            <span class="demo-field-label">工作表</span>
            <div class="demo-field-controls">
              <el-radio-group v-model="importSheetIndex" size="small" @change="onSheetChange">
                <el-radio-button v-for="(name, i) in importSheetNames" :key="i" :value="i">
                  {{ name }}
                </el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="demo-field-row demo-field-row--block">
            <span class="demo-field-label">文本</span>
            <div class="demo-field-controls demo-field-controls--column">
              <el-input
                v-model="csvInput"
                type="textarea"
                :autosize="{ minRows: 3, maxRows: 8 }"
                placeholder="输入 CSV 文本…"
              />
              <el-button size="small" type="primary" class="demo-field-row__action" @click="handleCsvParse">
                解析
              </el-button>
            </div>
          </div>
        </template>
      </div>

      <template v-if="importedData.length">
        <el-divider />
        <div class="demo-import-native">
          <table>
            <thead>
              <tr>
                <th v-for="h in importedHeaders" :key="h">{{ h }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in importedData" :key="idx">
                <td
                  v-for="h in importedHeaders"
                  :key="`${idx}-${h}`"
                  :title="displayImportCell(row[h])"
                >
                  {{ displayImportCell(row[h]) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </el-card>

    <!-- ── Export Preview ── -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <span class="demo-section__title">导出预览 (toHtml / toMarkdown / toJson)</span>
      </template>
      <div class="demo-field-stack">
        <div class="demo-field-row">
          <span class="demo-field-label">视图</span>
          <div class="demo-field-controls">
            <el-radio-group v-model="previewMode" size="small">
              <el-radio-button value="html">HTML</el-radio-button>
              <el-radio-button value="markdown">Markdown</el-radio-button>
              <el-radio-button value="json">JSON</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </div>
      <div v-if="previewMode === 'html'" class="demo-preview-html demo-preview-body" v-html="previewContent" />
      <pre v-else class="code-block demo-preview-body"><code>{{ previewContent }}</code></pre>
    </el-card>

    <!-- ── Utility Playground ── -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <span class="demo-section__title">工具函数</span>
      </template>

      <div class="demo-util-row">
        <span class="demo-util-label">formatValue</span>
        <el-input-number v-model="fmtValue" size="small" :controls="false" class="demo-util-input" />
        <el-input v-model="fmtPattern" size="small" placeholder="格式" class="demo-util-input" style="width: 140px" />
        <span class="demo-util-result">→ {{ formattedResult }}</span>
      </div>

      <el-divider />

      <div class="demo-util-row">
        <span class="demo-util-label">parseCellRef</span>
        <el-input v-model="cellRefInput" size="small" placeholder="如 C15" class="demo-util-input" style="width: 100px" />
        <span class="demo-util-result">→ {{ cellRefParsed }}</span>
      </div>

      <div class="demo-util-row">
        <span class="demo-util-label">rangeRef(0,0,9,3)</span>
        <span class="demo-util-result">→ {{ rangeResult }}</span>
      </div>

      <div class="demo-util-row">
        <span class="demo-util-label">parseRange</span>
        <el-input v-model="rangeParseInput" size="small" placeholder="如 B2:E10" class="demo-util-input" style="width: 120px" />
        <span class="demo-util-result">→ {{ rangeParsed }}</span>
      </div>

      <el-divider />

      <div class="demo-util-row">
        <span class="demo-util-label">serialToDate</span>
        <el-input-number v-model="serialInput" size="small" :controls="false" class="demo-util-input" />
        <span class="demo-util-result">→ {{ serialDateResult }}</span>
      </div>

      <div class="demo-util-row">
        <span class="demo-util-label">serialToTime</span>
        <el-input-number v-model="timeSerialInput" size="small" :controls="false" :step="0.01" class="demo-util-input" />
        <span class="demo-util-result">→ {{ timeSerialResult }}</span>
      </div>

      <div class="demo-util-row">
        <span class="demo-util-label">parseDate</span>
        <el-input v-model="parseDateInput" size="small" placeholder="日期字符串" class="demo-util-input" style="width: 160px" />
        <span class="demo-util-result">→ {{ parseDateResult }}</span>
      </div>
    </el-card>

    <!-- ── Template Engine ── -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <span class="demo-section__title">模板引擎 (fillTemplate)</span>
      </template>
      <p class="demo-hint">在 XLSX 单元格中使用 <code v-pre>{{key}}</code> 占位符，用数据填充后导出：</p>
      <div class="demo-template-fields">
        <div v-for="(val, key) in templateData" :key="key" class="demo-util-row">
          <span class="demo-util-label">{{ key }}</span>
          <el-input v-model="templateData[key]" size="small" class="demo-util-input" />
        </div>
      </div>
      <div class="demo-field-stack demo-field-stack--follow">
        <div class="demo-field-row">
          <span class="demo-field-label">操作</span>
          <div class="demo-field-controls">
            <el-button size="small" type="primary" @click="runTemplateDemo">运行模板填充</el-button>
          </div>
        </div>
      </div>
      <pre v-if="templateResult" class="code-block" style="margin-top: 12px"><code>{{ templateResult }}</code></pre>
    </el-card>

    <!-- ── Sheet Utils ── -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <span class="demo-section__title">Sheet 工具 (sheetToObjects / sheetToArrays)</span>
      </template>
      <p class="demo-hint">将 Sheet 数据转换为对象数组或带表头的二维数组：</p>
      <div class="demo-field-stack demo-field-stack--follow">
        <div class="demo-field-row">
          <span class="demo-field-label">操作</span>
          <div class="demo-field-controls">
            <el-button size="small" type="primary" @click="runSheetUtilsDemo">运行转换</el-button>
          </div>
        </div>
      </div>
      <pre v-if="sheetUtilResult" class="code-block" style="margin-top: 12px"><code>{{ sheetUtilResult }}</code></pre>
    </el-card>

    <!-- ── Schema Validation ── -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <span class="demo-section__title">Schema 校验 (validateWithSchema)</span>
      </template>
      <el-input v-model="validationCsv" type="textarea" :autosize="{ minRows: 3, maxRows: 8 }" placeholder="输入含表头的 CSV" />
      <div class="demo-field-stack demo-field-stack--follow">
        <div class="demo-field-row">
          <span class="demo-field-label">操作</span>
          <div class="demo-field-controls">
            <el-button size="small" type="primary" @click="runValidation">运行校验</el-button>
          </div>
        </div>
      </div>
      <pre v-if="validationResult" class="code-block" style="margin-top: 12px"><code>{{ validationResult }}</code></pre>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.demo-section {
  margin-bottom: 24px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--border);

  :deep(.el-card__header) {
    padding: 16px 24px;
    background: var(--muted);
    border-bottom: 1px solid var(--border);
  }

  :deep(.el-card__body) {
    padding: 24px;
  }
}

.demo-section__head {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.demo-section__title {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: -0.2px;
  color: var(--foreground);
}

.demo-field-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.demo-field-stack--follow {
  margin-top: 14px;
}

.demo-field-row {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  align-items: center;
  column-gap: 16px;
}

.demo-field-row--block {
  align-items: start;

  .demo-field-label {
    padding-top: 6px;
  }
}

.demo-field-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--muted-foreground);
  line-height: 1.35;
  text-align: right;
}

.demo-field-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-height: 30px;

  :deep(.el-radio-group),
  :deep(.el-button),
  :deep(.el-input-number) {
    vertical-align: middle;
  }
}

.demo-field-controls--column {
  flex-direction: column;
  align-items: stretch;
  align-self: stretch;
  width: 100%;
  min-height: 0;
  gap: 10px;
}

.demo-field-row__action {
  align-self: flex-start;
}

.demo-field-divider {
  flex-shrink: 0;
  align-self: center;
  height: 26px;
  margin: 0 4px;
}

.demo-input-number-fixed {
  width: 100px;
}

.demo-hint {
  margin: 0 0 14px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--muted-foreground);

  code {
    padding: 2px 6px;
    font-size: 12px;
    background: var(--muted);
    border: 1px solid var(--border);
    border-radius: 0;
    color: var(--foreground);
  }
}

.demo-log {
  font-size: 12px;
  color: var(--muted-foreground);
  font-variant-numeric: tabular-nums;
}

.demo-table {
  width: 100%;
  margin-top: 12px;
}

.demo-import-native {
  margin-top: 12px;
  max-height: 260px;
  overflow: auto;
  border: 1px solid var(--border);
  border-radius: 0;
  background: var(--card);

  table {
    width: max-content;
    min-width: 100%;
    border-collapse: collapse;
    table-layout: auto;
    font-size: 12px;
    line-height: 1.5;
  }

  th,
  td {
    padding: 8px 12px;
    border: 1px solid var(--border);
    text-align: left;
    white-space: nowrap;
    vertical-align: top;
  }

  th {
    position: sticky;
    top: 0;
    z-index: 1;
    font-weight: 500;
    background: var(--muted);
  }

  tbody tr:nth-child(even) td {
    background: var(--muted);
  }
}

.demo-preview-body {
  margin-top: 14px;
}

.demo-preview-html {
  overflow-x: auto;

  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;

    th, td {
      padding: 8px 12px;
      border: 1px solid var(--border);
      text-align: left;
    }

    th {
      background: var(--muted);
      font-weight: 500;
    }

    tr:nth-child(even) td {
      background: var(--muted);
    }
  }
}

.demo-util-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
}

.demo-util-label {
  min-width: 140px;
  font-size: 12px;
  font-weight: 500;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: var(--foreground);
}

.demo-util-input {
  width: 160px;
}

.demo-util-result {
  font-size: 12px;
  color: var(--muted-foreground);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
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
  border: 1px solid var(--border);

  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    white-space: pre;
  }
}
</style>
