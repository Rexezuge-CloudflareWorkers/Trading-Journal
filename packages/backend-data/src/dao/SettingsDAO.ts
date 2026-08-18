import { BaseDAO } from './BaseDAO';
import type { Settings } from '@trading-journal/shared/model';

interface SettingsRow {
  userId: string;
  initialCapital: number;
  timeZone: string;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_TIME_ZONE: string = 'Asia/Shanghai';

class SettingsDAO extends BaseDAO {
  public async getByUserId(userId: string): Promise<Settings | null> {
    const row = await this.database
      .prepare(
        `SELECT user_id AS userId, initial_capital AS initialCapital, time_zone AS timeZone, created_at AS createdAt, updated_at AS updatedAt FROM settings WHERE user_id = ?`,
      )
      .bind(userId)
      .first<SettingsRow>();
    return row ?? null;
  }

  public async upsert(settings: Settings): Promise<void> {
    await this.database
      .prepare(
        `INSERT INTO settings (user_id, initial_capital, time_zone, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT (user_id) DO UPDATE SET initial_capital = excluded.initial_capital, time_zone = excluded.time_zone, updated_at = excluded.updated_at`,
      )
      .bind(settings.userId, settings.initialCapital, settings.timeZone, settings.createdAt, settings.updatedAt)
      .run();
  }
}

export { DEFAULT_TIME_ZONE, SettingsDAO };
export type { SettingsRow };
