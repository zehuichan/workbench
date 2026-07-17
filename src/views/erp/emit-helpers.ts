import type {
  DocumentLine,
  HeaderEmitRule,
} from '@/composables';

export interface SelectOption {
  label: string;
  value: string | number;
}

export const CURRENCY_OPTIONS: SelectOption[] = [
  { label: '人民币 CNY', value: 'CNY' },
  { label: '美元 USD', value: 'USD' },
  { label: '欧元 EUR', value: 'EUR' },
];

export const WAREHOUSE_OPTIONS: SelectOption[] = [
  { label: '上海仓', value: 'WH-SH' },
  { label: '深圳仓', value: 'WH-SZ' },
  { label: '北京仓', value: 'WH-BJ' },
];

export function money(value: unknown): number {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

export function optionLabel(options: SelectOption[], value: unknown): string {
  return (
    options.find((option) => option.value === value)?.label ?? String(value)
  );
}

export function forceField(
  headerField: string,
  lineField: string,
  requiresConfirmation = true,
): HeaderEmitRule {
  return {
    policy: 'force',
    requiresConfirmation,
    apply: (_line, nextHeader) => ({
      patch: { [lineField]: nextHeader[headerField] },
    }),
  };
}

export function inheritField(
  headerField: string,
  lineField: string,
): HeaderEmitRule {
  return {
    policy: 'inherit',
    apply: (line, nextHeader) =>
      line.fieldSources[lineField] === 'manual'
        ? { preservedFields: [lineField] }
        : { patch: { [lineField]: nextHeader[headerField] } },
  };
}

export function repriceInheritedField(
  lineField: string,
  resolveValue: (line: DocumentLine, header: Record<string, unknown>) => number,
): HeaderEmitRule {
  return {
    policy: 'recalculate',
    requiresConfirmation: true,
    apply: (line, nextHeader) =>
      line.fieldSources[lineField] === 'manual'
        ? { preservedFields: [lineField] }
        : { patch: { [lineField]: resolveValue(line, nextHeader) } },
  };
}

export function sum(lines: DocumentLine[], field: string): number {
  return money(
    lines.reduce((total, line) => total + Number(line[field] ?? 0), 0),
  );
}

export function formatSource(line: DocumentLine, props: string[]): string {
  return props
    .map((prop) => {
      const source = line.fieldSources[prop] ?? 'inherited';
      return `${prop}:${source === 'manual' ? '人工' : '继承'}`;
    })
    .join(' · ');
}
