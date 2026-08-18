import { CashFlowDAO } from '@trading-journal/backend-data/dao';
import { CashFlowInputSchema } from '@trading-journal/shared/schema';
import type { CashFlowInput } from '@trading-journal/shared/schema';
import { NotFoundError } from '@trading-journal/backend-errors';
import type { CashFlow } from '@trading-journal/shared/model';
import { MoneyUtil, TimestampUtil } from '@trading-journal/shared/utils';
import { IUserRoute } from '@/endpoints/IUserRoute';
import type { RouteContext } from '@/endpoints/IUserRoute';

interface UpdateCashFlowResponse {
  cashFlow: CashFlow;
}

class UpdateCashFlowRoute extends IUserRoute<UpdateCashFlowResponse> {
  protected async handleRequest(c: RouteContext, userId: string): Promise<UpdateCashFlowResponse> {
    const cashFlowId: string = c.req.param('cashFlowId')!;
    const input: CashFlowInput = await this.validateJson(c, CashFlowInputSchema);
    const dao: CashFlowDAO = new CashFlowDAO(c.env.DB);
    const existing: CashFlow | null = await dao.getById(userId, cashFlowId);
    if (!existing) {
      throw new NotFoundError('Cash flow not found.');
    }
    const updated: CashFlow = {
      ...existing,
      date: input.date,
      type: input.type,
      amount: MoneyUtil.round2(input.amount),
      note: input.note,
      updatedAt: TimestampUtil.getCurrentIsoString(),
    };
    await dao.update(updated);
    return { cashFlow: updated };
  }
}

export { UpdateCashFlowRoute };
