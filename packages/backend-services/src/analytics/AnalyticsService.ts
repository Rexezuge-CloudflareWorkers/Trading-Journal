import { CashFlowDAO, EquitySnapshotDAO, SettingsDAO, TradeDAO } from '@trading-journal/backend-data/dao';
import type { CashFlow, EquitySnapshot, Settings, Trade } from '@trading-journal/shared/model';
import { EquityProjectionUtil, MoneyUtil, PnlMatchingUtil } from '@trading-journal/shared/utils';
import type { EquityProjectionResult, EquitySeriesPoint, PnLResultEntry } from '@trading-journal/shared/utils';

interface AnalyticsServiceEnv {
  DB: D1Database;
}

interface OverviewMetrics {
  totalTrades: number;
  totalBuys: number;
  totalSells: number;
  initialCapital: number;
  netDeposits: number;
  totalRealizedPnl: number;
  winRate: number;
  profitFactor: number | null;
  avgWin: number;
  avgLoss: number;
  payoffRatio: number | null;
  biggestWin: number;
  biggestLoss: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  finalEquity: number;
  openPositions: number;
}

interface StrategyBreakdown {
  strategy: string;
  trades: number;
  realizedPnl: number;
  winRate: number;
}

interface MonthBreakdown {
  month: string;
  trades: number;
  realizedPnl: number;
  netDeposits: number;
  closingEquity: number;
}

interface SymbolBreakdown {
  symbol: string;
  name: string;
  trades: number;
  realizedPnl: number;
}

interface HoldingsBreakdown {
  symbol: string;
  name: string;
  quantity: number;
  averageCost: number;
  totalBuyFees: number;
}

interface AnalyticsResponse {
  overview: OverviewMetrics;
  byStrategy: StrategyBreakdown[];
  byMonth: MonthBreakdown[];
  bySymbol: SymbolBreakdown[];
  equitySeries: EquitySeriesPoint[];
  holdings: HoldingsBreakdown[];
  projection: EquityProjectionResult;
}

class AnalyticsService {
  private readonly userId: string;
  private readonly tradeDAO: TradeDAO;
  private readonly cashFlowDAO: CashFlowDAO;
  private readonly snapshotDAO: EquitySnapshotDAO;
  private readonly settingsDAO: SettingsDAO;

  constructor(env: AnalyticsServiceEnv, userId: string) {
    this.userId = userId;
    this.tradeDAO = new TradeDAO(env.DB);
    this.cashFlowDAO = new CashFlowDAO(env.DB);
    this.snapshotDAO = new EquitySnapshotDAO(env.DB);
    this.settingsDAO = new SettingsDAO(env.DB);
  }

  public async getAnalytics(): Promise<AnalyticsResponse> {
    const [trades, cashFlows, snapshots, settings]: [Trade[], CashFlow[], EquitySnapshot[], Settings | null] = await Promise.all([
      this.tradeDAO.listByUserId(this.userId),
      this.cashFlowDAO.listByUserId(this.userId),
      this.snapshotDAO.listByUserId(this.userId),
      this.settingsDAO.getByUserId(this.userId),
    ]);

    const initialCapital: number = settings?.initialCapital ?? 0;
    const { entries, holdings } = PnlMatchingUtil.match([...trades]);

    const realizedPnlEntries: EquityProjectionUtilPnlEntry[] = entries.map((entry) => ({
      date: entry.sellTradeDate,
      realizedPnl: entry.realizedPnL,
    }));
    const projection: EquityProjectionResult = EquityProjectionUtil.project({
      initialCapital,
      cashFlows: cashFlows.map((flow) => ({ date: flow.date, type: flow.type, amount: flow.amount })),
      realizedPnlEntries,
      snapshots: snapshots.map((snapshot) => ({ date: snapshot.date, totalEquity: snapshot.totalEquity })),
    });

    const sellsWithPnl: PnLResultEntry[] = entries.filter((entry) => entry.sellQuantity > 0);
    const wins: number[] = sellsWithPnl.filter((entry) => entry.realizedPnL > 0).map((entry) => entry.realizedPnL);
    const losses: number[] = sellsWithPnl.filter((entry) => entry.realizedPnL < 0).map((entry) => entry.realizedPnL);
    const totalRealizedPnl: number = sellsWithPnl.reduce((sum, entry) => sum + entry.realizedPnL, 0);
    const winRate: number = sellsWithPnl.length > 0 ? Math.round((wins.length / sellsWithPnl.length) * 10000) / 100 : 0;
    const avgWin: number = wins.length > 0 ? MoneyUtil.round2(wins.reduce((sum, v) => sum + v, 0) / wins.length) : 0;
    const avgLoss: number = losses.length > 0 ? MoneyUtil.round2(losses.reduce((sum, v) => sum + v, 0) / losses.length) : 0;
    const grossProfit: number = wins.reduce((sum, v) => sum + v, 0);
    const grossLoss: number = Math.abs(losses.reduce((sum, v) => sum + v, 0));

    const overview: OverviewMetrics = {
      totalTrades: trades.length,
      totalBuys: trades.filter((trade) => trade.side === 'buy').length,
      totalSells: trades.filter((trade) => trade.side === 'sell').length,
      initialCapital,
      netDeposits: projection.netDeposits,
      totalRealizedPnl,
      winRate,
      profitFactor: grossLoss > 0 ? Math.round((grossProfit / grossLoss) * 100) / 100 : null,
      avgWin,
      avgLoss,
      payoffRatio: avgLoss !== 0 ? Math.round((Math.abs(avgWin) / Math.abs(avgLoss)) * 100) / 100 : null,
      biggestWin: wins.length > 0 ? Math.max(...wins) : 0,
      biggestLoss: losses.length > 0 ? Math.min(...losses) : 0,
      maxDrawdown: projection.maxDrawdown,
      maxDrawdownPercent: projection.maxDrawdownPercent,
      finalEquity: projection.finalEquity,
      openPositions: holdings.length,
    };

    const strategyBySellId: Map<string, string> = new Map(trades.map((trade) => [trade.id, trade.strategy]));
    const byStrategy: StrategyBreakdown[] = this.groupByStrategy(sellsWithPnl, strategyBySellId);
    const byMonth: MonthBreakdown[] = this.groupByMonth(trades, entries, cashFlows, projection);
    const bySymbol: SymbolBreakdown[] = this.groupBySymbol(trades, entries);

    return {
      overview,
      byStrategy,
      byMonth,
      bySymbol,
      equitySeries: projection.series,
      holdings,
      projection,
    };
  }

