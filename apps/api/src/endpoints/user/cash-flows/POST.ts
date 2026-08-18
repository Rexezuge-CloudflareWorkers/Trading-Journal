import { CashFlowDAO } from '@trading-journal/backend-data/dao';
import { CashFlowInputSchema } from '@trading-journal/shared/schema';
import type { CashFlowInput } from '@trading-journal/shared/schema';
import type { CashFlow } from '@trading-journal/shared/model';
import { MoneyUtil, TimestampUtil, UUIDUtil } from '@trading-journal/shared/utils';
import { IUserRoute } from '@/endpoints/IUserRoute';
import type { RouteContext } from '@/endpoints/IUserRoute';

interface CreateCashFlowResponse {
  cashFlow: CashFlow;
}

class CreateCashFlowRoute extends IUserRoute<CreateCashFlowResponse> {
  protected async handleRequest(c: RouteContext, userId: string): Promise<CreateCashFlowResponse> {
    const input: CashFlowInput = await this.validateJson(c, CashFlowInputSchema);
    const now: string = TimestampUtil.getCurrentIsoString();
    const cashFlow: CashFlow = {
      id: UUIDUtil.getRandomUUID(),
      userId,
      date: input.date,
      type: input.type,
      amount: MoneyUtil.round2(input.amount),
      note: input.note,
      createdAt: now,
      updatedAt: now,
    };
    await new CashFlowDAO(c.env.DB).create(cashFlow);
    return { cashFlow };
  }
}

export { CreateCashFlowRoute };
