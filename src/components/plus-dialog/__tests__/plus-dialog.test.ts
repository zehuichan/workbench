import type { PlusDialogMode } from '../types';

import { createApp, defineComponent, h, nextTick, ref } from 'vue';

import ElementPlus, { ElMessage } from 'element-plus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import PlusDialog from '../plus-dialog.vue';

/* eslint-disable vue/one-component-per-file -- Local host components exercise v-model integration. */

interface Form {
  id: number;
  name: string;
}

describe('PlusDialog', () => {
  const mounted: Array<{ app: ReturnType<typeof createApp>; host: Element }> =
    [];
  const storageKey = 'workbench:plus-dialog:shape:test';

  beforeEach(() => {
    localStorage.removeItem(storageKey);
    vi.spyOn(ElMessage, 'success').mockImplementation(
      () => ({ close: () => undefined }) as never,
    );
    vi.spyOn(ElMessage, 'warning').mockImplementation(
      () => ({ close: () => undefined }) as never,
    );
  });

  afterEach(() => {
    for (const { app, host } of mounted.splice(0)) {
      app.unmount();
      host.remove();
    }
    vi.restoreAllMocks();
    document.body
      .querySelectorAll(
        '[data-slot="dialog-content"], [data-slot="dialog-overlay"]',
      )
      .forEach((el) => el.remove());
  });

  async function flush() {
    await nextTick();
    await Promise.resolve();
    await nextTick();
  }

  async function mountDialog(options?: {
    index?: number;
    mode?: PlusDialogMode;
    permissions?: { edit?: boolean; remove?: boolean; view?: boolean };
    records?: Form[];
    total?: number;
    validate?: () => boolean | Promise<boolean>;
  }) {
    const records = options?.records ?? [
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
      { id: 3, name: 'C' },
    ];
    const visible = ref(true);
    const mode = ref<PlusDialogMode>(options?.mode ?? 'edit');
    const index = ref<number | undefined>(options?.index ?? 0);
    const initialRecord = records[options?.index ?? 0];
    if (!initialRecord) throw new Error('initial record is missing');
    const form = ref<Form>({ ...initialRecord });
    const total = ref(options?.total ?? records.length);
    const saved = vi.fn(async (value: Form) => ({
      ...value,
      name: `${value.name}-saved`,
    }));
    const created = vi.fn(async (_value: Form) => undefined);
    const removed = vi.fn(async (value: Form) => {
      const i = records.findIndex((row) => row.id === value.id);
      if (i !== -1) records.splice(i, 1);
      total.value = records.length;
    });
    const load = vi.fn(async (i: number) => {
      await Promise.resolve();
      const row = records[i];
      if (!row) throw new Error('missing');
      return { ...row };
    });

    const Host = defineComponent({
      setup() {
        return () =>
          h(
            PlusDialog,
            {
              modelValue: visible.value,
              'onUpdate:modelValue': (v: boolean) => {
                visible.value = v;
              },
              mode: mode.value,
              'onUpdate:mode': (v: PlusDialogMode) => {
                mode.value = v;
              },
              index: index.value,
              'onUpdate:index': (v: number | undefined) => {
                index.value = v;
              },
              form: form.value,
              'onUpdate:form': (v: object) => {
                form.value = v as Form;
              },
              total: total.value,
              load,
              save: (value: object) => saved(value as Form),
              create: async (value: object) => {
                await created(value as Form);
              },
              remove: (value: object) => removed(value as Form),
              validate: options?.validate,
              permissions: options?.permissions ?? {
                view: true,
                edit: true,
                remove: true,
              },
              shapeStorageKey: storageKey,
            },
            {
              default: () =>
                h('input', {
                  class: 'test-name',
                  value: form.value.name,
                  onInput: (event: Event) => {
                    form.value = {
                      ...form.value,
                      name: (event.target as HTMLInputElement).value,
                    };
                  },
                }),
            },
          );
      },
    });

    const host = document.createElement('div');
    document.body.append(host);
    const app = createApp(Host);
    app.use(ElementPlus);
    app.mount(host);
    mounted.push({ app, host });

    await flush();
    if (mode.value !== 'create') {
      await vi.waitFor(() => expect(load.mock.calls.length).toBeGreaterThan(0));
      await flush();
    }

    return {
      host,
      visible,
      mode,
      index,
      form,
      total,
      load,
      saved,
      created,
      removed,
      records,
    };
  }

  function footerButton(label: string): HTMLButtonElement {
    const btn = [
      ...document.querySelectorAll('.plus-dialog-footer button'),
    ].find((el) => el.textContent?.trim() === label);
    if (!btn) throw new Error(`button ${label} not found`);
    return btn as HTMLButtonElement;
  }

  function headerButton(ariaLabel: string): HTMLButtonElement {
    const btn = document.querySelector(
      `.plus-dialog-header button[aria-label="${ariaLabel}"]`,
    ) as HTMLButtonElement | null;
    if (!btn) throw new Error(`header button ${ariaLabel} not found`);
    return btn;
  }

  function openConfirm(): HTMLElement | null {
    return document.querySelector('.plus-dialog-confirm[data-state="open"]');
  }

  async function answerConfirm(label: string) {
    await vi.waitFor(() => expect(openConfirm()).not.toBeNull());
    const confirm = openConfirm();
    if (!confirm) throw new Error('confirm dialog not found');
    const btn = [...confirm.querySelectorAll('button')].find(
      (el) => el.textContent?.trim() === label,
    );
    if (!btn) throw new Error(`confirm button ${label} not found`);
    btn.click();
    await flush();
  }

  async function editName(value: string) {
    const input = document.querySelector('.test-name') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await flush();
  }

  it('asks before discarding dirty edits on cancel, but not on refresh', async () => {
    const { visible, form, load } = await mountDialog();

    await editName('dirty');
    expect(form.value.name).toBe('dirty');
    footerButton('取消').click();
    await vi.waitFor(() =>
      expect(openConfirm()?.textContent).toContain('有未保存的修改'),
    );
    await answerConfirm('取消');
    expect(visible.value).toBe(true);
    expect(form.value.name).toBe('dirty');

    footerButton('取消').click();
    await answerConfirm('放弃修改');
    expect(visible.value).toBe(false);

    // Re-open via remount for a clean edit session.
    for (const entry of mounted.splice(0)) {
      entry.app.unmount();
      entry.host.remove();
    }
    const again = await mountDialog();
    await editName('dirty-2');
    const loadCount = again.load.mock.calls.length;
    footerButton('刷新').click();
    await flush();
    expect(openConfirm()).toBeNull();
    await vi.waitFor(() =>
      expect(again.load.mock.calls.length).toBeGreaterThan(loadCount),
    );
    await vi.waitFor(() => expect(again.form.value.name).toBe('A'));
    expect(load).toHaveBeenCalled();
  });

  it('stays open after save and clears dirty', async () => {
    const { visible, form, saved } = await mountDialog();
    await editName('changed');
    footerButton('保存').click();
    await vi.waitFor(() => expect(saved).toHaveBeenCalledOnce());
    expect(visible.value).toBe(true);
    expect(form.value.name).toBe('changed-saved');
    await flush();

    footerButton('取消').click();
    await flush();
    expect(openConfirm()).toBeNull();
    expect(visible.value).toBe(false);
  });

  it('does not submit while loading', async () => {
    let resolveLoad!: (value: Form) => void;
    const load = vi.fn(
      () =>
        new Promise<Form>((resolve) => {
          resolveLoad = resolve;
        }),
    );
    const visible = ref(true);
    const mode = ref<PlusDialogMode>('edit');
    const index = ref<number | undefined>(0);
    const form = ref<Form>({ id: 1, name: 'A' });
    const save = vi.fn(async (value: Form) => value);

    const Host = defineComponent({
      setup() {
        return () =>
          h(PlusDialog, {
            modelValue: visible.value,
            'onUpdate:modelValue': (v: boolean) => {
              visible.value = v;
            },
            mode: mode.value,
            'onUpdate:mode': (v: PlusDialogMode) => {
              mode.value = v;
            },
            index: index.value,
            'onUpdate:index': (v: number | undefined) => {
              index.value = v;
            },
            form: form.value,
            'onUpdate:form': (v: object) => {
              form.value = v as Form;
            },
            total: 1,
            load,
            save: (value: object) => save(value as Form),
            permissions: { view: true, edit: true, remove: true },
            shapeStorageKey: storageKey,
          });
      },
    });

    const host = document.createElement('div');
    document.body.append(host);
    const app = createApp(Host);
    app.use(ElementPlus);
    app.mount(host);
    mounted.push({ app, host });
    await flush();

    footerButton('保存').click();
    await flush();
    expect(save).not.toHaveBeenCalled();
    expect(ElMessage.warning).toHaveBeenCalled();

    visible.value = false;
    await flush();
    resolveLoad({ id: 2, name: 'late' });
    await vi.waitFor(() => expect(load).toHaveBeenCalled());
    await flush();
    expect(form.value).toEqual({ id: 1, name: 'A' });
  });

  it('keeps the newest record when loads resolve out of order', async () => {
    const dialog = await mountDialog({ mode: 'view' });
    let resolveSecond!: (value: Form) => void;
    let resolveThird!: (value: Form) => void;
    dialog.load.mockImplementation(
      (nextIndex) =>
        new Promise<Form>((resolve) => {
          if (nextIndex === 1) resolveSecond = resolve;
          if (nextIndex === 2) resolveThird = resolve;
        }),
    );

    dialog.index.value = 1;
    await flush();
    dialog.index.value = 2;
    await flush();

    resolveThird({ id: 3, name: 'C' });
    await vi.waitFor(() =>
      expect(dialog.form.value).toEqual({ id: 3, name: 'C' }),
    );
    resolveSecond({ id: 2, name: 'B' });
    await flush();
    expect(dialog.form.value).toEqual({ id: 3, name: 'C' });
  });

  it('prevents duplicate create submits', async () => {
    let resolveCreate!: () => void;
    const created = vi.fn(
      (_value: Form) =>
        new Promise<void>((resolve) => {
          resolveCreate = resolve;
        }),
    );
    const visible = ref(true);
    const mode = ref<PlusDialogMode>('create');
    const index = ref<number | undefined>(undefined);
    const form = ref<Form>({ id: 0, name: 'New' });

    const Host = defineComponent({
      setup() {
        return () =>
          h(PlusDialog, {
            modelValue: visible.value,
            'onUpdate:modelValue': (v: boolean) => {
              visible.value = v;
            },
            mode: mode.value,
            'onUpdate:mode': (v: PlusDialogMode) => {
              mode.value = v;
            },
            index: index.value,
            'onUpdate:index': (v: number | undefined) => {
              index.value = v;
            },
            form: form.value,
            'onUpdate:form': (v: object) => {
              form.value = v as Form;
            },
            total: 0,
            create: async (value: object) => {
              await created(value as Form);
            },
            permissions: {},
            shapeStorageKey: storageKey,
          });
      },
    });

    const host = document.createElement('div');
    document.body.append(host);
    const app = createApp(Host);
    app.use(ElementPlus);
    app.mount(host);
    mounted.push({ app, host });
    await flush();

    footerButton('新增').click();
    footerButton('新增').click();
    await flush();
    expect(created).toHaveBeenCalledOnce();
    resolveCreate();
    await vi.waitFor(() => expect(visible.value).toBe(false));
  });

  it('deletes then opens the neighbor, or closes when empty', async () => {
    const { visible, index, total, removed } = await mountDialog({ index: 1 });

    headerButton('删除').click();
    await answerConfirm('删除');
    await vi.waitFor(() => expect(removed).toHaveBeenCalledOnce());
    await vi.waitFor(() => expect(total.value).toBe(2));
    expect(visible.value).toBe(true);
    expect(index.value).toBe(1);
    await vi.waitFor(() => expect(headerButton('删除').disabled).toBe(false));

    headerButton('删除').click();
    await answerConfirm('删除');
    await vi.waitFor(() => expect(removed).toHaveBeenCalledTimes(2));
    await vi.waitFor(() => expect(headerButton('删除').disabled).toBe(false));
    headerButton('删除').click();
    await answerConfirm('删除');
    await vi.waitFor(() => expect(removed).toHaveBeenCalledTimes(3));
    await vi.waitFor(() => expect(visible.value).toBe(false));
  });

  it('prevents another delete while removal is in flight', async () => {
    const dialog = await mountDialog({ index: 1 });
    let resolveRemove!: () => void;
    dialog.removed.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveRemove = resolve;
        }),
    );

    headerButton('删除').click();
    await answerConfirm('删除');
    headerButton('删除').click();
    await flush();
    expect(dialog.removed).toHaveBeenCalledOnce();
    expect(openConfirm()).toBeNull();

    resolveRemove();
    await vi.waitFor(() =>
      expect(dialog.load.mock.calls.length).toBeGreaterThan(1),
    );
  });

  it('settles a pending confirmation when externally closed', async () => {
    const dialog = await mountDialog();
    await editName('dirty');
    footerButton('取消').click();
    await vi.waitFor(() => expect(openConfirm()).not.toBeNull());

    dialog.visible.value = false;
    await flush();
    dialog.visible.value = true;
    await flush();
    expect(openConfirm()).toBeNull();
  });

  it('persists shape across remounts', async () => {
    await mountDialog({ mode: 'view' });
    headerButton('侧边面板').click();
    await flush();
    expect(localStorage.getItem(storageKey)).toBe('side');

    for (const entry of mounted.splice(0)) {
      entry.app.unmount();
      entry.host.remove();
    }

    await mountDialog({ mode: 'view' });
    const active = document.querySelector(
      '.plus-dialog-header__shapes .is-active',
    );
    expect(active?.getAttribute('aria-label')).toBe('侧边面板');
  });

  it('ignores Escape while editing but closes on Escape in view mode', async () => {
    const pressEscape = () =>
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true,
        }),
      );

    const editing = await mountDialog({ mode: 'edit' });
    pressEscape();
    await flush();
    expect(editing.visible.value).toBe(true);

    for (const entry of mounted.splice(0)) {
      entry.app.unmount();
      entry.host.remove();
    }

    const viewing = await mountDialog({ mode: 'view' });
    pressEscape();
    await vi.waitFor(() => expect(viewing.visible.value).toBe(false));
  });

  it('skips save when validate fails', async () => {
    const { saved } = await mountDialog({ validate: () => false });
    footerButton('保存').click();
    await flush();
    expect(saved).not.toHaveBeenCalled();
  });
});
