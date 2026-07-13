import { describe, expect, it } from 'vitest';
import autoSave from './composables/use-auto-save-demo.vue?raw';
import formDraft from './composables/use-form-draft-demo.vue?raw';
import saveHotkey from './composables/use-save-hotkey-demo.vue?raw';
import basicEditing from './plus-table/basic-editing-demo.vue?raw';
import dependenciesValidation from './plus-table/dependencies-validation-demo.vue?raw';
import historyDirty from './plus-table/history-dirty-demo.vue?raw';
import paginationRows from './plus-table/pagination-rows-demo.vue?raw';

const demos = [
  {
    path: './plus-table/basic-editing-demo.vue',
    source: basicEditing,
    sections: 2,
    rows: 8,
    content: ['PlusTable Props（本页用到）', 'Column 关键字段', '方向键移动'],
  },
  {
    path: './plus-table/dependencies-validation-demo.vue',
    source: dependenciesValidation,
    sections: 3,
    rows: 10,
    content: ['Column 校验 / 联动', 'dependencies', 'clearValidate'],
  },
  {
    path: './plus-table/history-dirty-demo.vue',
    source: historyDirty,
    sections: 3,
    rows: 10,
    content: ['Expose（历史）', 'Expose（脏追踪）', 'Reset tracking'],
  },
  {
    path: './plus-table/pagination-rows-demo.vue',
    source: paginationRows,
    sections: 4,
    rows: 12,
    content: ['PlusTable Props（分页）', 'Events', 'Slots', '#title', '#summary'],
  },
  {
    path: './composables/use-auto-save-demo.vue',
    source: autoSave,
    sections: 2,
    rows: 11,
    content: ['useFormDraft', 'withPaused', 'localStorage'],
  },
  {
    path: './composables/use-form-draft-demo.vue',
    source: formDraft,
    sections: 2,
    rows: 12,
    content: ['恢复必须显式调用', 'Restore', 'DRAFT_KEY'],
  },
  {
    path: './composables/use-save-hotkey-demo.vue',
    source: saveHotkey,
    sections: 2,
    rows: 5,
    content: ['Ctrl/Cmd+S', 'SaveHotkeyDialogPanel', 'onDeactivated'],
  },
] as const;

describe('demo content contracts', () => {
  it.each(demos)(
    'preserves API, description, and hint content in $path',
    ({ sections, rows, content, source }) => {
      expect(source.match(/<DemoApiTable\b/g)).toHaveLength(sections);
      expect(source.match(/<tr>/g)).toHaveLength(rows);
      expect(source).toContain('<template #description>');
      expect(source).toContain('<template #api>');
      expect(source).toContain('<template #hint>');
      for (const fingerprint of content) expect(source).toContain(fingerprint);
    },
  );
});
