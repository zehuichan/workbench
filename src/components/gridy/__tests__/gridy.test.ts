/* eslint-disable vue/one-component-per-file */

import type {
  GridyActionSlotProps,
  GridyCellContext,
  GridyCellSlotProps,
  GridyColumn,
  GridyExpandSlotProps,
  GridyExposed,
  GridyPagination,
  GridyRecord,
} from '../src/types';

import { computed, createApp, defineComponent, h, nextTick, ref, toRaw } from 'vue';

import { ElInput } from 'element-plus';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { transferBrand } from '../src/brand';
import { useRowIdentity } from '../src/composables';
import { findRow } from '../src/dom';
import Gridy from '../src/gridy.vue';
import { aggregateColumn, buildSummaryCells } from '../src/summary';
import { errorKeyOf, filterTree, removeAtPath, updateAtPath } from '../src/tree';

const cleanups: Array<() => void> = [];

afterEach(() => {
  for (const cleanup of cleanups.splice(0)) {
    cleanup();
  }
});

function mountEditor(options: {
  disabled?: boolean;
  pagination?: GridyPagination;
  rows: GridyRecord[];
  selectedRowKeys?: string[];
  sorter?: boolean;
}) {
  const host = document.createElement('div');
  document.body.append(host);
  const editor = ref<GridyExposed>();
  const model = ref(options.rows);
  const selectedRowKeys = ref(options.selectedRowKeys ?? []);
  const remove = vi.fn();
  const change = vi.fn();
  const selectionChange = vi.fn();
  const hasId = options.rows.some((row) => 'id' in row);
  const columns = [
    { type: 'selection' as const },
    {
      field: 'name',
      sorter: options.sorter,
      title: '姓名',
    },
    { type: 'action' as const },
  ];
  const app = createApp(
    defineComponent({
      setup() {
        return () =>
          h(Gridy, {
            ref: editor,
            columns,
            disabled: options.disabled,
            modelValue: model.value,
            pagination: options.pagination,
            rowKey: hasId ? 'id' : undefined,
            selectedRowKeys: selectedRowKeys.value,
            'onUpdate:modelValue': (value: GridyRecord[]) => {
              model.value = value;
            },
            'onUpdate:selectedRowKeys': (value: string[]) => {
              selectedRowKeys.value = value;
            },
            onChange: change,
            onRemove: remove,
            onSelectionChange: selectionChange,
          });
      },
    }),
  );
  app.mount(host);
  cleanups.push(() => {
    app.unmount();
    host.remove();
  });
  return {
    change,
    editor,
    host,
    model,
    remove,
    selectedRowKeys,
    selectionChange,
  };
}

describe('gridy removeRow', () => {
  it('emits the removed item before index and remaining rows', async () => {
    const first = { id: 1, name: '张三' };
    const second = { id: 2, name: '李四' };
    const { editor, remove } = mountEditor({ rows: [first, second] });
    await nextTick();

    editor.value!.removeRow(0);

    expect(remove).toHaveBeenCalledWith(first, 0, [second]);
  });

  it('clears the removed row selection in pagination mode', async () => {
    const first = { id: 1, name: '张三' };
    const second = { id: 2, name: '李四' };
    const mounted = mountEditor({
      pagination: { current: 1, pageSize: 10, total: 2 },
      rows: [first, second],
      selectedRowKeys: ['1'],
    });
    await nextTick();

    mounted.editor.value!.removeRow(0);
    await nextTick();

    expect(mounted.selectedRowKeys.value).toEqual([]);
    expect(mounted.selectionChange).toHaveBeenCalledWith([], []);
  });
});

describe('gridy pagination', () => {
  it('keeps the pager visible when the current page is empty', async () => {
    const { host } = mountEditor({
      pagination: { current: 2, pageSize: 10, total: 20 },
      rows: [],
    });
    await nextTick();

    expect(host.querySelector('.gridy__pager')).toBeTruthy();
  });
});

describe('gridy row identity', () => {
  it('keeps brand across immutable cell update via transferBrand', () => {
    const row: GridyRecord = { name: '张三' };
    const rows = computed(() => [row]);
    const { keyOf } = useRowIdentity(
      { columns: [] },
      rows,
      computed(() => undefined),
    );
    const id = keyOf(row, 0);
    const next = { ...row, name: '李四' };
    transferBrand(row, next);
    expect(keyOf(next, 0)).toBe(id);
  });

  it('assigns distinct keys when a row is copied via object spread', async () => {
    const row = { name: '张三' };
    const { editor, model } = mountEditor({ rows: [row] });
    await nextTick();

    const originalId = editor.value!.table.getRowModel().rows[0]!.id;
    model.value = [...model.value, { ...model.value[0]! }];
    await nextTick();

    const ids = editor.value!.table.getRowModel().rows.map((r) => r.id);
    expect(ids).toHaveLength(2);
    expect(ids[0]).toBe(originalId);
    expect(ids[1]).not.toBe(originalId);
  });
});

