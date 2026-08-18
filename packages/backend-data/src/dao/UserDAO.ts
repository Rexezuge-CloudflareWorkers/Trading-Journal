import { BaseDAO } from './BaseDAO';
import type { User } from '@trading-journal/shared/model';
import { TimestampUtil } from '@trading-journal/shared/utils';

interface UserRow {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

class UserDAO extends BaseDAO {
  public async upsertUser(userId: string, email: string): Promise<void> {
    const now: string = TimestampUtil.getCurrentIsoString();
    await this.database
      .prepare(
        `INSERT INTO users (id, email, display_name, created_at, updated_at)
         VALUES (?, ?, '', ?, ?)
         ON CONFLICT (email) DO UPDATE SET id = excluded.id, updated_at = excluded.updated_at`,
      )
      .bind(userId, email, now, now)
      .run();
  }

  public async getUser(userId: string): Promise<User | null> {
    const row = await this.database
      .prepare('SELECT id, email, display_name AS displayName, created_at AS createdAt, updated_at AS updatedAt FROM users WHERE id = ?')
      .bind(userId)
      .first<UserRow>();
    return row ?? null;
  }

  public async listAll(): Promise<User[]> {
    const rows = await this.database
      .prepare(
        'SELECT id, email, display_name AS displayName, created_at AS createdAt, updated_at AS updatedAt FROM users ORDER BY created_at ASC',
      )
      .all<UserRow>();
    return rows.results ?? [];
  }
}

export { UserDAO };
