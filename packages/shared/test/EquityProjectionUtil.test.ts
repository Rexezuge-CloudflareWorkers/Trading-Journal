import { describe, expect, it } from 'vitest';
import { EquityProjectionUtil } from '../src/utils/EquityProjectionUtil';
import type { EquityProjectionResult } from '../src/utils/EquityProjectionUtil';

describe('EquityProjectionUtil', () => {
  it('projects equity from initial capital, cash flows, and realized pnl', () => {
    const result: EquityProjectionResult = EquityProjectionUtil.project({
      initialCapital: 100_000,
      cashFlows: [
        { date: '2026-04-02', type: 'deposit', amount: 50_000 },
        { date: '2026-05-09', type: 'withdraw', amount: 20_000 },
      ],
      realizedPnlEntries: [
        { date: '2026-04-10', realizedPnl: 3_000 },
        { date: '2026-05-20', realizedPnl: -1_000 },
      ],
      snapshots: [],
    });
    expect(result.series).toHaveLength(4);
    expect(result.netDeposits).toBe(30_000);
    expect(result.totalRealizedPnl).toBe(2_000);
    expect(result.finalEquity).toBe(132_000);
    expect(result.series[0]!.equity).toBe(150_000);
  });

  it('prefers snapshots over projection on the same date', () => {
    const result: EquityProjectionResult = EquityProjectionUtil.project({
      initialCapital: 100_000,
      cashFlows: [],
      realizedPnlEntries: [{ date: '2026-03-05', realizedPnl: 10_000 }],
      snapshots: [{ date: '2026-03-05', totalEquity: 96_000 }],
    });
    expect(result.series[0]!.equity).toBe(96_000);
    expect(result.series[0]!.snapshotEquity).toBe(96_000);
    expect(result.series[0]!.projectedEquity).toBe(110_000);
  });

  it('computes drawdown from running peak', () => {
    const result: EquityProjectionResult = EquityProjectionUtil.project({
      initialCapital: 100_000,
      cashFlows: [],
      realizedPnlEntries: [
        { date: '2026-01-05', realizedPnl: 20_000 },
        { date: '2026-01-12', realizedPnl: -30_000 },
        { date: '2026-01-19', realizedPnl: 5_000 },
      ],
      snapshots: [],
    });
    expect(result.maxDrawdown).toBeCloseTo(30_000);
    expect(result.maxDrawdownPercent).toBeCloseTo(25, 1);
  });

  it('handles empty input with flat series at initial capital', () => {
    const result: EquityProjectionResult = EquityProjectionUtil.project({
      initialCapital: 50_000,
      cashFlows: [],
      realizedPnlEntries: [],
      snapshots: [],
    });
    expect(result.series).toHaveLength(0);
    expect(result.finalEquity).toBe(50_000);
  });

  it('handles duplicate dates per type correctly', () => {
    const result: EquityProjectionResult = EquityProjectionUtil.project({
      initialCapital: 100_000,
      cashFlows: [
        { date: '2026-06-01', type: 'deposit', amount: 10_000 },
        { date: '2026-06-01', type: 'withdraw', amount: 4_000 },
      ],
      realizedPnlEntries: [
        { date: '2026-06-01', realizedPnl: 500 },
        { date: '2026-06-01', realizedPnl: -200 },
      ],
      snapshots: [],
    });
    expect(result.series).toHaveLength(1);
    expect(result.series[0]!.equity).toBe(106_300);
  });
});
