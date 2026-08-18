import { describe, expect, it } from 'vitest';
import { AStockRules } from '../src/constants/AStockRules';

describe('AStockRules', () => {
  it.each([
    ['600519', 'main', 0.1],
    ['000001', 'main', 0.1],
    ['300750', 'chinext', 0.2],
    ['688981', 'star', 0.2],
    ['830799', 'beijing', 0.3],
    ['400001', 'beijing', 0.3],
    ['123456', 'unknown', 0.1],
  ] as const)('classifies %s as board %s with limit %s', (symbol, board, limit) => {
    expect(AStockRules.getBoard(symbol)).toBe(board);
    expect(AStockRules.getPriceLimitRatio(symbol)).toBe(limit);
  });

  it('applies ST limit when name contains ST', () => {
    expect(AStockRules.getPriceLimitRatio('600001', 'ST海投')).toBe(0.05);
    expect(AStockRules.getPriceLimitRatio('600001', '*ST金泰')).toBe(0.05);
  });

  it('recognizes ETFs', () => {
    expect(AStockRules.isEtf('510300')).toBe(true);
    expect(AStockRules.isEtf('159915')).toBe(true);
    expect(AStockRules.isEtf('563000')).toBe(true);
    expect(AStockRules.isEtf('580000')).toBe(true);
    expect(AStockRules.isEtf('600519')).toBe(false);
  });

  it('validates buy quantity as multiples of 100, sells allow odd lots', () => {
    expect(AStockRules.isBuyQuantityValid(300, 'buy')).toBe(true);
    expect(AStockRules.isBuyQuantityValid(150, 'buy')).toBe(false);
    expect(AStockRules.isBuyQuantityValid(0, 'buy')).toBe(true);
    expect(AStockRules.isBuyQuantityValid(50, 'sell')).toBe(true);
  });
});