describe('gridy sorting', () => {
  it('reorders render rows when a sorter column is toggled', async () => {
    const { editor, host } = mountEditor({
      rows: [
        { id: 1, name: 'b' },
        { id: 2, name: 'a' },
      ],
      sorter: true,
    });
    await nextTick();

    const th = host.querySelector('.gridy__th--sortable') as HTMLElement;
    expect(th).toBeTruthy();
    th.click();
    await nextTick();

    const names = editor.value!.table.getRowModel().rows.map((r) => r.original.name);
    expect(names).toEqual(['a', 'b']);
  });

  it('does not client-sort when backend pagination is enabled', async () => {
    const { editor, host } = mountEditor({
      pagination: { current: 1, pageSize: 10, total: 2 },
      rows: [
        { id: 1, name: 'b' },
        { id: 2, name: 'a' },
      ],
      sorter: true,
    });
    await nextTick();

    expect(host.querySelector('.gridy__th--sortable')).toBeNull();
    expect(editor.value!.table.options.manualSorting).toBe(true);
  });
});

describe('gridy disabled', () => {
  it('hides selection and action columns in readonly mode', async () => {
    const { host } = mountEditor({
      disabled: true,
      rows: [{ id: 1, name: '张三' }],
    });
    await nextTick();

    expect(host.querySelector('.gridy__select')).toBeNull();
    expect(host.querySelector('.gridy__action')).toBeNull();
  });
});

describe('gridy removeSelected', () => {
  it('commits through change and emits remove for each local row', async () => {
    const first = { id: 1, name: '张三' };
    const second = { id: 2, name: '李四' };
    const { change, editor, model, remove, selectedRowKeys } = mountEditor({
      rows: [first, second],
      selectedRowKeys: ['1', '2'],
    });
    await nextTick();

    editor.value!.removeSelected();
    await nextTick();

    expect(model.value).toEqual([]);
    expect(selectedRowKeys.value).toEqual([]);
    expect(change).toHaveBeenCalledWith([], {
      index: 0,
      indexes: [0, 1],
      path: [0],
      paths: [[0], [1]],
      type: 'remove',
    });
    expect(remove).toHaveBeenCalledTimes(2);
  });
});

describe('gridy public api', () => {
  it('exposes getSelectedRowKeys', async () => {
    const { editor } = mountEditor({
      rows: [
        { id: 1, name: '张三' },
        { id: 2, name: '李四' },
      ],
      selectedRowKeys: ['1'],
    });
    await nextTick();

    expect(editor.value!.getSelectedRowKeys()).toEqual(['1']);
  });

  it('renders loading spin and emptyText / title slots', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const app = createApp(
      defineComponent({
        setup() {
          return () =>
            h(
              Gridy,
              {
                columns: [{ field: 'name', title: '姓名' }],
                loading: true,
                modelValue: [],
              },
              {
                emptyText: () => '自定义空态',
                title: () => '表格标题',
              },
            );
        },
      }),
    );
    app.mount(host);
    cleanups.push(() => {
      app.unmount();
      host.remove();
    });
    await nextTick();

    expect(host.textContent).toContain('表格标题');
    expect(host.textContent).toContain('自定义空态');
    expect(host.querySelector('.el-loading-mask')).toBeTruthy();
  });
});

