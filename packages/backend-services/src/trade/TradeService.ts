import { TradeDAO } from '@trading-journal/backend-data/dao';
import type { TradeFilters } from '@trading-journal/backend-data/dao';
import { BadRequestError, NotFoundError } from '@trading-journal/backend-errors';
import type { Trade } from '@trading-journal/shared/model';
import type { TradeInput } from '@trading-journal/shared/schema';
import { AStockRules } from '@trading-journal/shared/constants';
import { MoneyUtil, TimestampUtil, UUIDUtil } from '@trading-journal/shared/utils';

interface TradeServiceEnv {
  DB: D1Database;
}

class TradeService {
  private readonly tradeDAO: TradeDAO;
  private readonly userId: string;

  constructor(env: TradeServiceEnv, userId: string) {
    this.tradeDAO = new TradeDAO(env.DB);
    this.userId = userId;
  }

  public async listTrades(filters: TradeFilters = {}): Promise<Trade[]> {
    return this.tradeDAO.listByUserId(this.userId, filters);
  }

  public async getTrade(tradeId: string): Promise<Trade> {
    const trade: Trade | null = await this.tradeDAO.getById(this.userId, tradeId);
    if (!trade) {
      throw new NotFoundError('Trade not found.');
    }
    return trade;
  }

  public async createTrade(input: TradeInput, existingTrades: Trade[] = []): Promise<Trade> {
    TradeService.validateAStockRules(input, existingTrades);
    const now: string = TimestampUtil.getCurrentIsoString();
    const trade: Trade = {
      id: UUIDUtil.getRandomUUID(),
      userId: this.userId,
      tradeDate: input.tradeDate,
      symbol: input.symbol,
      name: input.name,
      side: input.side,
      price: MoneyUtil.round2(input.price),
      quantity: input.quantity,
      fees: MoneyUtil.round2(input.fees),
      strategy: input.strategy,
      tags: input.tags,
      reason: input.reason,
      createdAt: now,
      updatedAt: now,
    };
    await this.tradeDAO.create(trade);
    return trade;
  }

  public async updateTrade(tradeId: string, input: TradeInput): Promise<Trade> {
    const existing: Trade = await this.getTrade(tradeId);
    TradeService.validateAStockRules(input);
    const updated: Trade = {
      ...existing,
      tradeDate: input.tradeDate,
      symbol: input.symbol,
      name: input.name,
      side: input.side,
      price: MoneyUtil.round2(input.price),
      quantity: input.quantity,
      fees: MoneyUtil.round2(input.fees),
      strategy: input.strategy,
      tags: input.tags,
      reason: input.reason,
      updatedAt: TimestampUtil.getCurrentIsoString(),
    };
    await this.tradeDAO.update(updated);
    return updated;
  }

  public async deleteTrade(tradeId: string): Promise<void> {
    await this.getTrade(tradeId);
    await this.tradeDAO.delete(this.userId, tradeId);
  }

  public static validateAStockRules(input: TradeInput, existingTrades: Trade[] = []): string[] {
    const warnings: string[] = [];

    if (input.side === 'buy' && !AStockRules.isBuyQuantityValid(input.quantity, 'buy')) {
      throw new BadRequestError(`Buy quantity must be a multiple of ${AStockRules.LOT_SIZE} for A-share stocks.`);
    }

    if (input.side === 'sell' && !AStockRules.isEtf(input.symbol)) {
      const sameDayBuy: boolean = existingTrades.some(
        (trade) => trade.symbol === input.symbol && trade.side === 'buy' && trade.tradeDate === input.tradeDate,
      );
      if (sameDayBuy) {
        warnings.push(`T+1: a sell of ${input.symbol} on the same day as its buy is not allowed for A-share stocks (ETF exempt).`);
      }
    }

    return warnings;
  }
}

export { TradeService };
export type { TradeServiceEnv };
