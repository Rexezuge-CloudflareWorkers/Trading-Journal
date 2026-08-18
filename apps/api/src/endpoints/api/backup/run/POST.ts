import { BackupService } from '@trading-journal/backend-services/backup';
import { UnauthorizedError } from '@trading-journal/backend-errors';
import { IBasePublicRoute } from '@/endpoints/IBasePublicRoute';
import type { PublicRouteContext } from '@/endpoints/IBasePublicRoute';

interface TriggerBackupResponse {
  ok: true;
  keys: string[];
}

class TriggerBackupRoute extends IBasePublicRoute<TriggerBackupResponse> {
  protected async handleRequest(c: PublicRouteContext): Promise<TriggerBackupResponse> {
    const secret: string | undefined = c.env.BACKUP_TRIGGER_SECRET;
    if (secret) {
      const headerValue: string | undefined = c.req.header('x-backup-trigger-secret');
      if (headerValue !== secret) {
        throw new UnauthorizedError('Invalid backup trigger secret.');
      }
    }
    const keys: string[] = await BackupService.runBackupForAllUsers(c.env);
    return { ok: true, keys };
  }
}

export { TriggerBackupRoute };