describe('gridy summary', () => {
  it('uses the host summary function and skips non-numeric handling to the host', () => {
    const amount = {
      field: 'amount',
      summary: ({ values }: { values: unknown[] }) => {
        let total = 0;
        for (const value of values) {
          const amount = Number(value);
          if (Number.isFinite(amount)) {
            total += amount;
          }
        }
        return total;
      },
    };
    expect(aggregateColumn(amount, [{ amount: 1 }, { amount: 2 }, { amount: undefined }])).toBe(3);
  });

  it('merges leading non-summary columns into the label cell', () => {
    const cells = buildSummaryCells(
      [
        { type: 'index' },
        { field: 'name', title: '商品' },
        {
          align: 'right',
          field: 'qty',
          summary: ({ values }) =>
            values.reduce<number>((total, value) => total + (Number(value) || 0), 0),
        },
      ],
      [
        { name: 'a', qty: 2 },
        { name: 'b', qty: 3 },
      ],
      '合计',
    );
    expect(cells).toHaveLength(2);
    expect(cells[0]).toMatchObject({ content: '合计', colspan: 2 });
    expect(cells[1]?.content).toBe(5);
  });

  it('renders tfoot when a data column enables summary', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const app = createApp(
      defineComponent({
        setup() {
          return () =>
            h(Gridy, {
              columns: [
                { type: 'index' },
                { field: 'name', title: '商品' },
                {
                  field: 'qty',
                  summary: ({ values }: { values: unknown[] }) =>
                    values.reduce<number>((total, value) => total + (Number(value) || 0), 0),
                  title: '数量',
                },
              ],
              modelValue: [
                { name: 'a', qty: 2 },
                { name: 'b', qty: 5 },
              ],
            });
        },
      }),
    );
    app.mount(host);
    cleanups.push(() => {
      app.unmount();
      host.remove();
    });
    await nextTick();

    const tfoot = host.querySelector('.gridy__tfoot');
    expect(tfoot).toBeTruthy();
    expect(tfoot?.textContent).toContain('合计');
    expect(tfoot?.textContent).toContain('7');
  });

  it('hides tfoot when summary is disabled', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const app = createApp(
      defineComponent({
        setup() {
          return () =>
            h(Gridy, {
              columns: [
                {
                  field: 'qty',
                  summary: () => 2,
                  title: '数量',
                },
              ],
              modelValue: [{ qty: 2 }],
              summary: { disabled: true },
            });
        },
      }),
    );
    app.mount(host);
    cleanups.push(() => {
      app.unmount();
      host.remove();
    });
    await nextTick();

    expect(host.querySelector('.gridy__tfoot')).toBeNull();
  });
});

function mountValidation(options: {
  columns: GridyColumn[];
  disabled?: boolean;
  rows: GridyRecord[];
}) {
  const host = document.createElement('div');
  document.body.append(host);
  const editor = ref<GridyExposed>();
  const model = ref(options.rows);
  const cellSlot = ref<GridyCellSlotProps>();
  const app = createApp(
    defineComponent({
      setup() {
        return () =>
          h(
            Gridy,
            {
              ref: editor,
              columns: options.columns,
              disabled: options.disabled,
              modelValue: model.value,
              'onUpdate:modelValue': (value: GridyRecord[]) => {
                model.value = value;
              },
            },
            {
              // 捕获首列插槽参数，用 setValue 模拟单元格 change
              'cell-name': (slotProps: GridyCellSlotProps) => {
                cellSlot.value = slotProps;
                return h('span', slotProps.error ?? '');
              },
            },
          );
      },
    }),
  );
  app.mount(host);
  cleanups.push(() => {
    app.unmount();
    host.remove();
  });
  return { cellSlot, editor, host, model };
}

async function flushValidation() {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await nextTick();
}

/** 错误格的 field 列表（文案只在 hover Tooltip 中，DOM 断言看 td 标记） */
function errorCells(host: HTMLElement) {
  return [...host.querySelectorAll<HTMLElement>('.gridy__td--error')].map((el) => el.dataset.field);
}

