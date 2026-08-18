import { BaseDAO } from './BaseDAO';
import type { EquitySnapshot } from '@trading-journal/shared/model';

interface EquitySnapshotRow {
  id: string;
  userId: string;
  date: string;
  totalEquity: number;
  note: string;
  createdAt: string;
  updatedAt: string;
}

const EQUITY_SNAPSHOT_SELECT: string = `SELECT id, user_id AS userId, date, total_equity AS totalEquity, note, created_at AS createdAt, updated_at AS updatedAt FROM equity_snapshots`;

class EquitySnapshotDAO extends BaseDAO {
  public async listByUserId(userId: string): Promise<EquitySnapshot[]> {
    const rows = await this.database
      .prepare(`${EQUITY_SNAPSHOT_SELECT} WHERE user_id = ? ORDER BY date ASC, created_at ASC`)
      .bind(userId)
      .all<EquitySnapshotRow>();
    return rows.results ?? [];
  }

  public async getById(userId: string, snapshotId: string): Promise<EquitySnapshot | null> {
    const row = await this.database
      .prepare(`${EQUITY_SNAPSHOT_SELECT} WHERE user_id = ? AND id = ?`)
      .bind(userId, snapshotId)
      .first<EquitySnapshotRow>();
    return row ?? null;
  }

  public async upsertByDate(snapshot: EquitySnapshot): Promise<void> {
    await this.database
      .prepare(
        `INSERT INTO equity_snapshots (id, user_id, date, total_equity, note, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (user_id, date) DO UPDATE SET total_equity = excluded.total_equity, note = excluded.note, updated_at = excluded.updated_at`,
      )
      .bind(snapshot.id, snapshot.userId, snapshot.date, snapshot.totalEquity, snapshot.note, snapshot.createdAt, snapshot.updatedAt)
      .run();
  }

  public async update(snapshot: EquitySnapshot): Promise<void> {
    await this.database
      .prepare(`UPDATE equity_snapshots SET total_equity = ?, note = ?, updated_at = ? WHERE user_id = ? AND id = ?`)
      .bind(snapshot.totalEquity, snapshot.note, snapshot.updatedAt, snapshot.userId, snapshot.id)
      .run();
  }

  public async delete(userId: string, snapshotId: string): Promise<void> {
    await this.database.prepare('DELETE FROM equity_snapshots WHERE user_id = ? AND id = ?').bind(userId, snapshotId).run();
  }
}

export { EquitySnapshotDAO };
export type { EquitySnapshotRow };
