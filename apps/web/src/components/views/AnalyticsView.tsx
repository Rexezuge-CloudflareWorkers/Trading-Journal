import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { analyticsService, equityService } from '../../services/domainServices';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Metric } from '../shared/Metric';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Input, FieldLabel } from '../ui/Input';
import { LineChart } from '../analytics/LineChart';
import { BarChart } from '../analytics/BarChart';
import { HorizontalBarList } from '../analytics/HorizontalBarList';
import { formatCurrency, formatPercent, formatSigned, pnlClass, today } from '../../lib/utils';

function AnalyticsView(): React.JSX.Element {
  const { data, loading, error, refresh } = useAsync(() => analyticsService.get(), []);

  const [snapshotModalOpen, setSnapshotModalOpen] = useState<boolean>(false);
  const [snapshotForm, setSnapshotForm] = useState<{ date: string; totalEquity: string; note: string }>({
    date: today(),
    totalEquity: '',
    note: '',
  });
  const [snapshotError, setSnapshotError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const { data: equityData, refresh: refreshEquity } = useAsync(() => equityService.list(), []);

  if (loading) return <div className="py-12 text-center text-sm text-gray-400">Loading...</div>;
  if (error) return <div className="py-12 text-center text-sm text-red-500">{error}</div>;
  if (!data) return <div className="py-12 text-center text-sm text-gray-400">No Data</div>;

  const { overview, byStrategy, byMonth, bySymbol, equitySeries, holdings } = data;
  const { equitySnapshots = [] } = equityData ?? {};

  const handleAddSnapshot = async (): Promise<void> => {
    setSnapshotError(null);
    try {
      await equityService.upsert({
        date: snapshotForm.date,
        totalEquity: Number(snapshotForm.totalEquity),
        note: snapshotForm.note,
      });
      setSnapshotModalOpen(false);
      setNotice('Equity Snapshot Saved');
      setSnapshotForm({ date: today(), totalEquity: '', note: '' });
      void refresh();
      void refreshEquity();
    } catch (err: unknown) {
      setSnapshotError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDeleteSnapshot = async (snapshotId: string): Promise<void> => {
    if (!window.confirm('Delete This Equity Snapshot?')) return;
    try {
      await equityService.delete(snapshotId);
      setNotice('Equity Snapshot Deleted');
      void refresh();
      void refreshEquity();
    } catch (err: unknown) {
      setNotice(err instanceof Error ? err.message : String(err));
    }
  };

  const chartPoints = equitySeries.map((point) => ({ label: point.date.slice(5), value: point.equity }));
  const monthlyPoints = byMonth.map((month) => ({ label: month.month.slice(5), value: month.realizedPnl }));

  return (
    <div className="space-y-4">
      {notice && (
        <div
          className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
          role="status"
        >
          {notice}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
        <Metric
          label="Total Realized Pnl"
          value={<span className={pnlClass(overview.totalRealizedPnl)}>{formatSigned(overview.totalRealizedPnl)}</span>}
        />
        <Metric
          label="Final Equity"
          value={formatCurrency(overview.finalEquity)}
          sub={`Start ${formatCurrency(overview.initialCapital)}`}
        />
        <Metric label="Net Deposits" value={formatCurrency(overview.netDeposits)} />
        <Metric label="Win Rate" value={formatPercent(overview.winRate)} sub={`${overview.totalSells} Closed Sells`} />
        <Metric label="Profit Factor" value={overview.profitFactor !== null ? overview.profitFactor.toFixed(2) : '-'} />
        <Metric label="Payoff Ratio" value={overview.payoffRatio !== null ? overview.payoffRatio.toFixed(2) : '-'} />
        <Metric label="Avg Win" value={<span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(overview.avgWin)}</span>} />
        <Metric label="Avg Loss" value={<span className="text-red-600 dark:text-red-400">{formatCurrency(overview.avgLoss)}</span>} />
        <Metric
          label="Biggest Win"
          value={<span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(overview.biggestWin)}</span>}
        />
        <Metric
          label="Biggest Loss"
          value={<span className="text-red-600 dark:text-red-400">{formatCurrency(overview.biggestLoss)}</span>}
        />
        <Metric label="Max Drawdown" value={formatCurrency(overview.maxDrawdown)} sub={formatPercent(overview.maxDrawdownPercent)} />
        <Metric label="Trades" value={overview.totalTrades} sub={`${overview.openPositions} Open Positions`} />
      </div>

      <Card title="Equity Curve">
        <LineChart points={chartPoints} />
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card title="Monthly Realized Pnl">
          <BarChart points={monthlyPoints} />
        </Card>
        <Card title="Pnl By Strategy">
          <HorizontalBarList
            items={byStrategy.map((item) => ({ label: item.strategy, value: item.realizedPnl, detail: `${item.trades} Trades` }))}
            formatter={formatSigned}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card title="Pnl By Symbol">
          <HorizontalBarList
            items={bySymbol.map((item) => ({
              label: item.name ? `${item.symbol} ${item.name}` : item.symbol,
              value: item.realizedPnl,
              detail: `${item.trades} Trades`,
            }))}
            formatter={formatSigned}
          />
        </Card>
        <Card title="Current Holdings">
          {holdings.length === 0 && <div className="py-4 text-center text-sm text-gray-400">No Open Positions</div>}
          <ul className="space-y-2">
            {holdings.map((holding) => (
              <li
                key={holding.symbol}
                className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm dark:bg-gray-700"
              >
                <div>
                  <div className="font-medium">
                    {holding.symbol} {holding.name && <span className="text-xs text-gray-400">{holding.name}</span>}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-300">
                    {holding.quantity.toLocaleString()} Shares @ {formatCurrency(holding.averageCost)}
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500 dark:text-gray-300">Fees {formatCurrency(holding.totalBuyFees)}</div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card
        title="Equity Snapshots"
        action={
          <Button size="sm" onClick={() => setSnapshotModalOpen(true)}>
            <Plus size={14} /> Add Snapshot
          </Button>
        }
      >
        {equitySnapshots.length === 0 && (
          <div className="py-4 text-center text-sm text-gray-400">
            No Snapshots Yet. Add Your Account Total Daily For An Accurate Curve.
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3 text-right">Total Equity</th>
                <th className="py-2 pr-3">Note</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {equitySnapshots.map((snapshot) => (
                <tr key={snapshot.id} className="border-b border-gray-100 last:border-0 dark:border-gray-700">
                  <td className="py-2 pr-3 whitespace-nowrap">{snapshot.date}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{formatCurrency(snapshot.totalEquity)}</td>
                  <td className="py-2 pr-3 max-w-48 truncate text-gray-500 dark:text-gray-400" title={snapshot.note}>
                    {snapshot.note || '-'}
                  </td>
                  <td className="py-2 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void handleDeleteSnapshot(snapshot.id)}
                      aria-label={`Delete Snapshot ${snapshot.date}`}
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {equitySnapshots.length > 0 && (
          <div className="mt-2">
            <Badge color="blue">Snapshot Count: {equitySnapshots.length}</Badge>
          </div>
        )}
      </Card>

      <Modal
        open={snapshotModalOpen}
        title="Add Equity Snapshot"
        onClose={() => setSnapshotModalOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setSnapshotModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleAddSnapshot()}>Save Snapshot</Button>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel htmlFor="snapshot-date">Date</FieldLabel>
            <Input
              id="snapshot-date"
              type="date"
              value={snapshotForm.date}
              onChange={(event) => setSnapshotForm({ ...snapshotForm, date: event.target.value })}
            />
          </div>
          <div>
            <FieldLabel htmlFor="snapshot-total">Total Equity</FieldLabel>
            <Input
              id="snapshot-total"
              type="number"
              step="0.01"
              min="0"
              value={snapshotForm.totalEquity}
              onChange={(event) => setSnapshotForm({ ...snapshotForm, totalEquity: event.target.value })}
            />
          </div>
          <div className="col-span-2">
            <FieldLabel htmlFor="snapshot-note">Note</FieldLabel>
            <Input
              id="snapshot-note"
              value={snapshotForm.note}
              onChange={(event) => setSnapshotForm({ ...snapshotForm, note: event.target.value })}
            />
          </div>
        </div>
        {snapshotError && (
          <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-300">
            {snapshotError}
          </div>
        )}
      </Modal>
    </div>
  );
}

export { AnalyticsView };