describe('gridy validation', () => {
  it('applies built-in required semantics aligned with the vben adapter', async () => {
    const { editor, host } = mountValidation({
      columns: [
        { field: 'name', rules: 'required', title: '姓名' },
        { field: 'role', rules: 'selectRequired', title: '角色' },
      ],
      rows: [
        { name: undefined, role: undefined },
        { name: null, role: null },
        { name: '', role: '' },
        { name: [], role: 'owner' },
        { name: 0, role: 0 },
      ],
    });
    await nextTick();

    const result = await editor.value!.validate();
    await nextTick();

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual({
      '[0].name': '请输入姓名',
      '[0].role': '请选择角色',
      '[1].name': '请输入姓名',
      '[1].role': '请选择角色',
      '[2].name': '请输入姓名',
      '[3].name': '请输入姓名',
    });
    expect(errorCells(host)).toEqual(['name', 'role', 'name', 'role', 'name', 'name']);
  });

  it('passes zod issue message and validator return value through', async () => {
    const { editor } = mountValidation({
      columns: [
        {
          field: 'phone',
          rules: z.string().min(5, '电话至少 5 位'),
          title: '电话',
        },
        {
          field: 'code',
          rules: (value, { index, rows }) =>
            rows.some((row, i) => i !== index && row.code === value) ? '工号重复' : true,
          title: '工号',
        },
        { field: 'flag', rules: () => false, title: '标记' },
      ],
      rows: [
        { code: 'A1', flag: 1, phone: '123' },
        { code: 'A1', flag: 1, phone: '12345' },
      ],
    });
    await nextTick();

    const { errors, valid } = await editor.value!.validate();

    expect(valid).toBe(false);
    expect(errors).toEqual({
      '[0].code': '工号重复',
      '[0].flag': '标记校验未通过',
      '[0].phone': '电话至少 5 位',
      '[1].code': '工号重复',
      '[1].flag': '标记校验未通过',
    });
  });

  it('re-validates the cell on change and clears the error once fixed', async () => {
    const { cellSlot, editor, host } = mountValidation({
      columns: [
        { field: 'name', rules: 'required', title: '姓名' },
        { component: ElInput, field: 'phone', rules: 'required', title: '电话' },
      ],
      rows: [{ name: '', phone: '' }],
    });
    await nextTick();

    await editor.value!.validate();
    await nextTick();
    expect(errorCells(host)).toEqual(['name', 'phone']);
    expect(cellSlot.value?.error).toBe('请输入姓名');
    // 编辑控件走 Element Plus 失效态（is-error），无额外图标
    expect(host.querySelector('.el-input.is-error')).toBeTruthy();
    expect(host.querySelector('.gridy__cell-error')).toBeNull();

    cellSlot.value!.setValue('张三');
    await flushValidation();
    expect(errorCells(host)).toEqual(['phone']);
    expect(cellSlot.value?.error).toBeUndefined();

    cellSlot.value!.setValue('');
    await flushValidation();
    expect(errorCells(host)).toEqual(['name', 'phone']);
  });

  it('drops errors of removed rows and on clearValidation', async () => {
    const { editor, host } = mountValidation({
      columns: [{ field: 'name', rules: 'required', title: '姓名' }, { type: 'action' }],
      rows: [{ name: '' }, { name: '' }],
    });
    await nextTick();

    await editor.value!.validate();
    await nextTick();
    expect(errorCells(host)).toHaveLength(2);

    editor.value!.removeRow(0);
    await nextTick();
    expect(errorCells(host)).toHaveLength(1);

    editor.value!.clearValidation();
    await nextTick();
    expect(errorCells(host)).toHaveLength(0);
  });

  it('marks required headers and skips validation in readonly mode', async () => {
    const columns: GridyColumn[] = [
      { field: 'name', rules: 'required', title: '姓名' },
      { field: 'role', rules: 'selectRequired', title: '角色' },
      { field: 'phone', rules: z.string().min(1), title: '电话' },
      { field: 'memo', rules: z.string().optional(), title: '备注' },
      { field: 'code', rules: () => true, title: '工号' },
      { field: 'plain', title: '无规则' },
    ];
    const editable = mountValidation({ columns, rows: [{ name: '' }] });
    await nextTick();
    expect(
      [...editable.host.querySelectorAll('.gridy__th--required')].map((th) =>
        th.textContent?.trim(),
      ),
    ).toEqual(['姓名', '角色', '电话']);

    const readonly = mountValidation({
      columns,
      disabled: true,
      rows: [{ name: '' }],
    });
    await nextTick();
    expect(readonly.host.querySelector('.gridy__th--required')).toBeNull();
    await expect(readonly.editor.value!.validate()).resolves.toEqual({
      errors: {},
      valid: true,
    });
    expect(errorCells(readonly.host)).toEqual([]);
  });
});

/** 通用挂载：面板 / 树形 / 嵌套场景共用，插槽按需传入 */
function mountGridy(options: {
  columns: GridyColumn[];
  createRow?: (parent?: GridyCellContext) => GridyRecord;
  expandedRowKeys?: string[];
  pagination?: GridyPagination;
  rowKey?: string;
  rows: GridyRecord[];
  selectedRowKeys?: string[];
  size?: 'large' | 'middle' | 'small';
  slots?: Record<string, (...args: any[]) => any>;
  tree?: boolean | { childrenField?: string; indentSize?: number };
}) {
  const host = document.createElement('div');
  document.body.append(host);
  const editor = ref<GridyExposed>();
  const model = ref(options.rows);
  const expandedRowKeys = ref(options.expandedRowKeys ?? []);
  const selectedRowKeys = ref(options.selectedRowKeys ?? []);
  const add = vi.fn();
  const change = vi.fn();
  const expand = vi.fn();
  const expandedRowsChange = vi.fn();
  const remove = vi.fn();
  const app = createApp(
    defineComponent({
      setup() {
        return () =>
          h(
            Gridy,
            {
              ref: editor,
              columns: options.columns,
              createRow: options.createRow,
              expandedRowKeys: expandedRowKeys.value,
              modelValue: model.value,
              pagination: options.pagination,
              rowKey: options.rowKey,
              selectedRowKeys: selectedRowKeys.value,
              size: options.size,
              tree: options.tree,
              'onUpdate:expandedRowKeys': (value: string[]) => {
                expandedRowKeys.value = value;
              },
              'onUpdate:modelValue': (value: GridyRecord[]) => {
                model.value = value;
              },
              'onUpdate:selectedRowKeys': (value: string[]) => {
                selectedRowKeys.value = value;
              },
              onAdd: add,
              onChange: change,
              onExpand: expand,
              onExpandedRowsChange: expandedRowsChange,
              onRemove: remove,
            },
            options.slots,
          );
      },
    }),
  );
  app.mount(host);
  cleanups.push(() => {
    app.unmount();
    host.remove();
  });
  return {
    add,
    change,
    editor,
    expand,
    expandedRowKeys,
    expandedRowsChange,
    host,
    model,
    remove,
    selectedRowKeys,
  };
}

