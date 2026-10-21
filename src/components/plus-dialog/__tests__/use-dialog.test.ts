import { createApp, h, nextTick } from 'vue';

import ElementPlus from 'element-plus';
import { afterEach, describe, expect, it, vi } from 'vitest';

import DialogHost from './helpers/dialog-host.vue';
import { createPagedRecords } from './helpers/paged-records';

describe('useDialog', () => {
  it('opens a row at its whole-list position', async () => {
    const { dialog, loadPage, rowAt } = createPagedRecords();
    await loadPage(2);

    dialog.open(rowAt(1), 'edit');

    expect(dialog.bindings.value).toMatchObject({
      index: 4,
      mode: 'edit',
      modelValue: true,
      total: 7,
    });
  });

  it('keeps the dialog open and moves to the row a later view request names', async () => {
    const { dialog, loadPage, rowAt } = createPagedRecords();
    await loadPage(1);

    dialog.open(rowAt(0), 'view');
    dialog.open(rowAt(2), 'view');

    expect(dialog.bindings.value).toMatchObject({
      index: 2,
      mode: 'view',
      modelValue: true,
    });
  });

  it('pages the list when loading a record on another page', async () => {
    const { dialog, loadPage, page } = createPagedRecords();
    await loadPage(1);

    const record = await dialog.bindings.value.load(6);

    expect(page.value).toBe(3);
    expect(record).toEqual({ id: 7, name: 'R7-detail' });
  });

  it('rejects a load past the end of the list', async () => {
    const { dialog, loadPage } = createPagedRecords();
    await loadPage(1);

    await expect(dialog.bindings.value.load(9)).rejects.toThrow(
      'No row at index 9',
    );
  });

  it('reloads the current page after save, create, and remove', async () => {
    const { dialog, loadPage, rowAt, rows, total } = createPagedRecords();
    await loadPage(1);

    await dialog.bindings.value.save?.({ id: 2, name: 'saved' });
    expect(rowAt(1).name).toBe('saved');

    await dialog.bindings.value.create?.({ id: 0, name: 'new' });
    expect(total.value).toBe(8);

    await dialog.bindings.value.remove?.({ id: 1, name: 'R1' });
    expect(rows.value.map((row) => row.id)).toEqual([2, 3, 4]);
    expect(total.value).toBe(7);
  });

  it('throws when opening a row that is not on the current page', async () => {
    const { dialog, loadPage } = createPagedRecords();
    await loadPage(1);

    expect(() => dialog.open({ id: 1, name: 'R1' }, 'view')).toThrow(
      'not on the current page',
    );
  });

  it('opens create with a blank form', async () => {
    const { dialog } = createPagedRecords();
    dialog.form.value = { id: 5, name: 'stale' };

    await dialog.openCreate();

    expect(dialog.form.value).toEqual({ id: 0, name: '' });
    expect(dialog.bindings.value).toMatchObject({
      index: undefined,
      mode: 'create',
      modelValue: true,
    });
  });
});

describe('useDialog with PlusDialog', () => {
  const mounted: Array<{ app: ReturnType<typeof createApp>; host: Element }> =
    [];

  afterEach(() => {
    for (const { app, host } of mounted.splice(0)) {
      app.unmount();
      host.remove();
    }
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

  it('opens create over a viewed record without a discard prompt', async () => {
    const records = createPagedRecords();
    await records.loadPage(1);
    const { dialog } = records;

    const host = document.createElement('div');
    document.body.append(host);
    const app = createApp({ render: () => h(DialogHost, { dialog }) });
    app.use(ElementPlus);
    app.mount(host);
    mounted.push({ app, host });

    dialog.open(records.rowAt(0), 'view');
    await vi.waitFor(() => expect(dialog.form.value.name).toBe('R1-detail'));

    await dialog.openCreate();
    await flush();
    const cancel = [
      ...document.querySelectorAll('.plus-dialog-footer button'),
    ].find((el) => el.textContent?.trim() === '取消');
    if (!(cancel instanceof HTMLButtonElement)) {
      throw new TypeError('cancel button not found');
    }
    cancel.click();
    await flush();

    expect(
      document.querySelector('.plus-dialog-confirm[data-state="open"]'),
    ).toBeNull();
    expect(dialog.bindings.value.modelValue).toBe(false);
  });
});
