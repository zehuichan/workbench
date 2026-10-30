import { describe, expect, it } from 'vitest';

import { router } from '@/router';

import { PLAYGROUND_CATEGORIES } from '../playground-categories';

function routesInGroup(group: string) {
  return router.getRoutes().filter((route) => route.meta.group === group);
}

describe('playground categories', () => {
  it('lists every sidebar group once across all categories', () => {
    const groups = PLAYGROUND_CATEGORIES.flatMap((category) => category.groups);

    expect(new Set(groups).size).toBe(groups.length);
  });

  it('claims the group of every grouped route', () => {
    const claimed = new Set(
      PLAYGROUND_CATEGORIES.flatMap((category) => category.groups),
    );
    const orphaned = router
      .getRoutes()
      .filter((route) => route.meta.group && !claimed.has(route.meta.group))
      .map((route) => route.path);

    expect(orphaned).toEqual([]);
  });

  it('gives every listed group at least one route', () => {
    const empty = PLAYGROUND_CATEGORIES.flatMap(
      (category) => category.groups,
    ).filter((group) => routesInGroup(group).length === 0);

    expect(empty).toEqual([]);
  });

  it('groups the scene demos by business domain under scene', () => {
    const scene = PLAYGROUND_CATEGORIES.find(
      (category) => category.key === 'scene',
    );

    expect(
      scene?.groups.map((group) => [
        group,
        routesInGroup(group)
          .toSorted((a, b) => Number(a.meta.order) - Number(b.meta.order))
          .map((route) => route.path),
      ]),
    ).toEqual([
      ['总览', ['/erp/api-overview']],
      ['销售', ['/erp/sales-order-linkage']],
      [
        '采购',
        ['/erp/purchase-order-linkage', '/erp/supplier-quotation-linkage'],
      ],
      ['财务', ['/erp/expense-report-linkage']],
    ]);
  });
});
