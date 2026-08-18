import { describe, expect, it } from 'vitest';
import { PnlMatchingUtil } from '../src/utils/PnlMatchingUtil';
import type { PnlMatchingResult } from '../src/utils/PnlMatchingUtil';

describe('PnlMatchingUtil', () => {
  it('matches sell against earliest buy (FIFO)', () => {
    const result: PnlMatchingResult = PnlMatchingUtil.match([
      { id: 'buy1', tradeDate: '2026-01-05', symbol: '600519', name: '贵州茅台', side: 'buy', price: 1500, quantity: 200, fees: 5 },
      { id: 'buy2', tradeDate: '2026-01-10', symbol: '600519', name: '贵州茅台', side: 'buy', price: 1600, quantity: 200, fees: 5 },
      { id: 'sell1', tradeDate: '2026-01-15', symbol: '600519', name: '贵州茅台', side: 'sell', price: 1700, quantity: 300, fees: 8 },
    ]);
    expect(result.entries).toHaveLength(1);
    const entry = result.entries[0]!;
    expect(entry.matches).toHaveLength(2);
    expect(entry.matches[0]!.buyTradeId).toBe('buy1');
    expect(entry.matches[0]!.matchedQuantity).toBe(200);
    expect(entry.matches[1]!.buyTradeId).toBe('buy2');
    expect(entry.matches[1]!.matchedQuantity).toBe(100);
    expect(entry.realizedPnL).toBeCloseTo((1700 - 1500) * 200 + (1700 - 1600) * 100 - 5 - 2.5 - 8);
    expect(entry.excessQuantity).toBe(0);
  });

  it('allocates buy fees proportionally and keeps holdings for remaining buys', () => {
    const result: PnlMatchingResult = PnlMatchingUtil.match([
      { id: 'buy1', tradeDate: '2026-01-05', symbol: '000001', name: '平安银行', side: 'buy', price: 10, quantity: 500, fees: 10 },
      { id: 'sell1', tradeDate: '2026-01-08', symbol: '000001', name: '平安银行', side: 'sell', price: 11, quantity: 200, fees: 5 },
    ]);
    expect(result.entries[0]!.matches[0]!.allocatedBuyFees).toBeCloseTo(4);
    expect(result.entries[0]!.realizedPnL).toBeCloseTo(200 - 4 - 5);
    expect(result.holdings).toHaveLength(1);
    expect(result.holdings[0]!.quantity).toBe(300);
    expect(result.holdings[0]!.totalBuyFees).toBeCloseTo(6);
  });

  it('clamps excess sells and reports excessQuantity', () => {
    const result: PnlMatchingResult = PnlMatchingUtil.match([
      { id: 'buy1', tradeDate: '2026-01-05', symbol: '600000', name: '浦发银行', side: 'buy', price: 8, quantity: 100, fees: 1 },
      { id: 'sell1', tradeDate: '2026-01-06', symbol: '600000', name: '浦发银行', side: 'sell', price: 9, quantity: 300, fees: 3 },
    ]);
    expect(result.entries[0]!.matchedQuantity).toBe(100);
    expect(result.entries[0]!.excessQuantity).toBe(200);
    expect(result.entries[0]!.realizedPnL).toBeCloseTo(100 - 1 - 3);
  });

  it('sorts by date then createdAt then id and handles coin-toss same-day order', () => {
    const result: PnlMatchingResult = PnlMatchingUtil.match([
      { id: 'buy1', tradeDate: '2026-02-01', symbol: '300750', name: '宁德时代', side: 'buy', price: 200, quantity: 100, fees: 5 },
      { id: 'sell1', tradeDate: '2026-02-01', symbol: '300750', name: '宁德时代', side: 'sell', price: 190, quantity: 100, fees: 5 },
    ]);
    expect(result.entries[0]!.realizedPnL).toBeCloseTo(-1000 - 5 - 5);
  });

  it('produces empty holdings and entries for empty input', () => {
    const result: PnlMatchingResult = PnlMatchingUtil.match([]);
    expect(result.entries).toHaveLength(0);
    expect(result.holdings).toHaveLength(0);
  });
});
