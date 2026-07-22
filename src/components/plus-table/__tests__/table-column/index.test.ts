import { createApp, h, nextTick, ref, type Slots } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PLUS_TABLE_INJECTION_KEY } from '../../tokens';
import type { PlusTable } from '../../tokens';
import type { ColumnNode } from '../../table-column/defaults';

const renderedProps = vi.hoisted(() => [] as Record<string, unknown>[]);

vi.mock('element-plus', async (importOriginal) => {
  const actual = await importOriginal<typeof import('element-plus')>();
  const { defineComponent, h } = await import('vue');
  return {
    ...actual,
    ElTableColumn: defineComponent({
      inheritAttrs: false,
      setup(_, { attrs, slots }) {
        return () => {
          renderedProps.push({ ...attrs });
          return h('div', slots.default?.());
        };
      },
    }),
  };
});

import PlusTableColumnNode from '../../table-column';

describe('PlusTable column rendering', () => {
  const mounted: Array<{ app: ReturnType<typeof createApp>; host: Element }> = [];

  afterEach(() => {
    renderedProps.length = 0;
    for (const { app, host } of mounted.splice(0)) {
      app.unmount();
      host.remove();
    }
  });

  it('keeps normalized column identity and cached width authoritative', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const node: ColumnNode = {
      id: '#',
      column: {
        type: 'index',
        label: '#',
        columnKey: 'caller-key',
        width: 60,
      },
    };
    const table = {
      slots: {} as Slots,
      store: { states: { widthMap: ref({ '#': 88 }) } },
    } as unknown as PlusTable;
    const app = createApp({
      render: () => h(PlusTableColumnNode, { node }),
    });
    app.provide(PLUS_TABLE_INJECTION_KEY, table);
    app.mount(host);
    mounted.push({ app, host });
    await nextTick();

    expect(renderedProps.at(-1)).toEqual(expect.objectContaining({ columnKey: '#', width: 88 }));
  });
});
