interface Trade {
  id: string;
  userId: string;
  tradeDate: string;
  symbol: string;
  name: string;
  side: 'buy' | 'sell';
  price: number;
  quantity: number;
  fees: number;
  strategy: string;
  tags: string[];
  reason: string;
  createdAt: string;
  updatedAt: string;
}

type TradeInput = Omit<Trade, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

interface CashFlow {
  id: string;
  userId: string;
  date: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  note: string;
  createdAt: string;
  updatedAt: string;
}

type CashFlowInput = Omit<CashFlow, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

interface EquitySnapshot {
  id: string;
  userId: string;
  date: string;
  totalEquity: number;
  note: string;
  createdAt: string;
  updatedAt: string;
}

interface EquitySnapshotInput {
  id?: string;
  date: string;
  totalEquity: number;
  note?: string;
}

interface SettingsSummary {
  initialCapital: number;
  timeZone: string;
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

interface EquitySeriesPoint {
  date: string;
  equity: number;
  projectedEquity: number;
  snapshotEquity: number | null;
  drawdown: number;
  drawdownPercent: number;
  cumulativeRealizedPnl: number;
  netDeposits: number;
}

interface AnalyticsResponse {
  overview: OverviewMetrics;
  byStrategy: StrategyBreakdown[];
  byMonth: MonthBreakdown[];
  bySymbol: SymbolBreakdown[];
  equitySeries: EquitySeriesPoint[];
  holdings: HoldingsBreakdown[];
}

interface CurrentUser {
  email: string;
  userId: string;
  displayName: string;
}

interface ImportResult {
  ok: boolean;
  trades: number;
  cashFlows: number;
  equitySnapshots: number;
  settings: number;
}

export type {
  AnalyticsResponse,
  CashFlow,
  CashFlowInput,
  CurrentUser,
  EquitySnapshot,
  EquitySnapshotInput,
  EquitySeriesPoint,
  HoldingsBreakdown,
  ImportResult,
  MonthBreakdown,
  OverviewMetrics,
  SettingsSummary,
  StrategyBreakdown,
  SymbolBreakdown,
  Trade,
  TradeInput,
};
