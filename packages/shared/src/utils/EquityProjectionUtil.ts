import { MoneyUtil } from './MoneyUtil';

interface EquityCashFlowInput {
  date: string;
  type: 'deposit' | 'withdraw';
  amount: number;
}

interface EquityPnlInput {
  date: string;
  realizedPnl: number;
}

interface EquitySnapshotInput {
  date: string;
  totalEquity: number;
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

interface EquityProjectionResult {
  series: EquitySeriesPoint[];
  initialCapital: number;
  netDeposits: number;
  totalRealizedPnl: number;
  finalEquity: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
}

class EquityProjectionUtil {
  public static project(params: {
    initialCapital: number;
    cashFlows: EquityCashFlowInput[];
    realizedPnlEntries: EquityPnlInput[];
    snapshots: EquitySnapshotInput[];
  }): EquityProjectionResult {
    const { initialCapital, cashFlows, realizedPnlEntries, snapshots } = params;

    const snapshotByDate: Map<string, number> = new Map();
    for (const snapshot of snapshots) {
      snapshotByDate.set(snapshot.date, snapshot.totalEquity);
    }

    const dates: Set<string> = new Set<string>();
    for (const flow of cashFlows) dates.add(flow.date);
    for (const entry of realizedPnlEntries) dates.add(entry.date);
    for (const snapshot of snapshots) dates.add(snapshot.date);
    const sortedDates: string[] = [...dates].sort();

    let cumulativeDeposits: number = 0;
    let cumulativeWithdrawals: number = 0;
    let cumulativePnl: number = 0;

    let runningMax: number = Number.NEGATIVE_INFINITY;
    let maxDrawdown: number = 0;
    let maxDrawdownPercent: number = 0;

    const series: EquitySeriesPoint[] = [];

    for (const date of sortedDates) {
      for (const flow of cashFlows) {
        if (flow.date === date) {
          if (flow.type === 'deposit') cumulativeDeposits += flow.amount;
          else cumulativeWithdrawals += flow.amount;
        }
      }
      for (const entry of realizedPnlEntries) {
        if (entry.date === date) cumulativePnl += entry.realizedPnl;
      }

      const netDeposits: number = MoneyUtil.round2(cumulativeDeposits - cumulativeWithdrawals);
      const cumulativeRealizedPnl: number = MoneyUtil.round2(cumulativePnl);
      const capitalBase: number = MoneyUtil.round2(initialCapital + netDeposits);
      const projectedEquity: number = MoneyUtil.round2(capitalBase + cumulativeRealizedPnl);

      const snapshotEquity: number | null = snapshotByDate.get(date) ?? null;
      const equity: number = snapshotEquity !== null ? MoneyUtil.round2(snapshotEquity) : projectedEquity;

      if (equity > runningMax) {
        runningMax = equity;
      } else if (runningMax > 0 && equity < runningMax) {
        const drawdown: number = MoneyUtil.round2(runningMax - equity);
        const drawdownPercent: number = Math.round((drawdown / runningMax) * 10000) / 100;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
          maxDrawdownPercent = drawdownPercent;
        }
      }

      series.push({
        date,
        equity,
        projectedEquity,
        snapshotEquity,
        drawdown: runningMax > 0 ? MoneyUtil.round2(runningMax - equity) : 0,
        drawdownPercent: runningMax > 0 ? Math.round(((runningMax - equity) / runningMax) * 10000) / 100 : 0,
        cumulativeRealizedPnl,
        netDeposits,
      });
    }

    const finalEquity: number = series.length > 0 ? series[series.length - 1]!.equity : MoneyUtil.round2(initialCapital);

    return {
      series,
      initialCapital,
      netDeposits: MoneyUtil.round2(cumulativeDeposits - cumulativeWithdrawals),
      totalRealizedPnl: cumulativePnl,
      finalEquity,
      maxDrawdown,
      maxDrawdownPercent,
    };
  }
}

export { EquityProjectionUtil };
export type { EquityCashFlowInput, EquityPnlInput, EquityProjectionResult, EquitySeriesPoint, EquitySnapshotInput };
