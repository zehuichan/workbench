import type { ConfigurableWindow } from '@vueuse/core';

import type { MaybeRefOrGetter } from 'vue';

import { toValue } from 'vue';

import { defaultWindow, tryOnScopeDispose } from '@vueuse/core';

const DRAG_X = '--plus-dialog-drag-x';
const DRAG_Y = '--plus-dialog-drag-y';

export interface UseDragOptions extends ConfigurableWindow {
  /** When false, pointerdown does not start a drag. Read at pointerdown. */
  enabled?: MaybeRefOrGetter<boolean>;
}

export interface UseDragReturn {
  /** Start a drag from the handle's pointerdown. Ignores a non-primary button. */
  onPointerDown: (event: PointerEvent) => void;
  /** Cancel an in-flight drag and return the element to its resting position. */
  reset: () => void;
  /**
   * `translate` value for the dragged element. Pointer moves update
   * `--plus-dialog-drag-x` and `--plus-dialog-drag-y` on that element.
   */
  translate: string;
}

interface DragSession {
  el: HTMLElement;
  frame: number;
  maxX: number;
  maxY: number;
  minX: number;
  minY: number;
  originX: number;
  originY: number;
  pointerId: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
}

/**
 * Drags an element inside the window without rendering on each pointer move.
 *
 * The returned `translate` stays constant. Moves write CSS variables on the
 * element, so a Vue style patch cannot replace the in-flight position.
 * `reset` drops that offset.
 *
 * @param target Element that receives the translate. Read when a drag starts.
 *
 * @example
 * const { translate, onPointerDown, reset } = useDrag(content, {
 *   enabled: () => shape.value === 'center',
 * })
 */
export function useDrag(
  target: MaybeRefOrGetter<HTMLElement | null | undefined>,
  options: UseDragOptions = {},
): UseDragReturn {
  const { window = defaultWindow, enabled = true } = options;
  let x = 0;
  let y = 0;
  let session: DragSession | null = null;
  let stopListen: (() => void) | null = null;

  const paint = (el: HTMLElement, nextX: number, nextY: number): void => {
    el.style.setProperty(DRAG_X, `${nextX}px`);
    el.style.setProperty(DRAG_Y, `${nextY}px`);
  };

  const stopSession = (): void => {
    stopListen?.();
    stopListen = null;
    const active = session;
    session = null;
    if (!active) return;
    if (active.frame) window?.cancelAnimationFrame(active.frame);
    if (active.el.hasPointerCapture?.(active.pointerId)) {
      active.el.releasePointerCapture(active.pointerId);
    }
  };

  const reset = (): void => {
    const el = session?.el ?? toValue(target);
    stopSession();
    x = 0;
    y = 0;
    if (el) paint(el, 0, 0);
  };

  const finish = (): void => {
    const active = session;
    if (!active) return;
    x = active.x;
    y = active.y;
    if (active.frame) window?.cancelAnimationFrame(active.frame);
    active.frame = 0;
    paint(active.el, x, y);
    stopSession();
  };

  const onMove = (event: PointerEvent): void => {
    const active = session;
    if (!active || event.pointerId !== active.pointerId || !window) return;
    active.x = clamp(
      active.startX + event.clientX - active.originX,
      active.minX,
      active.maxX,
    );
    active.y = clamp(
      active.startY + event.clientY - active.originY,
      active.minY,
      active.maxY,
    );
    if (active.frame) return;
    active.frame = window.requestAnimationFrame(() => {
      active.frame = 0;
      if (session !== active) return;
      paint(active.el, active.x, active.y);
    });
  };

  const onEnd = (event: Event): void => {
    if (
      !session ||
      !isPointerEvent(event) ||
      event.pointerId !== session.pointerId
    ) {
      return;
    }
    finish();
  };

  const onPointerDown = (event: PointerEvent): void => {
    if (!window || !toValue(enabled) || event.button !== 0 || session) return;
    const el = toValue(target);
    if (!el) return;
    event.preventDefault();
    const rect = el.getBoundingClientRect();
    const baseLeft = rect.left - x;
    const baseTop = rect.top - y;
    session = {
      el,
      frame: 0,
      maxX: window.innerWidth - baseLeft - rect.width,
      maxY: window.innerHeight - baseTop - rect.height,
      minX: -baseLeft,
      minY: -baseTop,
      originX: event.clientX,
      originY: event.clientY,
      pointerId: event.pointerId,
      startX: x,
      startY: y,
      x,
      y,
    };
    const view = window;
    try {
      el.setPointerCapture(event.pointerId);
    } catch (captureError: unknown) {
      // Capture fails once the pointer is already inactive. Window listeners still track it.
      void captureError;
    }
    view.addEventListener('pointermove', onMove);
    view.addEventListener('pointerup', onEnd);
    view.addEventListener('pointercancel', onEnd);
    el.addEventListener('lostpointercapture', onEnd);
    stopListen = () => {
      view.removeEventListener('pointermove', onMove);
      view.removeEventListener('pointerup', onEnd);
      view.removeEventListener('pointercancel', onEnd);
      el.removeEventListener('lostpointercapture', onEnd);
    };
  };

  tryOnScopeDispose(reset);

  return {
    onPointerDown,
    reset,
    translate: `var(${DRAG_X}, 0px) var(${DRAG_Y}, 0px)`,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isPointerEvent(event: Event): event is PointerEvent {
  return 'pointerId' in event;
}
