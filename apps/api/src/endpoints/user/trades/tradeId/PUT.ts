import { TradeService } from '@trading-journal/backend-services/trade';
import { TradeInputSchema } from '@trading-journal/shared/schema';
import type { TradeInput } from '@trading-journal/shared/schema';
import type { Trade } from '@trading-journal/shared/model';
import { IUserRoute } from '@/endpoints/IUserRoute';
import type { RouteContext } from '@/endpoints/IUserRoute';

interface UpdateTradeResponse {
  trade: Trade;
  warnings: string[];
}

class UpdateTradeRoute extends IUserRoute<UpdateTradeResponse> {
  protected async handleRequest(c: RouteContext, userId: string): Promise<UpdateTradeResponse> {
    const tradeId: string = c.req.param('tradeId')!;
    const input: TradeInput = await this.validateJson(c, TradeInputSchema);
    const tradeService: TradeService = new TradeService(c.env, userId);
    const warnings: string[] = TradeService.validateAStockRules(input);
    const trade: Trade = await tradeService.updateTrade(tradeId, input);
    return { trade, warnings };
  }
}

export { UpdateTradeRoute };
