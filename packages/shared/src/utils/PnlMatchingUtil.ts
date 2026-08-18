import { MoneyUtil } from './MoneyUtil';

interface PnlTradeInput {
  id: string;
  tradeDate: string;
  symbol: string;
  name?: string;
  side: 'buy' | 'sell';
  price: number;
  quantity: number;
  fees?: number;
  createdAt?: string;
}

interface PnLMatchEntry {
  buyTradeId: string;
  buyTradeDate: string;
  buyPrice: number;
  matchedQuantity: number;
  allocatedBuyFees: number;
}

interface PnLResultEntry {
  sellTradeId: string;
  symbol: string;
  name: string;
  sellTradeDate: string;
  sellPrice: number;
  sellQuantity: number;
  sellFees: number;
  matchedQuantity: number;
  excessQuantity: number;
  matches: PnLMatchEntry[];
  grossPnL: number;
  realizedPnL: number;
}

interface HoldingsEntry {
  symbol: string;
  name: string;
  quantity: number;
  averageCost: number;
  totalBuyFees: number;
}

interface PnlMatchingResult {
  entries: PnLResultEntry[];
  holdings: HoldingsEntry[];
}

interface MatchingQueueItem {
  id: string;
  tradeDate: string;
  price: number;
  quantity: number;
  originalQuantity: number;
  fees: number;
  symbol: string;
  name: string;
}

class PnlMatchingUtil {
  public static match(trades: PnlTradeInput[]): PnlMatchingResult {
    const sorted: PnlTradeInput[] = [...trades].sort((a, b) => {
      if (a.tradeDate !== b.tradeDate) return a.tradeDate < b.tradeDate ? -1 : 1;
      if ((a.createdAt ?? '') !== (b.createdAt ?? '')) return (a.createdAt ?? '') < (b.createdAt ?? '') ? -1 : 1;
      return a.id < b.id ? -1 : 1;
    });

    const queueBySymbol: Map<string, MatchingQueueItem[]> = new Map();
    const entries: PnLResultEntry[] = [];

    for (const trade of sorted) {
      if (trade.side === 'buy') {
        const queue: MatchingQueueItem[] = queueBySymbol.get(trade.symbol) ?? [];
        queue.push({
          id: trade.id,
          tradeDate: trade.tradeDate,
          price: trade.price,
          quantity: trade.quantity,
          originalQuantity: trade.quantity,
          fees: trade.fees ?? 0,
          symbol: trade.symbol,
          name: trade.name ?? '',
        });
        queueBySymbol.set(trade.symbol, queue);
        continue;
      }

      const queue: MatchingQueueItem[] = queueBySymbol.get(trade.symbol) ?? [];
      let remaining: number = trade.quantity;
      const matches: PnLMatchEntry[] = [];
      let grossPnL: number = 0;
      let allocatedBuyFees: number = 0;

      while (remaining > 0 && queue.length > 0) {
        const buy: MatchingQueueItem = queue[0]!;
        const matchedQuantity: number = Math.min(remaining, buy.quantity);
        const buyFeePortion: number = MoneyUtil.round2((buy.fees * matchedQuantity) / buy.quantity);
        matches.push({
          buyTradeId: buy.id,
          buyTradeDate: buy.tradeDate,
          buyPrice: buy.price,
          matchedQuantity,
          allocatedBuyFees: buyFeePortion,
        });
        grossPnL += (trade.price - buy.price) * matchedQuantity;
        allocatedBuyFees += buyFeePortion;
        buy.quantity -= matchedQuantity;
        remaining -= matchedQuantity;
        if (buy.quantity === 0) {
          queue.shift();
        }
      }

      const realizedPnL: number = MoneyUtil.round2(grossPnL - allocatedBuyFees - (trade.fees ?? 0));
      entries.push({
        sellTradeId: trade.id,
        symbol: trade.symbol,
        name: trade.name ?? '',
        sellTradeDate: trade.tradeDate,
        sellPrice: trade.price,
        sellQuantity: trade.quantity,
        sellFees: trade.fees ?? 0,
        matchedQuantity: trade.quantity - remaining,
        excessQuantity: remaining,
        matches,
        grossPnL: MoneyUtil.round2(grossPnL),
        realizedPnL,
      });
    }

    const holdings: HoldingsEntry[] = [...queueBySymbol.entries()]
      .filter(([, queue]) => queue.length > 0)
      .map(([symbol, queue]) => {
        const totalQuantity: number = queue.reduce((sum, item) => sum + item.quantity, 0);
        const totalCost: number = queue.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const totalBuyFees: number = MoneyUtil.round2(
          queue.reduce((sum, item) => sum + item.fees * (item.originalQuantity > 0 ? item.quantity / item.originalQuantity : 0), 0),
        );
        return {
          symbol,
          name: queue[0]!.name,
          quantity: totalQuantity,
          averageCost: totalQuantity > 0 ? MoneyUtil.round2(totalCost / totalQuantity) : 0,
          totalBuyFees,
        };
      })
      .sort((a, b) => a.symbol.localeCompare(b.symbol));

    return { entries, holdings };
  }
}

export { PnlMatchingUtil };
export type { HoldingsEntry, MatchingQueueItem, PnLMatchEntry, PnlMatchingResult, PnLResultEntry, PnlTradeInput };
