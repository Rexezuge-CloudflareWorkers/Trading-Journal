import { BaseDAO } from './BaseDAO';
import type { Trade } from '@trading-journal/shared/model';

interface TradeRow {
  id: string;
  userId: string;
  tradeDate: string;
  symbol: string;
  name: string;
  side: 'buy' | 'sell';
  price: number;
  quantity: number;
  fees: number;
  strategy: string;
  tags: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
}

interface TradeFilters {
  from?: string;
  to?: string;
  symbol?: string;
  side?: 'buy' | 'sell';
  strategy?: string;
}

const TRADE_SELECT: string = `SELECT id, user_id AS userId, trade_date AS tradeDate, symbol, name, side, price, quantity, fees,
  strategy, tags, reason, created_at AS createdAt, updated_at AS updatedAt FROM trades`;

function mapTrade(row: TradeRow): Trade {
  let tags: string[];
  try {
    tags = JSON.parse(row.tags) as string[];
  } catch {
    tags = [];
  }
  return { ...row, tags };
}

class TradeDAO extends BaseDAO {
  public async listByUserId(userId: string, filters: TradeFilters = {}): Promise<Trade[]> {
    const conditions: string[] = ['user_id = ?'];
    const params: unknown[] = [userId];
    if (filters.from) {
      conditions.push('trade_date >= ?');
      params.push(filters.from);
    }
    if (filters.to) {
      conditions.push('trade_date <= ?');
      params.push(filters.to);
    }
    if (filters.symbol) {
      conditions.push('symbol = ?');
      params.push(filters.symbol);
    }
    if (filters.side) {
      conditions.push('side = ?');
      params.push(filters.side);
    }
    if (filters.strategy) {
      conditions.push('strategy = ?');
      params.push(filters.strategy);
    }
    const rows = await this.database
      .prepare(`${TRADE_SELECT} WHERE ${conditions.join(' AND ')} ORDER BY trade_date ASC, created_at ASC, id ASC`)
      .bind(...params)
      .all<TradeRow>();
    return (rows.results ?? []).map(mapTrade);
  }

  public async getById(userId: string, tradeId: string): Promise<Trade | null> {
    const row = await this.database.prepare(`${TRADE_SELECT} WHERE user_id = ? AND id = ?`).bind(userId, tradeId).first<TradeRow>();
    return row ? mapTrade(row) : null;
  }

  public async create(trade: Trade): Promise<void> {
    await this.database
      .prepare(
        `INSERT INTO trades (id, user_id, trade_date, symbol, name, side, price, quantity, fees, strategy, tags, reason, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        trade.id,
        trade.userId,
        trade.tradeDate,
        trade.symbol,
        trade.name,
        trade.side,
        trade.price,
        trade.quantity,
        trade.fees,
        trade.strategy,
        JSON.stringify(trade.tags),
        trade.reason,
        trade.createdAt,
        trade.updatedAt,
      )
      .run();
  }

  public async update(trade: Trade): Promise<void> {
    await this.database
      .prepare(
        `UPDATE trades SET trade_date = ?, symbol = ?, name = ?, side = ?, price = ?, quantity = ?, fees = ?,
         strategy = ?, tags = ?, reason = ?, updated_at = ? WHERE user_id = ? AND id = ?`,
      )
      .bind(
        trade.tradeDate,
        trade.symbol,
        trade.name,
        trade.side,
        trade.price,
        trade.quantity,
        trade.fees,
        trade.strategy,
        JSON.stringify(trade.tags),
        trade.reason,
        trade.updatedAt,
        trade.userId,
        trade.id,
      )
      .run();
  }

  public async delete(userId: string, tradeId: string): Promise<void> {
    await this.database.prepare('DELETE FROM trades WHERE user_id = ? AND id = ?').bind(userId, tradeId).run();
  }
}

export { TradeDAO };
export type { TradeFilters, TradeRow };
