import { TradeService } from '@trading-journal/backend-services/trade';
import { IUserRoute } from '@/endpoints/IUserRoute';
import type { RouteContext } from '@/endpoints/IUserRoute';
import type { Trade } from '@trading-journal/shared/model';

interface ListTradesResponse {
  trades: Trade[];
}

class ListTradesRoute extends IUserRoute<ListTradesResponse> {
  protected async handleRequest(c: RouteContext, userId: string): Promise<ListTradesResponse> {
    const tradeService: TradeService = new TradeService(c.env, userId);
    const trades: Trade[] = await tradeService.listTrades({
      from: this.getQueryParam(c, 'from'),
      to: this.getQueryParam(c, 'to'),
      symbol: this.getQueryParam(c, 'symbol'),
      side: this.getQueryParam(c, 'side') as 'buy' | 'sell' | undefined,
      strategy: this.getQueryParam(c, 'strategy'),
    });
    return { trades };
  }
}

export { ListTradesRoute };
