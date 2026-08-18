import { describe, expect, it } from 'vitest';
import { CsvUtil } from '../src/utils/CsvUtil';
import type { CsvColumn } from '../src/utils/CsvUtil';
import { MoneyUtil } from '../src/utils/MoneyUtil';

describe('CsvUtil', () => {
  const columns: CsvColumn<Record<string, unknown>>[] = [
    { key: 'date', label: 'Date' },
    { key: 'note', label: 'Note' },
  ];

  it('writes header and rows', () => {
    const csv: string = CsvUtil.toCsv([{ date: '2026-01-05', note: 'ok' }], columns);
    expect(csv).toBe('Date,Note\n2026-01-05,ok');
  });

  it('escapes commas, quotes, and newlines', () => {
    const csv: string = CsvUtil.toCsv([{ date: '2026-01-05', note: 'a,"b"\nc' }], columns);
    expect(csv).toContain('"a,""b""\nc"');
  });
});

describe('MoneyUtil', () => {
  it('rounds to 2 decimals', () => {
    expect(MoneyUtil.round2(10.005)).toBe(10.01);
    expect(MoneyUtil.round2(10.004)).toBe(10);
    expect(MoneyUtil.round2(-3.335)).toBe(-3.33);
  });

  it('formats signed values', () => {
    expect(MoneyUtil.formatSigned(123.4)).toBe('+123.40');
    expect(MoneyUtil.formatSigned(-12)).toBe('-12.00');
  });
});
