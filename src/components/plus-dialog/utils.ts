import type { PlusDialogMode } from './types';

/** Title shown in the header and announced as the dialog name. */
export function modeTitle(mode: PlusDialogMode): string {
  switch (mode) {
    case 'create': {
      return '新建';
    }
    case 'edit': {
      return '编辑';
    }
    case 'view': {
      return '查看';
    }
    default: {
      const exhaustive: never = mode;
      return exhaustive;
    }
  }
}
