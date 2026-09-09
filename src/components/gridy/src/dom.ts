/** 展示序行属性名（原 data-index）；与原始数据下标 dataIndex 区分 */
export const VIEW_INDEX_ATTR = 'data-view-index';

/**
 * 只匹配本表直属的行：展开面板里可能嵌套另一个 Gridy，它的第 N 行在文档序上先于外层第 N 行，
 * 不加 `:scope >` 限定会命中子表。每行一个 tbody，主行是 tbody 的直接子元素。
 */
function ownRowSelector(viewIndex: number): string {
  return `:scope > .gridy__table > tbody > tr[${VIEW_INDEX_ATTR}="${viewIndex}"]`;
}

export function findRow(container: HTMLElement, viewIndex: number): HTMLElement | null {
  return container.querySelector<HTMLElement>(ownRowSelector(viewIndex));
}

export function findCell(
  container: HTMLElement,
  viewIndex: number,
  field: string,
): HTMLElement | null {
  const rowEl = findRow(container, viewIndex);
  if (!rowEl) {
    return null;
  }
  for (const cell of rowEl.querySelectorAll<HTMLElement>('td[data-field]')) {
    if (cell.dataset.field === field) {
      return cell;
    }
  }
  return null;
}

/** 本表直属的 thead / tfoot（子表的 tfoot 在文档序上先于外层的） */
export function findSection(
  container: HTMLElement,
  section: 'tfoot' | 'thead',
): HTMLElement | null {
  return container.querySelector<HTMLElement>(`:scope > .gridy__table > ${section}`);
}

export function waitForFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

/**
 * 滚动可视区：吸顶表头（thead sticky，见 components/body.vue）会遮住 tbody 顶部，
 * 真正可见区间是 [containerTop + theadHeight, containerBottom]。
 * 键盘导航（use-keyboard）与行跳转（use-virtual）共用这套边界与滚动补正，避免两处各写一份、行为漂移。
 */
interface ViewBounds {
  bottomBound: number;
  elRect: DOMRect;
  topBound: number;
}

function viewBounds(container: HTMLElement, el: HTMLElement): ViewBounds {
  const headerHeight =
    container.querySelector<HTMLElement>('thead')?.getBoundingClientRect().height ?? 0;
  const containerRect = container.getBoundingClientRect();
  return {
    bottomBound: containerRect.bottom,
    elRect: el.getBoundingClientRect(),
    topBound: containerRect.top + headerHeight,
  };
}

/**
 * el 是否已完整落在可视区内（表头下方、容器底边上方）。
 * alignEnd 额外要求贴近底部——下方留白不超过一行自身高度，用于「跳转后目标行贴底」语义的判定。
 */
export function isInView(
  container: HTMLElement,
  el: HTMLElement,
  options: { alignEnd?: boolean } = {},
): boolean {
  const { bottomBound, elRect, topBound } = viewBounds(container, el);
  if (elRect.top < topBound - 1 || elRect.bottom > bottomBound + 1) {
    return false;
  }
  return options.alignEnd ? bottomBound - elRect.bottom <= elRect.height : true;
}

/**
 * 最小移动把 el 滚进可视区：在表头下方露头、或在容器底边内露尾。
 * alignEnd 时若已完整可见但下方留白超过一行，进一步把 el 贴到底边。
 */
export function scrollIntoView(
  container: HTMLElement,
  el: HTMLElement,
  options: { alignEnd?: boolean } = {},
): void {
  const { bottomBound, elRect, topBound } = viewBounds(container, el);
  if (elRect.top < topBound) {
    container.scrollTop -= topBound - elRect.top;
  } else if (elRect.bottom > bottomBound) {
    container.scrollTop += elRect.bottom - bottomBound;
  } else if (options.alignEnd && bottomBound - elRect.bottom > elRect.height) {
    container.scrollTop -= bottomBound - elRect.bottom;
  }
}
