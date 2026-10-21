import type { ComponentType } from '../index';

import { ElCheckbox, ElSwitch } from 'element-plus';
import { beforeAll, describe, expect, it } from 'vitest';

import { initComponentAdapter, useGlobalShareState } from '../index';

const EXPECTED_KEYS: ComponentType[] = [
  'checkbox',
  'date-picker',
  'input',
  'input-number',
  'select',
  'switch',
  'textarea',
  'time-picker',
];

describe('initComponentAdapter', () => {
  beforeAll(() => {
    initComponentAdapter();
  });

  it('registers all ComponentType keys', () => {
    const components = useGlobalShareState().getComponents();
    for (const key of EXPECTED_KEYS) {
      expect(components[key]).toBeTruthy();
    }
  });

  it('leaves unknown names unregistered', () => {
    const components = useGlobalShareState().getComponents();
    expect(Object.hasOwn(components, 'not-a-component')).toBe(false);
  });

  it('keeps switch/checkbox as Element Plus components', () => {
    const components = useGlobalShareState().getComponents();
    expect(components.switch).toBe(ElSwitch);
    expect(components.checkbox).toBe(ElCheckbox);
  });
});
