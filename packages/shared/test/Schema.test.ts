import { describe, expect, it } from 'vitest';
import { CashFlowInputSchema, TradeInputSchema } from '../src/schema';

describe('TradeInputSchema', () => {
  it('accepts a valid buy trade', () => {
    const result = TradeInputSchema.safeParse({
      tradeDate: '2026-01-05',
      symbol: '600519',
      name: '贵州茅台',
      side: 'buy',
      price: 1500.5,
      quantity: 100,
      fees: 5.5,
      strategy: '突破',
      tags: ['龙头'],
      reason: '放量突破平台',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid date format', () => {
    const result = TradeInputSchema.safeParse({ tradeDate: '2026/01/05', symbol: '600519', side: 'buy', price: 10, quantity: 100 });
    expect(result.success).toBe(false);
  });

  it('rejects non-multiple-of-0.01 price', () => {
    const result = TradeInputSchema.safeParse({ tradeDate: '2026-01-05', symbol: '600519', side: 'buy', price: 10.001, quantity: 100 });
    expect(result.success).toBe(false);
  });

  it('rejects zero quantity and negative fees', () => {
    expect(TradeInputSchema.safeParse({ tradeDate: '2026-01-05', symbol: '600519', side: 'buy', price: 10, quantity: 0 }).success).toBe(
      false,
    );
    expect(
      TradeInputSchema.safeParse({ tradeDate: '2026-01-05', symbol: '600519', side: 'buy', price: 10, quantity: 100, fees: -1 }).success,
    ).toBe(false);
  });

  it('defaults optional fields', () => {
    const result = TradeInputSchema.safeParse({ tradeDate: '2026-01-05', symbol: '600519', side: 'buy', price: 10, quantity: 100 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fees).toBe(0);
      expect(result.data.tags).toEqual([]);
      expect(result.data.reason).toBe('');
    }
  });
});

describe('CashFlowInputSchema', () => {
  it('accepts deposit and withdraw', () => {
    expect(CashFlowInputSchema.safeParse({ date: '2026-01-05', type: 'deposit', amount: 100_000 }).success).toBe(true);
    expect(CashFlowInputSchema.safeParse({ date: '2026-01-05', type: 'withdraw', amount: 10_000 }).success).toBe(true);
  });

  it('rejects invalid type, non-positive amount, and bad date', () => {
    expect(CashFlowInputSchema.safeParse({ date: '2026-01-05', type: 'transfer', amount: 100 }).success).toBe(false);
    expect(CashFlowInputSchema.safeParse({ date: '2026-01-05', type: 'deposit', amount: 0 }).success).toBe(false);
    expect(CashFlowInputSchema.safeParse({ date: '2026-13-05', type: 'deposit', amount: 100 }).success).toBe(false);
  });
});
