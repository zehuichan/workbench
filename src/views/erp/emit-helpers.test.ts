import { describe, expect, it } from 'vitest';
import {
  defaultExchangeRate,
  forceCurrencyWithRate,
  syncExchangeRateIfStillDefault,
} from './emit-helpers';

describe('emit-helpers exchange rate', () => {
  it('returns demo defaults', () => {
    expect(defaultExchangeRate('CNY')).toBe(1);
    expect(defaultExchangeRate('USD')).toBe(7.2);
    expect(defaultExchangeRate('EUR')).toBe(7.8);
  });

  it('overwrites rate only when previous rate is still the old default', () => {
    const next = { currency: 'USD', exchangeRate: 1 };
    syncExchangeRateIfStillDefault(next, {
      currency: 'CNY',
      exchangeRate: 1,
    });
    expect(next.exchangeRate).toBe(7.2);

    const kept = { currency: 'USD', exchangeRate: 6.5 };
    syncExchangeRateIfStillDefault(kept, {
      currency: 'CNY',
      exchangeRate: 6.5,
    });
    expect(kept.exchangeRate).toBe(6.5);
  });

  it('forceCurrencyWithRate patches currency and syncs header rate idempotently', () => {
    const rule = forceCurrencyWithRate();
    const nextHeader = { currency: 'USD', exchangeRate: 1 };
    const previousHeader = { currency: 'CNY', exchangeRate: 1 };
    const line = {
      id: '1',
      fieldSources: {},
      currency: 'CNY',
    };

    const first = rule.apply(line, nextHeader, previousHeader);
    expect(first.patch).toEqual({ currency: 'USD' });
    expect(nextHeader.exchangeRate).toBe(7.2);

    const second = rule.apply(line, nextHeader, previousHeader);
    expect(second.patch).toEqual({ currency: 'USD' });
    expect(nextHeader.exchangeRate).toBe(7.2);
  });
});