/** 本表直属主行（不含嵌套子表的行） */
function ownRows(host: HTMLElement) {
  const scroll = host.querySelector<HTMLElement>('.gridy__scroll')!;
  return [...scroll.querySelectorAll<HTMLElement>(':scope > .gridy__table > tbody > tr.gridy__tr')];
}

function expandIcons(host: HTMLElement) {
  return [...host.querySelectorAll<HTMLButtonElement>('button.gridy__expand-icon')];
}

describe('gridy expanded row panel', () => {
  const columns: GridyColumn[] = [{ type: 'expand' }, { field: 'name', title: '姓名' }];

  it('toggles the panel through the expand icon and syncs v-model / events', async () => {
    const rows = [
      { id: 1, name: '张三' },
      { id: 2, name: '李四' },
    ];
    const { expand, expandedRowKeys, expandedRowsChange, host } = mountGridy({
      columns,
      rowKey: 'id',
      rows,
      slots: {
        expand: (props: GridyExpandSlotProps) =>
          h('div', { class: 'panel' }, `详情:${props.row.name}`),
      },
    });
    await nextTick();

    expect(host.querySelector('.gridy__expanded-row')).toBeNull();
    expect(expandIcons(host)).toHaveLength(2);

    expandIcons(host)[1]!.click();
    await nextTick();

    expect(expandedRowKeys.value).toEqual(['2']);
    expect(expand).toHaveBeenCalledWith(true, rows[1], 1);
    expect(expandedRowsChange).toHaveBeenCalledWith(['2']);
    const panel = host.querySelector('.gridy__expanded-row .panel');
    expect(panel?.textContent).toBe('详情:李四');
    // 面板行与主行同属一个 tbody，虚拟滚动才能量到整体高度
    expect(panel?.closest('tbody')).toBe(ownRows(host)[1]!.closest('tbody'));
    expect(ownRows(host)[1]!.classList.contains('gridy__tr--expanded')).toBe(true);

    expandIcons(host)[1]!.click();
    await nextTick();
    expect(expandedRowKeys.value).toEqual([]);
    expect(expand).toHaveBeenLastCalledWith(false, rows[1], 1);
    expect(host.querySelector('.gridy__expanded-row')).toBeNull();
  });

  it('respects rowExpandable and ignores toggling non-expandable rows', async () => {
    const { editor, expandedRowKeys, host } = mountGridy({
      columns: [
        { rowExpandable: ({ row }) => row.name !== '李四', type: 'expand' },
        { field: 'name', title: '姓名' },
      ],
      rowKey: 'id',
      rows: [
        { id: 1, name: '张三' },
        { id: 2, name: '李四' },
      ],
      slots: { expand: () => h('div', 'x') },
    });
    await nextTick();

    expect(expandIcons(host)).toHaveLength(1);
    expect(host.querySelectorAll('.gridy__expand-icon--leaf')).toHaveLength(1);

    editor.value!.toggleRowExpanded(1, true);
    await nextTick();
    expect(expandedRowKeys.value).toEqual([]);

    editor.value!.toggleRowExpanded(0);
    await nextTick();
    expect(expandedRowKeys.value).toEqual(['1']);
    expect(host.querySelectorAll('.gridy__expanded-row')).toHaveLength(1);
  });

  it('keeps the panel open across cell edits and writes back through setValue', async () => {
    const cellSlot = ref<GridyCellSlotProps>();
    const panelSlot = ref<GridyExpandSlotProps>();
    const { change, expandedRowKeys, host, model } = mountGridy({
      columns,
      expandedRowKeys: ['1'],
      rowKey: 'id',
      rows: [{ id: 1, memo: '', name: '张三' }],
      slots: {
        'cell-name': (props: GridyCellSlotProps) => {
          cellSlot.value = props;
          return h('span', String(props.value));
        },
        expand: (props: GridyExpandSlotProps) => {
          panelSlot.value = props;
          return h('div', { class: 'panel' }, String(props.row.memo));
        },
      },
    });
    await nextTick();
    expect(host.querySelector('.gridy__expanded-row')).toBeTruthy();

    // 编辑整体替换 data；autoResetExpanded 关掉后展开态不应被重置
    cellSlot.value!.setValue('王五');
    await nextTick();
    expect(model.value[0]!.name).toBe('王五');
    expect(expandedRowKeys.value).toEqual(['1']);
    expect(host.querySelector('.gridy__expanded-row')).toBeTruthy();

    panelSlot.value!.setValue('memo', '备注');
    await nextTick();
    expect(model.value[0]!.memo).toBe('备注');
    expect(change).toHaveBeenLastCalledWith(model.value, {
      field: 'memo',
      index: 0,
      path: [0],
      type: 'update',
    });
    expect(host.querySelector('.panel')?.textContent).toBe('备注');

    panelSlot.value!.collapse();
    await nextTick();
    expect(expandedRowKeys.value).toEqual([]);
  });

  it('drops expanded keys of removed rows but keeps them across pagination', async () => {
    const local = mountGridy({
      columns,
      expandedRowKeys: ['1', '2'],
      rowKey: 'id',
      rows: [
        { id: 1, name: '张三' },
        { id: 2, name: '李四' },
      ],
      slots: { expand: () => h('div', 'x') },
    });
    await nextTick();

    local.editor.value!.removeRow(0);
    await nextTick();
    expect(local.expandedRowKeys.value).toEqual(['2']);

    // 分页：翻页整体换 rows，跨页的展开 key 不能被误清
    const paged = mountGridy({
      columns,
      expandedRowKeys: ['1', '99'],
      pagination: { current: 1, pageSize: 1, total: 2 },
      rowKey: 'id',
      rows: [{ id: 1, name: '张三' }],
      slots: { expand: () => h('div', 'x') },
    });
    await nextTick();
    paged.model.value = [{ id: 99, name: '下一页' }];
    await nextTick();
    expect(paged.expandedRowKeys.value).toEqual(['1', '99']);
    expect(paged.host.querySelectorAll('.gridy__expanded-row')).toHaveLength(1);
  });

  it('follows the row when sorting reorders it', async () => {
    const { host } = mountGridy({
      columns: [{ type: 'expand' }, { field: 'name', sorter: true, title: '姓名' }],
      expandedRowKeys: ['1'],
      rowKey: 'id',
      rows: [
        { id: 1, name: 'b' },
        { id: 2, name: 'a' },
      ],
      slots: {
        expand: ({ row }: GridyExpandSlotProps) => h('div', { class: 'panel' }, row.name),
      },
    });
    await nextTick();

    (host.querySelector('.gridy__th--sortable') as HTMLElement).click();
    await nextTick();

    const groups = [...host.querySelectorAll('tbody.gridy__row-group')];
    expect(groups).toHaveLength(2);
    expect(groups[0]!.querySelector('.panel')).toBeNull();
    expect(groups[1]!.querySelector('.panel')?.textContent).toBe('b');
  });
});

