import { BaseDAO } from './BaseDAO';
import type { CashFlow } from '@trading-journal/shared/model';

interface CashFlowRow {
  id: string;
  userId: string;
  date: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  note: string;
  createdAt: string;
  updatedAt: string;
}

const CASH_FLOW_SELECT: string = `SELECT id, user_id AS userId, date, type, amount, note, created_at AS createdAt, updated_at AS updatedAt FROM cash_flows`;

class CashFlowDAO extends BaseDAO {
  public async listByUserId(userId: string): Promise<CashFlow[]> {
    const rows = await this.database
      .prepare(`${CASH_FLOW_SELECT} WHERE user_id = ? ORDER BY date ASC, created_at ASC, id ASC`)
      .bind(userId)
      .all<CashFlowRow>();
    return rows.results ?? [];
  }

  public async getById(userId: string, cashFlowId: string): Promise<CashFlow | null> {
    const row = await this.database
      .prepare(`${CASH_FLOW_SELECT} WHERE user_id = ? AND id = ?`)
      .bind(userId, cashFlowId)
      .first<CashFlowRow>();
    return row ?? null;
  }

  public async create(cashFlow: CashFlow): Promise<void> {
    await this.database
      .prepare(`INSERT INTO cash_flows (id, user_id, date, type, amount, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(
        cashFlow.id,
        cashFlow.userId,
        cashFlow.date,
        cashFlow.type,
        cashFlow.amount,
        cashFlow.note,
        cashFlow.createdAt,
        cashFlow.updatedAt,
      )
      .run();
  }

  public async update(cashFlow: CashFlow): Promise<void> {
    await this.database
      .prepare(`UPDATE cash_flows SET date = ?, type = ?, amount = ?, note = ?, updated_at = ? WHERE user_id = ? AND id = ?`)
      .bind(cashFlow.date, cashFlow.type, cashFlow.amount, cashFlow.note, cashFlow.updatedAt, cashFlow.userId, cashFlow.id)
      .run();
  }

  public async delete(userId: string, cashFlowId: string): Promise<void> {
    await this.database.prepare('DELETE FROM cash_flows WHERE user_id = ? AND id = ?').bind(userId, cashFlowId).run();
  }
}

export { CashFlowDAO };
export type { CashFlowRow };
