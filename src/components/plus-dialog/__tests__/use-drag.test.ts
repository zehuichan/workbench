import type { EffectScope } from 'vue';

import { effectScope } from 'vue';

import { afterEach, describe, expect, it } from 'vitest';

import { useDrag } from '../composables/use-drag';

describe('useDrag', () => {
  const scopes: EffectScope[] = [];
  const elements: HTMLElement[] = [];

  afterEach(() => {
    for (const scope of scopes.splice(0)) scope.stop();
    for (const el of elements.splice(0)) el.remove();
  });

  function mount(options?: { enabled?: boolean }) {
    const el = document.createElement('div');
    document.body.append(el);
    elements.push(el);
    let offsetX = 0;
    let offsetY = 0;
    el.getBoundingClientRect = () =>
      ({
        bottom: 120 + offsetY,
        height: 40,
        left: 100 + offsetX,
        right: 150 + offsetX,
        top: 80 + offsetY,
        width: 50,
        x: 100 + offsetX,
        y: 80 + offsetY,
        toJSON: () => ({}),
      }) as DOMRect;
    const read = () => {
      offsetX =
        Number.parseFloat(el.style.getPropertyValue('--plus-dialog-drag-x')) ||
        0;
      offsetY =
        Number.parseFloat(el.style.getPropertyValue('--plus-dialog-drag-y')) ||
        0;
      return { x: offsetX, y: offsetY };
    };
    const scope = effectScope();
    scopes.push(scope);
    const drag = scope.run(() =>
      useDrag(() => el, { enabled: options?.enabled ?? true }),
    );
    if (!drag) throw new Error('drag scope did not start');
    return { drag, el, read };
  }

  function pointer(type: string, x: number, y: number): PointerEvent {
    return new PointerEvent(type, {
      bubbles: true,
      button: 0,
      clientX: x,
      clientY: y,
      pointerId: 1,
    });
  }

  async function frame(): Promise<void> {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }

  it('moves within the window and continues from the committed offset', async () => {
    const { drag, read } = mount();

    drag.onPointerDown(pointer('pointerdown', 10, 20));
    window.dispatchEvent(pointer('pointermove', 50, 45));
    await frame();
    expect(read()).toEqual({ x: 40, y: 25 });

    window.dispatchEvent(pointer('pointerup', 50, 45));
    drag.onPointerDown(pointer('pointerdown', 0, 0));
    window.dispatchEvent(pointer('pointermove', 10, -5));
    await frame();
    expect(read()).toEqual({ x: 50, y: 20 });
  });

  it('clamps the element to the window edges', async () => {
    const { drag, read } = mount();

    drag.onPointerDown(pointer('pointerdown', 0, 0));
    window.dispatchEvent(pointer('pointermove', -1000, -1000));
    await frame();
    expect(read()).toEqual({ x: -100, y: -80 });

    window.dispatchEvent(
      pointer(
        'pointermove',
        window.innerWidth + 1000,
        window.innerHeight + 1000,
      ),
    );
    await frame();
    expect(read()).toEqual({
      x: window.innerWidth - 150,
      y: window.innerHeight - 120,
    });
  });

  it('ignores a disabled handle and drops the offset on reset', async () => {
    const disabled = mount({ enabled: false });
    disabled.drag.onPointerDown(pointer('pointerdown', 0, 0));
    window.dispatchEvent(pointer('pointermove', 30, 30));
    await frame();
    expect(disabled.read()).toEqual({ x: 0, y: 0 });

    const { drag, read } = mount();
    drag.onPointerDown(pointer('pointerdown', 0, 0));
    window.dispatchEvent(pointer('pointermove', 12, 8));
    await frame();
    drag.reset();
    expect(read()).toEqual({ x: 0, y: 0 });
    window.dispatchEvent(pointer('pointermove', 40, 40));
    await frame();
    expect(read()).toEqual({ x: 0, y: 0 });
  });
});