describe('gridy nested in expanded panel', () => {
  // 面板插槽随外层渲染重建，子表数据要用稳定引用（否则无 rowKey 的行每次都拿到新 brand）
  const innerRows = [{ name: '内层一' }, { name: '内层二' }];

  function mountNested() {
    return mountGridy({
      columns: [{ type: 'expand' }, { field: 'name', title: '姓名' }],
      expandedRowKeys: ['1'],
      rowKey: 'id',
      rows: [
        { id: 1, name: '外层一' },
        { id: 2, name: '外层二' },
      ],
      size: 'large',
      slots: {
        expand: () =>
          h(Gridy, {
            class: 'inner',
            columns: [{ field: 'name', title: '姓名' }],
            modelValue: innerRows,
            size: 'small',
          }),
      },
    });
  }

  it('scopes row queries to the owning table', async () => {
    const { host } = mountNested();
    await nextTick();

    const outerScroll = host.querySelector<HTMLElement>('.gridy__scroll')!;
    // 子表第 1 行在文档序上先于外层第 1 行，非 :scope 查询会命中子表
    expect(findRow(outerScroll, 1)?.textContent?.trim()).toBe('外层二');
    expect(ownRows(host).map((tr) => tr.textContent?.trim())).toEqual(['外层一', '外层二']);
    const inner = host.querySelector<HTMLElement>('.inner')!;
    expect(inner.classList.contains('gridy--small')).toBe(true);
    expect(ownRows(inner).map((tr) => tr.textContent?.trim())).toEqual(['内层一', '内层二']);
  });

  it('clears the outer active cell when focus moves into the panel', async () => {
    const { host } = mountNested();
    await nextTick();

    const outerCell = ownRows(host)[1]!.querySelector<HTMLElement>('td[data-field="name"]')!;
    outerCell.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await nextTick();
    expect(outerCell.classList.contains('gridy__td--active')).toBe(true);

    const inner = host.querySelector<HTMLElement>('.inner')!;
    const innerCell = ownRows(inner)[0]!.querySelector<HTMLElement>('td[data-field="name"]')!;
    innerCell.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await nextTick();

    expect(outerCell.classList.contains('gridy__td--active')).toBe(false);
    expect(innerCell.classList.contains('gridy__td--active')).toBe(true);
    // 外层只应有子表这一个活动格，没有把子表的格误当成自己的
    expect(host.querySelectorAll('.gridy__td--active')).toHaveLength(1);
  });
});

