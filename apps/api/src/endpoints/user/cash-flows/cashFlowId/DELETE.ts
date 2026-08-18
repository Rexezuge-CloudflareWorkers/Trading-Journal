import { CashFlowDAO } from '@trading-journal/backend-data/dao';
import { NotFoundError } from '@trading-journal/backend-errors';
import { IUserRoute } from '@/endpoints/IUserRoute';
import type { RouteContext } from '@/endpoints/IUserRoute';

interface DeleteCashFlowResponse {
  ok: true;
}

class DeleteCashFlowRoute extends IUserRoute<DeleteCashFlowResponse> {
  protected async handleRequest(c: RouteContext, userId: string): Promise<DeleteCashFlowResponse> {
    const cashFlowId: string = c.req.param('cashFlowId')!;
    const dao: CashFlowDAO = new CashFlowDAO(c.env.DB);
    if (!(await dao.getById(userId, cashFlowId))) {
      throw new NotFoundError('Cash flow not found.');
    }
    await dao.delete(userId, cashFlowId);
    return { ok: true };
  }
}

export { DeleteCashFlowRoute };
