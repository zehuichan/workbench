import type { EffectScope, Ref } from 'vue';

import type { EmitEffectRules } from '../../use-emit-effect/emit-effect';
import type {
  UseEmitEffectOptions,
  UseEmitEffectReturn,
} from '../../use-emit-effect/use-emit-effect';

import { effectScope, nextTick, reactive, ref } from 'vue';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { defined } from '@/utils/defined';

import { defineEmitRules } from '../../use-emit-effect/emit-effect';
import {
  defaultEquals,
  useEmitEffect,
} from '../../use-emit-effect/use-emit-effect';

interface Item {
  amount: null | number;
  id: number;
  price: null | number;
  productId: string;
  qty: number;
}

interface Form {
  currency: string;
  discount: number;
  items: Item[];
  rate: null | number;
  total: null | number;
}

const RATES: Record<string, number> = { CNY: 1, USD: 7 };
const PRICES: Record<string, number> = { pen: 10, book: 50 };

function createRules(spies: { amount?: () => void; total?: () => void } = {}) {
  return defineEmitRules<Form>({
    rate: { default: ({ form }) => RATES[form.currency] },
    total: ({ form }) => {
      spies.total?.();
      return form.items.reduce((sum, item) => sum + (item.amount ?? 0), 0);
    },
    items: {
      price: {
        default: ({ row, form }) =>
          (PRICES[row.productId] ?? 0) * (1 - form.discount),
        confirm: true,
      },
      amount: ({ row }) => {
        spies.amount?.();
        return row.qty * (row.price ?? 0);
      },
    },
  });
}

function createForm(): Form {
  return {
    currency: 'CNY',
    rate: null,
    discount: 0,
    total: null,
    items: [
      { id: 1, productId: 'pen', qty: 2, price: null, amount: null },
      { id: 2, productId: 'book', qty: 1, price: 45, amount: null },
    ],
  };
}

function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

