import { EquitySnapshotDAO } from '@trading-journal/backend-data/dao';
import { EquitySnapshotInputSchema } from '@trading-journal/shared/schema';
import type { EquitySnapshotInput } from '@trading-journal/shared/schema';
import type { EquitySnapshot } from '@trading-journal/shared/model';
import { ConflictError } from '@trading-journal/backend-errors';
import { MoneyUtil, TimestampUtil, UUIDUtil } from '@trading-journal/shared/utils';
import { IUserRoute } from '@/endpoints/IUserRoute';
import type { RouteContext } from '@/endpoints/IUserRoute';

interface UpsertEquitySnapshotResponse {
  equitySnapshot: EquitySnapshot;
}

class UpsertEquitySnapshotRoute extends IUserRoute<UpsertEquitySnapshotResponse> {
  protected async handleRequest(c: RouteContext, userId: string): Promise<UpsertEquitySnapshotResponse> {
    const input: EquitySnapshotInput = await this.validateJson(c, EquitySnapshotInputSchema);
    const dao: EquitySnapshotDAO = new EquitySnapshotDAO(c.env.DB);
    const now: string = TimestampUtil.getCurrentIsoString();

    if (input.id) {
      const existing: EquitySnapshot | null = await dao.getById(userId, input.id);
      if (!existing) {
        throw new ConflictError('Equity snapshot not found for the given id.');
      }
      if (existing.date !== input.date) {
        throw new ConflictError('Equity snapshot date cannot be changed via upsert; use PUT /user/equity/:snapshotId instead.');
      }
      const updated: EquitySnapshot = {
        ...existing,
        totalEquity: MoneyUtil.round2(input.totalEquity),
        note: input.note,
        updatedAt: now,
      };
      await dao.update(updated);
      return { equitySnapshot: updated };
    }

    const snapshot: EquitySnapshot = {
      id: UUIDUtil.getRandomUUID(),
      userId,
      date: input.date,
      totalEquity: MoneyUtil.round2(input.totalEquity),
      note: input.note,
      createdAt: now,
      updatedAt: now,
    };
    await dao.upsertByDate(snapshot);
    return { equitySnapshot: snapshot };
  }
}

export { UpsertEquitySnapshotRoute };
