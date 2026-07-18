import { ref } from 'vue';
import { describe, expect, it } from 'vitest';
import { createTableExpose } from '../../table/expose-helper';

describe('PlusTable expose proxy', () => {
  it('prioritizes PlusTable APIs and binds ElTable passthrough methods', () => {
    const table = {
      marker: 'el-table',
      shared: () => 'el',
      readMarker() {
        return this.marker;
      },
    };
    const exposed = createTableExpose(
      { shared: () => 'plus', plusOnly: () => 'plus-only' },
      ref(table),
    );

    expect(exposed.shared()).toBe('plus');
    expect(exposed.plusOnly()).toBe('plus-only');
    expect(exposed.readMarker()).toBe('el-table');
    expect(exposed.readMarker).toBe(exposed.readMarker);
    expect('readMarker' in exposed).toBe(true);
  });

  it('returns undefined for passthrough members before ElTable mounts', () => {
    const table = ref<{ clearSelection: () => void }>();
    const exposed = createTableExpose({ validate: () => true }, table);

    expect(exposed.clearSelection).toBeUndefined();
    expect('clearSelection' in exposed).toBe(false);
  });
});
