import { describe, expect, it } from 'vitest';
import { router } from './index';

const expectedRoutes = [
  ['/plus-table/basic-editing', '基础编辑', 'PlusTable', 1],
  ['/plus-table/dependencies-validation', '联动与校验', 'PlusTable', 2],
  ['/plus-table/history-dirty', '历史与脏追踪', 'PlusTable', 3],
  ['/plus-table/pagination-rows', '分页与行操作', 'PlusTable', 4],
  ['/composables/use-auto-save', 'useAutoSave', 'Composables', 1],
  ['/composables/use-form-draft', 'useFormDraft', 'Composables', 2],
  ['/composables/use-save-hotkey', 'useSaveHotkey', 'Composables', 3],
] as const;

describe('demo routes', () => {
  it('keeps route metadata as the ordered navigation source', () => {
    const groupOrder = { PlusTable: 0, Composables: 1 };
    const routes = router
      .getRoutes()
      .filter(
        (route) =>
          route.meta.group &&
          route.meta.group in groupOrder,
      )
      .sort((left, right) => {
        const leftGroup =
          groupOrder[left.meta.group as keyof typeof groupOrder];
        const rightGroup =
          groupOrder[right.meta.group as keyof typeof groupOrder];
        return (
          leftGroup - rightGroup ||
          Number(left.meta.order) - Number(right.meta.order)
        );
      })
      .map((route) => [
        route.path,
        route.meta.title,
        route.meta.group,
        route.meta.order,
      ]);

    expect(routes).toEqual(expectedRoutes);
  });
});
