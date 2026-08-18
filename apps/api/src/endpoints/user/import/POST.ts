import { ExportImportService } from '@trading-journal/backend-services/backup';
import type { ImportResult } from '@trading-journal/backend-services/backup';
import { ImportPayloadSchema } from '@trading-journal/shared/schema';
import type { ImportPayload } from '@trading-journal/shared/schema';
import { IUserRoute } from '@/endpoints/IUserRoute';
import type { RouteContext } from '@/endpoints/IUserRoute';

interface ImportResponse extends ImportResult {
  ok: true;
}

class ImportRoute extends IUserRoute<ImportResponse> {
  protected async handleRequest(c: RouteContext, userId: string): Promise<ImportResponse> {
    const payload: ImportPayload = await this.validateJson(c, ImportPayloadSchema);
    const result: ImportResult = await new ExportImportService(c.env, userId).importAll(payload);
    return { ok: true, ...result };
  }
}

export { ImportRoute };