  private groupByStrategy(entries: PnLResultEntry[], strategyBySellId: Map<string, string>): StrategyBreakdown[] {
    const grouped: Map<string, { trades: number; realizedPnl: number; wins: number }> = new Map();
    for (const entry of entries) {
      const strategy: string = strategyBySellId.get(entry.sellTradeId) ?? '未分组';
      const group = grouped.get(strategy) ?? { trades: 0, realizedPnl: 0, wins: 0 };
      group.trades += 1;
      group.realizedPnl += entry.realizedPnL;
      if (entry.realizedPnL > 0) group.wins += 1;
      grouped.set(strategy, group);
    }
    return [...grouped.entries()]
      .map(([strategy, group]) => ({
        strategy,
        trades: group.trades,
        realizedPnl: MoneyUtil.round2(group.realizedPnl),
        winRate: Math.round((group.wins / group.trades) * 10000) / 100,
      }))
      .sort((a, b) => b.realizedPnl - a.realizedPnl);
  }

  private groupByMonth(
    trades: Trade[],
    entries: PnLResultEntry[],
    cashFlows: CashFlow[],
    projection: EquityProjectionResult,
  ): MonthBreakdown[] {
    const months: Set<string> = new Set<string>();
    for (const trade of trades) months.add(trade.tradeDate.slice(0, 7));
    for (const flow of cashFlows) months.add(flow.date.slice(0, 7));
    for (const point of projection.series) months.add(point.date.slice(0, 7));
    const sortedMonths: string[] = [...months].sort();

    const pnlByMonth: Map<string, number> = new Map();
    for (const entry of entries) {
      const month: string = entry.sellTradeDate.slice(0, 7);
      pnlByMonth.set(month, (pnlByMonth.get(month) ?? 0) + entry.realizedPnL);
    }
    const tradesByMonth: Map<string, number> = new Map();
    for (const trade of trades) {
      tradesByMonth.set(trade.tradeDate.slice(0, 7), (tradesByMonth.get(trade.tradeDate.slice(0, 7)) ?? 0) + 1);
    }
    const netDepositsByMonth: Map<string, number> = new Map();
    for (const flow of cashFlows) {
      const month: string = flow.date.slice(0, 7);
      const delta: number = flow.type === 'deposit' ? flow.amount : -flow.amount;
      netDepositsByMonth.set(month, (netDepositsByMonth.get(month) ?? 0) + delta);
    }

    return sortedMonths.map((month) => {
      const monthPoints: EquitySeriesPoint[] = projection.series.filter((point) => point.date.startsWith(month));
      return {
        month,
        trades: tradesByMonth.get(month) ?? 0,
        realizedPnl: MoneyUtil.round2(pnlByMonth.get(month) ?? 0),
        netDeposits: MoneyUtil.round2(netDepositsByMonth.get(month) ?? 0),
        closingEquity: monthPoints.length > 0 ? monthPoints[monthPoints.length - 1]!.equity : 0,
      };
    });
  }

  private groupBySymbol(trades: Trade[], entries: PnLResultEntry[]): SymbolBreakdown[] {
    const nameBySymbol: Map<string, string> = new Map();
    for (const trade of trades) {
      if (trade.name) nameBySymbol.set(trade.symbol, trade.name);
    }
    const grouped: Map<string, { trades: number; realizedPnl: number }> = new Map();
    for (const entry of entries) {
      const group = grouped.get(entry.symbol) ?? { trades: 0, realizedPnl: 0 };
      group.trades += 1;
      group.realizedPnl += entry.realizedPnL;
      grouped.set(entry.symbol, group);
    }
    return [...grouped.entries()]
      .map(([symbol, group]) => ({
        symbol,
        name: nameBySymbol.get(symbol) ?? '',
        trades: group.trades,
        realizedPnl: MoneyUtil.round2(group.realizedPnl),
      }))
      .sort((a, b) => b.realizedPnl - a.realizedPnl);
  }
}

type EquityProjectionUtilPnlEntry = {
  date: string;
  realizedPnl: number;
};

export { AnalyticsService };
export type {
  AnalyticsResponse,
  AnalyticsServiceEnv,
  HoldingsBreakdown,
  MonthBreakdown,
  OverviewMetrics,
  StrategyBreakdown,
  SymbolBreakdown,
};
