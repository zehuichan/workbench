import type { PlusDialogAction, PlusDialogMode } from '../types';

import { createApp, h, nextTick } from 'vue';

import ElementPlus from 'element-plus';
import { afterEach, describe, expect, it, vi } from 'vitest';

import PlusDialogFooter from '../plus-dialog-footer.vue';

interface Form {
  amount: number;
  name: string;
}

describe('PlusDialogFooter', () => {
  const mounted: Array<{ app: ReturnType<typeof createApp>; host: Element }> =
    [];

  async function mount(props: {
    actions?: PlusDialogAction<Form>[];
    form?: Form;
    mode: PlusDialogMode;
    onCancel?: () => void;
    onClose?: () => void;
    onCreate?: () => void;
    onRefresh?: () => void;
    onSave?: () => void;
    onSaveAndClose?: () => void;
    submitting?: boolean;
  }) {
    const host = document.createElement('div');
    document.body.append(host);
    const app = createApp({
      render: () =>
        h(PlusDialogFooter, {
          mode: props.mode,
          form: props.form ?? { name: 'a', amount: 1 },
          actions: (props.actions ?? []) as PlusDialogAction<object>[],
          submitting: props.submitting ?? false,
          onCancel: props.onCancel,
          onRefresh: props.onRefresh,
          onSave: props.onSave,
          onSaveAndClose: props.onSaveAndClose,
          onCreate: props.onCreate,
          onClose: props.onClose,
        }),
    });
    app.use(ElementPlus);
    app.mount(host);
    await nextTick();
    mounted.push({ app, host });
    return host;
  }

  afterEach(() => {
    for (const { app, host } of mounted.splice(0)) {
      app.unmount();
      host.remove();
    }
  });

  function labels(host: Element): string[] {
    return [...host.querySelectorAll('button')].map(
      (btn) => btn.textContent?.trim() ?? '',
    );
  }

  it('orders edit buttons as cancel, refresh, actions, save, save-and-close', async () => {
    const host = await mount({
      mode: 'edit',
      actions: [
        {
          key: 'drill',
          label: '关联',
          handler: () => undefined,
        },
      ],
    });
    expect(labels(host)).toEqual([
      '取消',
      '刷新',
      '关联',
      '保存',
      '保存并关闭',
    ]);
  });

  it('orders view buttons as actions, refresh, close', async () => {
    const host = await mount({
      mode: 'view',
      actions: [
        {
          key: 'drill',
          label: '关联',
          handler: () => undefined,
        },
      ],
    });
    expect(labels(host)).toEqual(['关联', '刷新', '关闭']);
  });

  it('shows only cancel and create in create mode', async () => {
    const host = await mount({
      mode: 'create',
      actions: [
        {
          key: 'drill',
          label: '关联',
          handler: () => undefined,
        },
      ],
    });
    expect(labels(host)).toEqual(['取消', '新增']);
  });

  it('hides or disables actions by fallback', async () => {
    const hidden = await mount({
      mode: 'edit',
      form: { name: 'a', amount: 0 },
      actions: [
        {
          key: 'archive',
          label: '归档',
          when: (row) => row.amount > 0,
          fallback: 'hide',
          handler: () => undefined,
        },
      ],
    });
    expect(labels(hidden)).not.toContain('归档');

    const disabled = await mount({
      mode: 'edit',
      form: { name: 'a', amount: 0 },
      actions: [
        {
          key: 'archive',
          label: '归档',
          when: (row) => row.amount > 0,
          fallback: 'disable',
          handler: () => undefined,
        },
      ],
    });
    const archive = [...disabled.querySelectorAll('button')].find(
      (btn) => btn.textContent?.trim() === '归档',
    ) as HTMLButtonElement;
    expect(archive.disabled).toBe(true);
  });

  it('emits save from the save button', async () => {
    const onSave = vi.fn();
    const host = await mount({ mode: 'edit', onSave });
    const save = [...host.querySelectorAll('button')].find(
      (btn) => btn.textContent?.trim() === '保存',
    ) as HTMLButtonElement;
    save.click();
    expect(onSave).toHaveBeenCalledOnce();
  });
});
