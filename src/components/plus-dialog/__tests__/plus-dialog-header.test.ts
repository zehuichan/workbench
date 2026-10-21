import type {
  PlusDialogMode,
  PlusDialogPermissions,
  PlusDialogShape,
} from '../types';

import { createApp, h, nextTick } from 'vue';

import ElementPlus from 'element-plus';
import { afterEach, describe, expect, it, vi } from 'vitest';

import PlusDialogHeader from '../plus-dialog-header.vue';

describe('PlusDialogHeader', () => {
  const mounted: Array<{ app: ReturnType<typeof createApp>; host: Element }> =
    [];

  async function mount(props: {
    mode: PlusDialogMode;
    onClose?: () => void;
    onNext?: () => void;
    onPrev?: () => void;
    onRemove?: () => void;
    onToggleMode?: () => void;
    onUpdateShape?: (shape: PlusDialogShape) => void;
    permissions?: PlusDialogPermissions;
    position?: number;
    shape?: PlusDialogShape;
    total?: number;
  }) {
    const host = document.createElement('div');
    document.body.append(host);
    const app = createApp({
      render: () =>
        h(PlusDialogHeader, {
          mode: props.mode,
          position: props.position ?? 1,
          total: props.total ?? 10,
          permissions: props.permissions ?? {
            view: true,
            edit: true,
            remove: true,
          },
          shape: props.shape ?? 'center',
          onPrev: props.onPrev,
          onNext: props.onNext,
          onToggleMode: props.onToggleMode,
          onRemove: props.onRemove,
          'onUpdate:shape': props.onUpdateShape,
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

  it('shows title, pager, record actions, shapes, and close in edit mode', async () => {
    const host = await mount({ mode: 'edit', position: 2, total: 10 });

    expect(host.querySelector('.plus-dialog-header__title')?.textContent).toBe(
      '编辑',
    );
    expect(host.querySelector('.plus-dialog-header__pager')).not.toBeNull();
    expect(
      host
        .querySelector('.plus-dialog-header__pager-text')
        ?.textContent?.trim(),
    ).toBe('2 / 10');
    expect(host.querySelector('.plus-dialog-header__actions')).not.toBeNull();
    const actionButtons = host.querySelectorAll(
      '.plus-dialog-header__actions .el-button.is-dashed',
    );
    expect(actionButtons).toHaveLength(2);
    expect(actionButtons[0]?.getAttribute('aria-label')).toBe('查看');
    expect(actionButtons[1]?.getAttribute('aria-label')).toBe('删除');
    expect(
      host.querySelector('.plus-dialog-header__actions .el-divider'),
    ).toBeNull();
    expect(
      host.querySelectorAll('.plus-dialog-header > .el-divider--vertical'),
    ).toHaveLength(2);
    expect(
      host.querySelector('.plus-dialog-header__actions')?.textContent?.trim(),
    ).toBe('');
    expect(host.querySelector('.plus-dialog-header__shapes')).not.toBeNull();
    expect(host.querySelector('.plus-dialog-header__close')).not.toBeNull();
  });

  it('hides pager and record actions in create mode', async () => {
    const host = await mount({ mode: 'create' });

    expect(host.querySelector('.plus-dialog-header__title')?.textContent).toBe(
      '新建',
    );
    expect(host.querySelector('.plus-dialog-header__pager')).toBeNull();
    expect(host.querySelector('.plus-dialog-header__actions')).toBeNull();
  });

  it('disables prev on first and next on last', async () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();
    const first = await mount({
      mode: 'view',
      position: 1,
      total: 5,
      onPrev,
      onNext,
    });
    const prevBtn = first.querySelector(
      '.plus-dialog-header__pager button[aria-label="上一条"]',
    ) as HTMLButtonElement;
    expect(prevBtn.disabled).toBe(true);

    const last = await mount({
      mode: 'view',
      position: 5,
      total: 5,
      onPrev,
      onNext,
    });
    const nextBtn = last.querySelector(
      '.plus-dialog-header__pager button[aria-label="下一条"]',
    ) as HTMLButtonElement;
    expect(nextBtn.disabled).toBe(true);
  });

  it('omits the record-actions segment when nothing is allowed', async () => {
    const host = await mount({
      mode: 'edit',
      permissions: { view: false, edit: false, remove: false },
    });
    expect(host.querySelector('.plus-dialog-header__actions')).toBeNull();
  });

  it('highlights the current shape', async () => {
    const host = await mount({ mode: 'view', shape: 'side' });
    const active = host.querySelector(
      '.plus-dialog-header__shapes .is-active',
    ) as HTMLButtonElement;
    expect(active?.getAttribute('aria-label')).toBe('侧边面板');
  });

  it('emits close from the trailing button', async () => {
    const onClose = vi.fn();
    const host = await mount({ mode: 'view', onClose });
    const close = host.querySelector(
      '.plus-dialog-header__close button',
    ) as HTMLButtonElement;
    close.click();
    expect(onClose).toHaveBeenCalledOnce();
  });
});
