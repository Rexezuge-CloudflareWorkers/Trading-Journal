import { EquitySnapshotDAO } from '@trading-journal/backend-data/dao';
import { NotFoundError } from '@trading-journal/backend-errors';
import type { EquitySnapshot } from '@trading-journal/shared/model';
import { MoneyUtil, TimestampUtil } from '@trading-journal/shared/utils';
import { z } from 'zod';
import { IUserRoute } from '@/endpoints/IUserRoute';
import type { RouteContext } from '@/endpoints/IUserRoute';

const EquitySnapshotUpdateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  totalEquity: z.number().positive('totalEquity must be positive').max(1_000_000_000_000),
  note: z.string().trim().max(500).optional().default(''),
});

type EquitySnapshotUpdateInput = z.infer<typeof EquitySnapshotUpdateSchema>;

interface UpdateEquitySnapshotResponse {
  equitySnapshot: EquitySnapshot;
}

class UpdateEquitySnapshotRoute extends IUserRoute<UpdateEquitySnapshotResponse> {
  protected async handleRequest(c: RouteContext, userId: string): Promise<UpdateEquitySnapshotResponse> {
    const snapshotId: string = c.req.param('snapshotId')!;
    const input: EquitySnapshotUpdateInput = await this.validateJson(c, EquitySnapshotUpdateSchema);
    const dao: EquitySnapshotDAO = new EquitySnapshotDAO(c.env.DB);
    const existing: EquitySnapshot | null = await dao.getById(userId, snapshotId);
    if (!existing) {
      throw new NotFoundError('Equity snapshot not found.');
    }
    const updated: EquitySnapshot = {
      ...existing,
      date: input.date,
      totalEquity: MoneyUtil.round2(input.totalEquity),
      note: input.note,
      updatedAt: TimestampUtil.getCurrentIsoString(),
    };
    await dao.update(updated);
    return { equitySnapshot: updated };
  }
}

export { UpdateEquitySnapshotRoute };
