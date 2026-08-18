import { EquitySnapshotDAO } from '@trading-journal/backend-data/dao';
import { NotFoundError } from '@trading-journal/backend-errors';
import { IUserRoute } from '@/endpoints/IUserRoute';
import type { RouteContext } from '@/endpoints/IUserRoute';

interface DeleteEquitySnapshotResponse {
  ok: true;
}

class DeleteEquitySnapshotRoute extends IUserRoute<DeleteEquitySnapshotResponse> {
  protected async handleRequest(c: RouteContext, userId: string): Promise<DeleteEquitySnapshotResponse> {
    const snapshotId: string = c.req.param('snapshotId')!;
    const dao: EquitySnapshotDAO = new EquitySnapshotDAO(c.env.DB);
    if (!(await dao.getById(userId, snapshotId))) {
      throw new NotFoundError('Equity snapshot not found.');
    }
    await dao.delete(userId, snapshotId);
    return { ok: true };
  }
}

export { DeleteEquitySnapshotRoute };
