import { CashFlowDAO } from '@trading-journal/backend-data/dao';
import type { CashFlow } from '@trading-journal/shared/model';
import { IUserRoute } from '@/endpoints/IUserRoute';
import type { RouteContext } from '@/endpoints/IUserRoute';

interface ListCashFlowsResponse {
  cashFlows: CashFlow[];
}

class ListCashFlowsRoute extends IUserRoute<ListCashFlowsResponse> {
  protected async handleRequest(c: RouteContext, userId: string): Promise<ListCashFlowsResponse> {
    const cashFlows: CashFlow[] = await new CashFlowDAO(c.env.DB).listByUserId(userId);
    return { cashFlows };
  }
}

export { ListCashFlowsRoute };