describe('gridy tree', () => {
  const columns: GridyColumn[] = [
    { type: 'selection' },
    { field: 'name', rules: 'required', title: '名称' },
    { type: 'action' },
  ];

  function treeRows(): GridyRecord[] {
    return [
      {
        children: [
          { id: 11, name: '前端组' },
          { children: [{ id: 121, name: '' }], id: 12, name: '后端组' },
        ],
        id: 1,
        name: '研发部',
      },
      { id: 2, name: '市场部' },
    ];
  }

  it('renders sub rows on expand with indentation on the first data column', async () => {
    const { expandedRowKeys, host } = mountGridy({
      columns,
      rowKey: 'id',
      rows: treeRows(),
      tree: { indentSize: 20 },
    });
    await nextTick();

    expect(ownRows(host)).toHaveLength(2);
    expect(host.querySelector('.gridy__expand')).toBeNull();
    // 图标落在首个数据列的单元格里
    expect(
      ownRows(host)[0]!.querySelector('td[data-field="name"] .gridy__expand-icon'),
    ).toBeTruthy();
    expect(expandIcons(host)).toHaveLength(1);

    expandIcons(host)[0]!.click();
    await nextTick();

    expect(expandedRowKeys.value).toEqual(['1']);
    const names = ownRows(host).map((tr) =>
      tr.querySelector('td[data-field="name"]')?.textContent?.trim(),
    );
    expect(names).toEqual(['研发部', '前端组', '后端组', '市场部']);
    const indents = ownRows(host).map(
      (tr) => tr.querySelector<HTMLElement>('.gridy__indent')?.style.width ?? '',
    );
    expect(indents).toEqual(['', '20px', '20px', '']);
    // 叶子占位保持同层对齐
    expect(ownRows(host)[1]!.querySelector('.gridy__expand-icon--leaf')).toBeTruthy();
  });

  it('hosts the tree icon in an explicit expand column when declared', async () => {
    const { host } = mountGridy({
      columns: [{ type: 'expand' }, { field: 'name', title: '名称' }],
      rowKey: 'id',
      rows: treeRows(),
      tree: true,
    });
    await nextTick();

    expect(host.querySelector('td.gridy__expand .gridy__expand-icon')).toBeTruthy();
    expect(host.querySelector('td[data-field="name"] .gridy__expand-icon')).toBeNull();
    expect(host.querySelector('.gridy__cell--tree')).toBeNull();
  });

  it('edits nested cells immutably and keeps the tree expanded', async () => {
    const slots = new Map<string, GridyCellSlotProps>();
    const rows = treeRows();
    const { change, expandedRowKeys, model } = mountGridy({
      columns,
      expandedRowKeys: ['1'],
      rowKey: 'id',
      rows,
      slots: {
        'cell-name': (props: GridyCellSlotProps) => {
          slots.set(props.path.join('.'), props);
          return h('span', String(props.value));
        },
      },
      tree: true,
    });
    await nextTick();

    const child = slots.get('0.1')!;
    expect(child).toMatchObject({ depth: 1, index: 1, path: [0, 1] });
    child.setValue('平台组');
    await nextTick();

    // model 经 ref 包成了 reactive 代理，引用比较要回到原始对象
    const [dept, market] = toRaw(model.value).map((row) => toRaw(row));
    expect(dept!.children[1].name).toBe('平台组');
    expect(dept).not.toBe(rows[0]);
    expect(toRaw(dept!.children[0])).toBe(rows[0]!.children[0]);
    expect(market).toBe(rows[1]);
    expect(change).toHaveBeenCalledWith(model.value, {
      field: 'name',
      index: 1,
      path: [0, 1],
      type: 'update',
    });
    expect(expandedRowKeys.value).toEqual(['1']);
  });

  it('removes a sub tree by path and cleans selection / expanded keys', async () => {
    const { editor, expandedRowKeys, model, remove, selectedRowKeys } = mountGridy({
      columns,
      expandedRowKeys: ['1', '12'],
      rowKey: 'id',
      rows: treeRows(),
      selectedRowKeys: ['12', '121', '2'],
      tree: true,
    });
    await nextTick();

    editor.value!.removeRow([0, 1]);
    await nextTick();

    expect(model.value[0]!.children).toEqual([{ id: 11, name: '前端组' }]);
    expect(remove).toHaveBeenCalledWith(expect.objectContaining({ id: 12 }), 1, model.value);
    expect(selectedRowKeys.value).toEqual(['2']);
    expect(expandedRowKeys.value).toEqual(['1']);
  });

  it('adds a child through addRow(parentPath) / action addChild and expands the parent', async () => {
    const actionSlot = new Map<string, GridyActionSlotProps>();
    const createRow = vi.fn((parent?: GridyCellContext) => ({
      name: parent ? `${parent.row.name}-新` : '新部门',
    }));
    const { add, editor, expandedRowKeys, model } = mountGridy({
      columns,
      createRow,
      rowKey: 'id',
      rows: treeRows(),
      slots: {
        action: (props: GridyActionSlotProps) => {
          actionSlot.set(props.path.join('.'), props);
          return h('span');
        },
      },
      tree: true,
    });
    await nextTick();

    editor.value!.addRow([1]);
    await nextTick();

    expect(createRow).toHaveBeenLastCalledWith(
      expect.objectContaining({ depth: 0, index: 1, path: [1] }),
    );
    expect(model.value[1]!.children).toEqual([{ name: '市场部-新' }]);
    expect(add).toHaveBeenCalledWith({ name: '市场部-新' }, 0);
    expect(expandedRowKeys.value).toEqual(['2']);

    actionSlot.get('0')!.addChild();
    await nextTick();
    expect(model.value[0]!.children).toHaveLength(3);
    expect(expandedRowKeys.value).toEqual(['2', '1']);

    // 顶层新增仍走 createRow(undefined)
    editor.value!.addRow();
    await nextTick();
    expect(createRow).toHaveBeenLastCalledWith(undefined);
    expect(model.value).toHaveLength(3);
  });

  it('validates every level with path keys and expands ancestors of the first error', async () => {
    const { editor, expandedRowKeys } = mountGridy({
      columns,
      rowKey: 'id',
      rows: treeRows(),
      tree: true,
    });
    await nextTick();

    const result = await editor.value!.validate();
    await nextTick();

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual({
      '[0].children[1].children[0].name': '请输入名称',
    });
    expect(expandedRowKeys.value).toEqual(['1', '12']);
  });

  it('selects collapsed descendants with the header checkbox', async () => {
    const { host, selectedRowKeys } = mountGridy({
      columns,
      rowKey: 'id',
      rows: treeRows(),
      tree: true,
    });
    await nextTick();

    const headerCheckbox = host.querySelector<HTMLInputElement>('th.gridy__select input')!;
    headerCheckbox.click();
    await nextTick();

    expect(selectedRowKeys.value).toEqual(['1', '11', '12', '121', '2']);
  });
});

