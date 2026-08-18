import { UserDAO } from '@trading-journal/backend-data/dao';
import { TimestampUtil } from '@trading-journal/shared/utils';
import { ExportImportService } from './ExportImportService';
import type { ExportPayload } from './ExportImportService';

interface BackupServiceEnv {
  DB: D1Database;
  BACKUP_BUCKET: R2Bucket;
  BACKUP_RETENTION_DAYS?: string;
}

class BackupService {
  public static async runBackupForUser(env: BackupServiceEnv, userId: string): Promise<string | null> {
    const exportService: ExportImportService = new ExportImportService(env, userId);
    const payload: ExportPayload = await exportService.exportAll();
    if (payload.trades.length === 0 && payload.cashFlows.length === 0 && payload.equitySnapshots.length === 0) {
      return null;
    }

    const dateKey: string = TimestampUtil.formatDateKey(new Date());
    const key: string = `backup-${userId}-${dateKey}.json`;
    await env.BACKUP_BUCKET.put(key, JSON.stringify(payload, null, 2), {
      httpMetadata: { contentType: 'application/json' },
    });
    await BackupService.pruneBackups(env, userId);
    return key;
  }

  public static async runBackupForAllUsers(env: BackupServiceEnv): Promise<string[]> {
    const userDAO: UserDAO = new UserDAO(env.DB);
    const users = await userDAO.listAll();
    const keys: string[] = [];
    for (const user of users) {
      const key: string | null = await BackupService.runBackupForUser(env, user.id);
      if (key) keys.push(key);
    }
    return keys;
  }

  public static async pruneBackups(env: BackupServiceEnv, userId: string): Promise<number> {
    const retentionDays: number = Number.parseInt(env.BACKUP_RETENTION_DAYS ?? '30', 10);
    if (Number.isNaN(retentionDays) || retentionDays <= 0) return 0;

    const prefix: string = `backup-${userId}-`;
    const listed = await env.BACKUP_BUCKET.list({ prefix });
    const cutoff: number = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    let pruned: number = 0;

    const stale: string[] = [];
    for (const object of listed.objects) {
      const dateMatch: RegExpMatchArray | null = object.key.match(/(\d{8})\.json$/);
      if (!dateMatch) continue;
      const timestamp: number = new Date(
        Number.parseInt(dateMatch[1]!.slice(0, 4), 10),
        Number.parseInt(dateMatch[1]!.slice(4, 6), 10) - 1,
        Number.parseInt(dateMatch[1]!.slice(6, 8), 10),
      ).getTime();
      if (timestamp < cutoff) {
        stale.push(object.key);
      }
    }
    if (stale.length > 0) {
      await env.BACKUP_BUCKET.delete(stale);
      pruned = stale.length;
    }
    return pruned;
  }
}

export { BackupService };
export type { BackupServiceEnv };
