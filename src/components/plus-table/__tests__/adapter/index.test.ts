import { describe, expect, it } from 'vitest';
import { ElInput, ElSelectV2 } from 'element-plus';
import { defineComponent } from 'vue';
import { resolveEditor, typedCharToDraft } from '../../adapter';

const ctx = { row: { id: 1 }, rowIndex: 0 };

describe('resolveEditor', () => {
  it('defaults to input when component is omitted', () => {
    const resolved = resolveEditor({}, ctx);
    expect(resolved.component).toBe(ElInput);
    expect(resolved.trigger).toBe('blur');
    expect(resolved.modelProp).toBe('modelValue');
  });

  it('resolves builtin string component and merges componentProps over registry defaults', () => {
    const resolved = resolveEditor(
      {
        component: 'textarea',
        componentProps: { placeholder: '备注' },
      },
      ctx,
    );
    expect(resolved.component).toBe(ElInput);
    expect(resolved.componentProps).toEqual({
      type: 'textarea',
      autosize: true,
      placeholder: '备注',
    });
    expect(resolved.trigger).toBe('blur');
  });

  it('resolves input-number with controls disabled by default', () => {
    const resolved = resolveEditor({ component: 'input-number' }, ctx);
    expect(resolved.componentProps).toEqual({ controls: false });
    expect(resolved.trigger).toBe('blur');
  });

  it('resolves select with change trigger', () => {
    const resolved = resolveEditor(
      {
        component: 'select',
        componentProps: { options: [{ label: 'A', value: 'a' }] },
      },
      ctx,
    );
    expect(resolved.component).toBe(ElSelectV2);
    expect(resolved.trigger).toBe('change');
    expect(resolved.componentProps.options).toEqual([
      { label: 'A', value: 'a' },
    ]);
  });

  it('accepts a Vue component and custom modelProp', () => {
    const Comp = defineComponent({ name: 'CustomEditor', setup: () => () => null });
    const resolved = resolveEditor(
      { component: Comp, modelProp: 'value', componentProps: { size: 'small' } },
      ctx,
    );
    expect(resolved.component).toBe(Comp);
    expect(resolved.modelProp).toBe('value');
    expect(resolved.componentProps).toEqual({ size: 'small' });
    expect(resolved.trigger).toBe('blur');
  });

  it('evaluates function componentProps with row context', () => {
    const resolved = resolveEditor(
      {
        component: 'input',
        componentProps: ({ row }) => ({ placeholder: String(row.id) }),
      },
      ctx,
    );
    expect(resolved.componentProps).toEqual({ placeholder: '1' });
  });

  it('rejects unknown builtin component name', () => {
    expect(() =>
      resolveEditor({ component: 'not-a-editor' as 'input' }, ctx),
    ).toThrow(/未知的 component/);
  });
});

describe('typedCharToDraft', () => {
  it('seeds ElInput with the typed char', () => {
    expect(typedCharToDraft({ component: 'input' }, 'a')).toBe('a');
  });

  it('seeds input-number only for digits', () => {
    expect(typedCharToDraft({ component: 'input-number' }, '3')).toBe(3);
    expect(typedCharToDraft({ component: 'input-number' }, 'x')).toBeUndefined();
  });

  it('does not seed select', () => {
    expect(typedCharToDraft({ component: 'select' }, 'a')).toBeUndefined();
  });
});
