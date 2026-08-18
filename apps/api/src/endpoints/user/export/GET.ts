import { ExportImportService } from '@trading-journal/backend-services/backup';
import type { ExportPayload } from '@trading-journal/backend-services/backup';
import { UserDAO } from '@trading-journal/backend-data/dao';
import type { User } from '@trading-journal/shared/model';
import { IUserRoute } from '@/endpoints/IUserRoute';
import type { ExtendedResponse, RouteContext } from '@/endpoints/IUserRoute';

class ExportRoute extends IUserRoute<ExportPayload> {
  protected async handleRequest(c: RouteContext, userId: string): Promise<ExtendedResponse<ExportPayload>> {
    const format: string = this.getQueryParam(c, 'format') ?? 'json';
    const service: ExportImportService = new ExportImportService(c.env, userId);
    const dateKey: string = new Date().toISOString().slice(0, 10);

    if (format === 'csv') {
      const table: string = this.getQueryParam(c, 'table') ?? 'trades';
      const csv: string = await service.exportCsv(table);
      return {
        rawBody: csv,
        statusCode: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="trading-journal-${table}-${dateKey}.csv"`,
        },
      };
    }

    const payload: ExportPayload = await service.exportAll();
    const userRow: User | null = await new UserDAO(c.env.DB).getUser(userId);
    return {
      rawBody: JSON.stringify({ ...payload, user: { id: userRow?.id ?? userId, email: userRow?.email ?? '' } }, null, 2),
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="trading-journal-backup-${dateKey}.json"`,
      },
    };
  }
}

export { ExportRoute };
