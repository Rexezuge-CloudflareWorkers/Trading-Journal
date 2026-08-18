import { TradeService } from '@trading-journal/backend-services/trade';
import { IUserRoute } from '@/endpoints/IUserRoute';
import type { RouteContext } from '@/endpoints/IUserRoute';

interface DeleteTradeResponse {
  ok: true;
}

class DeleteTradeRoute extends IUserRoute<DeleteTradeResponse> {
  protected async handleRequest(c: RouteContext, userId: string): Promise<DeleteTradeResponse> {
    const tradeId: string = c.req.param('tradeId')!;
    await new TradeService(c.env, userId).deleteTrade(tradeId);
    return { ok: true };
  }
}

export { DeleteTradeRoute };
