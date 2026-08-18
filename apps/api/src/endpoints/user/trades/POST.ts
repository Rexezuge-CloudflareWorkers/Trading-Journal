import { TradeService } from '@trading-journal/backend-services/trade';
import { TradeInputSchema } from '@trading-journal/shared/schema';
import type { TradeInput } from '@trading-journal/shared/schema';
import type { Trade } from '@trading-journal/shared/model';
import { IUserRoute } from '@/endpoints/IUserRoute';
import type { RouteContext } from '@/endpoints/IUserRoute';

interface CreateTradeResponse {
  trade: Trade;
  warnings: string[];
}

class CreateTradeRoute extends IUserRoute<CreateTradeResponse> {
  protected async handleRequest(c: RouteContext, userId: string): Promise<CreateTradeResponse> {
    const input: TradeInput = await this.validateJson(c, TradeInputSchema);
    const tradeService: TradeService = new TradeService(c.env, userId);
    const existingTrades = await tradeService.listTrades({ symbol: input.symbol });
    const warnings: string[] = TradeService.validateAStockRules(input, existingTrades);
    const trade: Trade = await tradeService.createTrade(input, existingTrades);
    return { trade, warnings };
  }
}

export { CreateTradeRoute };