async function settle(api: { pending: Readonly<Ref<boolean>> }): Promise<void> {
  for (let i = 0; i < 200 && api.pending.value; i++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  expect(api.pending.value).toBe(false);
}

describe('useEmitEffect', () => {
  let scope: EffectScope;

  beforeEach(() => {
    scope = effectScope();
  });

  afterEach(() => {
    scope.stop();
  });

  function mount(
    form: Form | Ref<Form>,
    options: UseEmitEffectOptions = {},
    rules = createRules(),
  ): UseEmitEffectReturn<Form> {
    return defined(scope.run(() => useEmitEffect(form, rules, options)));
  }

  it('attaches without rewriting any loaded value', async () => {
    const form = ref(createForm());
    const api = mount(form);
    await settle(api);
    expect(form.value.rate).toBeNull();
    expect(defined(form.value.items[0]).amount).toBeNull();
    expect(form.value.total).toBeNull();
  });

  it('normalizes on attach when immediate is set', async () => {
    const form = ref(createForm());
    const api = mount(form, { immediate: true });
    await settle(api);
    expect(form.value.rate).toBe(1);
    expect(form.value.items.map((item) => item.amount)).toEqual([20, 45]);
    expect(defined(form.value.items[1]).price).toBe(45);
    expect(form.value.total).toBe(65);
  });

  it('propagates plain assignments on the header', async () => {
    const form = ref(createForm());
    const api = mount(form, { immediate: true });
    await settle(api);

    form.value.currency = 'USD';
    await settle(api);
    expect(form.value.rate).toBe(7);
    expect(api.isManual('currency')).toBe(false);
  });

  it('propagates row edits and re-aggregates the header', async () => {
    const form = ref(createForm());
    const api = mount(form, { immediate: true });
    await settle(api);

    defined(form.value.items[0]).qty = 5;
    await settle(api);
    expect(defined(form.value.items[0]).amount).toBe(50);
    expect(form.value.total).toBe(95);
  });

  it('handles push and splice on sub-tables', async () => {
    const form = ref(createForm());
    const api = mount(form, { immediate: true });
    await settle(api);

    form.value.items.push({
      id: 3,
      productId: 'book',
      qty: 2,
      price: null,
      amount: null,
    });
    await settle(api);
    expect(defined(form.value.items[2]).price).toBe(50);
    expect(defined(form.value.items[2]).amount).toBe(100);
    expect(form.value.total).toBe(165);

    form.value.items.splice(0, 1);
    await settle(api);
    expect(form.value.total).toBe(145);
  });

  it('works with a reactive object as well as a ref', async () => {
    const form = reactive(createForm());
    const api = mount(form, { immediate: true });
    await settle(api);
    defined(form.items[0]).qty = 3;
    await settle(api);
    expect(defined(form.items[0]).amount).toBe(30);
    expect(form.total).toBe(75);
  });

  it('marks edited default fields manual and preserves them across header changes', async () => {
    const form = ref(createForm());
    const api = mount(form, { immediate: true });
    await settle(api);

    defined(form.value.items[0]).price = 8;
    await settle(api);
    expect(api.isManual([defined(form.value.items[0]), 'price'])).toBe(true);
    expect(defined(form.value.items[0]).amount).toBe(16);

    form.value.discount = 0.5;
    await settle(api);
    expect(defined(form.value.items[0]).price).toBe(8);
    expect(defined(form.value.items[1]).price).toBe(25);
  });

  it('clears the manual mark when a same-row dependency is edited', async () => {
    const form = ref(createForm());
    const api = mount(form, { immediate: true });
    await settle(api);

    defined(form.value.items[0]).price = 8;
    await settle(api);
    defined(form.value.items[0]).productId = 'book';
    await settle(api);
    expect(api.isManual([defined(form.value.items[0]), 'price'])).toBe(false);
    expect(defined(form.value.items[0]).price).toBe(50);
  });

  it('restores a manual field from its rule', async () => {
    const form = ref(createForm());
    const api = mount(form, { immediate: true });
    await settle(api);

    defined(form.value.items[0]).price = 8;
    await settle(api);
    await api.restore([defined(form.value.items[0]), 'price']);
    expect(defined(form.value.items[0]).price).toBe(10);
    expect(api.isManual([defined(form.value.items[0]), 'price'])).toBe(false);

    form.value.rate = 9;
    await settle(api);
    expect(api.isManual('rate')).toBe(true);
    await api.restore('rate');
    expect(form.value.rate).toBe(1);
  });

  it('treats a full replacement of form.value as loading: nothing rewritten, manual marks dropped', async () => {
    const form = ref(createForm());
    const api = mount(form, { immediate: true });
    await settle(api);
    defined(form.value.items[0]).price = 8;
    await settle(api);

    const loaded = createForm();
    defined(loaded.items[0]).amount = 999;
    form.value = loaded;
    await settle(api);
    expect(defined(form.value.items[0]).amount).toBe(999);
    expect(form.value.total).toBeNull();
    expect(api.isManual([defined(form.value.items[0]), 'price'])).toBe(false);

    defined(form.value.items[0]).qty = 4;
    await settle(api);
    expect(defined(form.value.items[0]).price).toBeNull();
    expect(defined(form.value.items[0]).amount).toBe(0);
  });

  it('hydrate() wraps partial assignment without triggering rules', async () => {
    const form = ref(createForm());
    const api = mount(form, { immediate: true });
    await settle(api);

    await api.hydrate(() => {
      Object.assign(form.value, { currency: 'USD', total: 123 });
      defined(form.value.items[0]).qty = 10;
    });
    expect(form.value.rate).toBe(1);
    expect(form.value.total).toBe(123);
    expect(defined(form.value.items[0]).amount).toBe(20);

    defined(form.value.items[0]).qty = 11;
    await settle(api);
    expect(defined(form.value.items[0]).amount).toBe(110);
  });

  it('normalize() recomputes compute fields but keeps stored default values', async () => {
    const form = ref(createForm());
    defined(form.value.items[0]).amount = 1;
    const api = mount(form);
    await settle(api);

    await api.normalize();
    expect(defined(form.value.items[0]).amount).toBe(20);
    expect(defined(form.value.items[1]).price).toBe(45);
    expect(form.value.total).toBe(65);
  });

  it('ignores edits that are equal under the equality option', async () => {
    const amount = vi.fn();
    const form = ref(createForm());
    const api = mount(form, { immediate: true }, createRules({ amount }));
    await settle(api);
    amount.mockClear();

    (form.value.items[0] as unknown as Record<string, unknown>).qty = '2';
    await settle(api);
    expect(amount).not.toHaveBeenCalled();
    expect(defined(form.value.items[0]).amount).toBe(20);
  });

  it('defaultEquals treats numeric strings as numbers and compares objects deeply', () => {
    expect(defaultEquals(1023, '1023')).toBe(true);
    expect(defaultEquals('', 0)).toBe(false);
    expect(defaultEquals({ a: [1] }, { a: [1] })).toBe(true);
    expect(defaultEquals(null, undefined)).toBe(false);
  });

  it('does not re-trigger rules through its own write-back', async () => {
    const total = vi.fn();
    const form = ref(createForm());
    const api = mount(form, { immediate: true }, createRules({ total }));
    await settle(api);
    total.mockClear();

    defined(form.value.items[0]).qty = 3;
    await settle(api);
    expect(total).toHaveBeenCalledTimes(1);
  });

  it('asks for confirmation once and rolls the header back when rejected', async () => {
    const confirm = vi.fn<NonNullable<UseEmitEffectOptions['confirm']>>(
      async () => false,
    );
    const form = ref(createForm());
    const api = mount(form, { immediate: true, confirm });
    await settle(api);

    form.value.discount = 0.5;
    await settle(api);
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(defined(confirm.mock.calls[0])[0]).toMatchObject({
      field: 'discount',
      oldValue: 0,
      newValue: 0.5,
      preservedCount: 0,
    });
    expect(form.value.discount).toBe(0);
    expect(defined(form.value.items[0]).price).toBe(10);
    expect(form.value.total).toBe(65);
  });

  it('applies the change when the confirmation is accepted', async () => {
    const form = ref(createForm());
    const api = mount(form, { immediate: true, confirm: async () => true });
    await settle(api);

    form.value.discount = 0.5;
    await settle(api);
    expect(defined(form.value.items[0]).price).toBe(5);
    expect(defined(form.value.items[1]).price).toBe(25);
    expect(form.value.total).toBe(35);
  });

  it('does not ask for confirmation on row edits', async () => {
    const confirm = vi.fn(async () => true);
    const form = ref(createForm());
    const api = mount(form, { immediate: true, confirm });
    await settle(api);

    defined(form.value.items[0]).productId = 'book';
    await settle(api);
    expect(confirm).not.toHaveBeenCalled();
    expect(defined(form.value.items[0]).price).toBe(50);
  });

  it('runs queued propagations in order and reports pending', async () => {
    const form = ref(createForm());
    const api = mount(form, { immediate: true });
    await settle(api);

    defined(form.value.items[0]).qty = 3;
    defined(form.value.items[1]).qty = 4;
    expect(api.pending.value).toBe(true);
    await settle(api);
    expect(form.value.items.map((item) => item.amount)).toEqual([30, 180]);
    expect(form.value.total).toBe(210);
  });

  it('routes propagation failures to onError', async () => {
    const onError = vi.fn();
    const rules = defineEmitRules<Form>({
      total: ({ form }) => {
        if (form.discount > 0) throw new Error('boom');
        return 0;
      },
    });
    const form = ref(createForm());
    const api = defined(
      scope.run(() => useEmitEffect(form, rules, { onError })),
    );
    await settle(api);
    form.value.discount = 1;
    await settle(api);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(
      String((defined(onError.mock.calls[0])[0] as Error).message),
    ).toMatch(/total/);
  });

  describe('async rules', () => {
    interface LookupForm {
      code: string;
      items: { id: number; price: null | number; productId: string }[];
      label: null | string;
    }

    function mountLookup(
      form: Ref<LookupForm>,
      rules: EmitEffectRules<LookupForm>,
      options: UseEmitEffectOptions = {},
    ): UseEmitEffectReturn<LookupForm> {
      return defined(scope.run(() => useEmitEffect(form, rules, options)));
    }

    /** A `label` rule that stays pending for `code === 'slow'` until `lookup` resolves. */
    function slowLabel() {
      const started = deferred<undefined>();
      const lookup = deferred<string>();
      const rules = defineEmitRules<LookupForm>({
        label: ({ form }) => {
          if (form.code !== 'slow') return undefined;
          started.resolve(undefined);
          return lookup.promise;
        },
      });
      return { lookup, rules, started };
    }

    it('keeps a document loaded while an earlier propagation was running', async () => {
      const { lookup, rules, started } = slowLabel();
      const form = ref<LookupForm>({ code: 'a', label: null, items: [] });
      const api = mountLookup(form, rules);
      await settle(api);

      form.value.code = 'slow';
      await started.promise;
      form.value = { code: 'loaded', label: 'from-server', items: [] };
      lookup.resolve('STALE');
      await settle(api);
      expect(form.value.label).toBe('from-server');
    });

    it('discards a running propagation when hydrate starts', async () => {
      const { lookup, rules, started } = slowLabel();
      const form = ref<LookupForm>({ code: 'a', label: null, items: [] });
      const api = mountLookup(form, rules);
      await settle(api);

      form.value.code = 'slow';
      await started.promise;
      await api.hydrate(() => {
        lookup.resolve('STALE');
        Object.assign(form.value, { code: 'loaded' });
      });
      expect(form.value.label).toBeNull();
    });

    it('keeps a value the user typed while a propagation was running', async () => {
      const started = deferred<undefined>();
      const lookup = deferred<number>();
      const form = ref<LookupForm>({
        code: '',
        label: null,
        items: [{ id: 1, productId: 'pen', price: 10 }],
      });
      const api = mountLookup(
        form,
        {
          items: {
            price: {
              default: ({ row }) => {
                if (row.productId !== 'slow') return 10;
                started.resolve(undefined);
                return lookup.promise;
              },
            },
          },
        },
        { immediate: true },
      );
      await settle(api);

      const row = defined(form.value.items[0]);
      row.productId = 'slow';
      await started.promise;
      row.price = 8;
      lookup.resolve(99);
      await settle(api);
      expect(row.price).toBe(8);
      expect(api.isManual([row, 'price'])).toBe(true);
    });
  });

  it('retries the edits of a failed propagation with the next one', async () => {
    interface QtyForm {
      amount: null | number;
      label: null | string;
      note: string;
      qty: number;
    }
    let lookupUp = false;
    const onError = vi.fn();
    const form = ref<QtyForm>({ qty: 1, amount: null, label: null, note: '' });
    const api = defined(
      scope.run(() =>
        useEmitEffect(
          form,
          defineEmitRules<QtyForm>({
            amount: ({ form }) => form.qty * 2,
            label: ({ form }) => {
              if (form.qty === 5 && !lookupUp) throw new Error('lookup down');
              return `q${form.qty}`;
            },
          }),
          { immediate: true, onError },
        ),
      ),
    );
    await settle(api);

    form.value.qty = 5;
    await settle(api);
    expect(onError).toHaveBeenCalled();
    expect(form.value.amount).toBe(2);

    lookupUp = true;
    form.value.note = 'unrelated';
    await settle(api);
    expect(form.value.amount).toBe(10);
    expect(form.value.label).toBe('q5');
  });

  it('restore() rejects a row outside the form and a field without a rule', async () => {
    const form = ref(createForm());
    const api = mount(form, { immediate: true });
    await settle(api);

    await expect(
      api.restore([{ id: 9, productId: 'pen', qty: 1 }, 'price']),
    ).rejects.toThrow(/行不在表单/);
    await expect(api.restore('currency')).rejects.toThrow(/currency 没有规则/);
  });

  it('stops watching when the scope is disposed', async () => {
    const form = ref(createForm());
    const api = mount(form, { immediate: true });
    await settle(api);
    scope.stop();
    defined(form.value.items[0]).qty = 9;
    await nextTick();
    await settle(api);
    expect(defined(form.value.items[0]).amount).toBe(20);
  });
});
