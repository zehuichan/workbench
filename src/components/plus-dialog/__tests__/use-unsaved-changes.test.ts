import { nextTick, ref } from 'vue';

import { describe, expect, it } from 'vitest';

import { useUnsavedChanges } from '../composables/use-unsaved-changes';

describe('useUnsavedChanges', () => {
  it('tracks dirty state against the baseline and restores', async () => {
    const form = ref({ name: 'A', amount: 1 });
    const { isDirty, reset, restore } = useUnsavedChanges(form);

    reset();
    expect(isDirty.value).toBe(false);

    form.value = { name: 'B', amount: 1 };
    await nextTick();
    expect(isDirty.value).toBe(true);

    restore();
    expect(form.value).toEqual({ name: 'A', amount: 1 });
    expect(isDirty.value).toBe(false);
  });

  it('stays clean when disabled', async () => {
    const form = ref({ name: 'A' });
    const enabled = ref(false);
    const { isDirty, reset } = useUnsavedChanges(form, { enabled });
    reset();
    form.value = { name: 'B' };
    await nextTick();
    expect(isDirty.value).toBe(false);
  });
});
