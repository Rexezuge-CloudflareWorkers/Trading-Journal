import { EquitySnapshotDAO } from '@trading-journal/backend-data/dao';
import type { EquitySnapshot } from '@trading-journal/shared/model';
import { IUserRoute } from '@/endpoints/IUserRoute';
import type { RouteContext } from '@/endpoints/IUserRoute';

interface ListEquitySnapshotsResponse {
  equitySnapshots: EquitySnapshot[];
}

class ListEquitySnapshotsRoute extends IUserRoute<ListEquitySnapshotsResponse> {
  protected async handleRequest(c: RouteContext, userId: string): Promise<ListEquitySnapshotsResponse> {
    const equitySnapshots: EquitySnapshot[] = await new EquitySnapshotDAO(c.env.DB).listByUserId(userId);
    return { equitySnapshots };
  }
}

export { ListEquitySnapshotsRoute };