describe('gridy tree utils', () => {
  const list: GridyRecord[] = [
    { children: [{ name: 'a1' }, { name: 'a2' }], name: 'a' },
    { name: 'b' },
  ];

  it('updateAtPath clones ancestors along the path only', () => {
    const next = updateAtPath(list, [0, 1], 'children', (row) => ({
      ...row,
      name: 'a2!',
    }));
    expect(next).not.toBe(list);
    expect(next[0]).not.toBe(list[0]);
    expect(next[0]!.children[0]).toBe(list[0]!.children[0]);
    expect(next[0]!.children[1].name).toBe('a2!');
    expect(next[1]).toBe(list[1]);
    expect(list[0]!.children[1].name).toBe('a2');
  });

  it('removeAtPath and filterTree report removed paths without descendants', () => {
    expect(removeAtPath(list, [0, 0], 'children')[0]!.children).toEqual([{ name: 'a2' }]);
    const { list: kept, removed } = filterTree(list, 'children', (row) => row.name !== 'a');
    expect(kept).toEqual([{ name: 'b' }]);
    expect(removed.map(({ path }) => path)).toEqual([[0]]);
  });

  it('errorKeyOf mirrors the a-form path syntax', () => {
    expect(errorKeyOf([2], 'name', undefined)).toBe('[2].name');
    expect(errorKeyOf([0, 1], 'name', 'children')).toBe('[0].children[1].name');
  });
});
