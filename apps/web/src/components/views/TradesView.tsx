import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { tradesService } from '../../services/domainServices';
import { SUGGESTED_STRATEGIES } from '../../lib/constants';
import type { Trade, TradeInput } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { Input, Select, Textarea, FieldLabel } from '../ui/Input';
import { formatCurrency, today } from '../../lib/utils';

const emptyForm: TradeInput = {
  tradeDate: today(),
  symbol: '',
  name: '',
  side: 'buy',
  price: 0,
  quantity: 0,
  fees: 0,
  strategy: '',
  tags: [],
  reason: '',
};

function TradesView(): React.JSX.Element {
  const [filters, setFilters] = useState<{ symbol: string; side: string; from: string; to: string; strategy: string }>({
    symbol: '',
    side: '',
    from: '',
    to: '',
    strategy: '',
  });
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [form, setForm] = useState<TradeInput>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const query = useMemo(() => {
    const params: Record<string, string> = {};
    if (filters.symbol) params.symbol = filters.symbol;
    if (filters.side) params.side = filters.side;
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    if (filters.strategy) params.strategy = filters.strategy;
    return params;
  }, [filters.symbol, filters.side, filters.from, filters.to, filters.strategy]);

  const { data, loading, error, refresh } = useAsync(() => tradesService.list(query), [query]);

  const handleSubmit = async (): Promise<void> => {
    setFormError(null);
    setWarnings([]);
    try {
      const response = editingTrade ? await tradesService.update(editingTrade.id, form) : await tradesService.create(form);
      setWarnings(response.warnings);
      setNotice(editingTrade ? 'Trade Updated' : 'Trade Added');
      setModalOpen(false);
      void refresh();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDelete = async (trade: Trade): Promise<void> => {
    if (!window.confirm('Delete This Trade?')) return;
    try {
      await tradesService.delete(trade.id);
      setNotice('Trade Deleted');
      void refresh();
    } catch (err: unknown) {
      setNotice(err instanceof Error ? err.message : String(err));
    }
  };

  const openCreate = (): void => {
    setEditingTrade(null);
    setForm(emptyForm);
    setFormError(null);
    setWarnings([]);
    setModalOpen(true);
  };

  const openEdit = (trade: Trade): void => {
    setEditingTrade(trade);
    setForm({
      tradeDate: trade.tradeDate,
      symbol: trade.symbol,
      name: trade.name,
      side: trade.side,
      price: trade.price,
      quantity: trade.quantity,
      fees: trade.fees,
      strategy: trade.strategy,
      tags: trade.tags,
      reason: trade.reason,
    });
    setFormError(null);
    setWarnings([]);
    setModalOpen(true);
  };

  const { trades = [] } = data ?? {};
  const totalBuys: number = trades.filter((trade) => trade.side === 'buy').length;
  const totalSells: number = trades.filter((trade) => trade.side === 'sell').length;

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

      <Card className="space-y-3">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          <div>
            <FieldLabel>Symbol</FieldLabel>
            <Input
              value={filters.symbol}
              onChange={(event) => setFilters({ ...filters, symbol: event.target.value })}
              placeholder="600519"
            />
          </div>
          <div>
            <FieldLabel>Side</FieldLabel>
            <Select value={filters.side} onChange={(event) => setFilters({ ...filters, side: event.target.value })}>
              <option value="">All</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </Select>
          </div>
          <div>
            <FieldLabel>From</FieldLabel>
            <Input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} />
          </div>
          <div>
            <FieldLabel>To</FieldLabel>
            <Input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} />
          </div>
          <div>
            <FieldLabel>Strategy</FieldLabel>
            <Select value={filters.strategy} onChange={(event) => setFilters({ ...filters, strategy: event.target.value })}>
              <option value="">All</option>
              {SUGGESTED_STRATEGIES.map((strategy) => (
                <option key={strategy} value={strategy}>
                  {strategy}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-end">
            <Button variant="secondary" onClick={() => setFilters({ symbol: '', side: '', from: '', to: '', strategy: '' })}>
              Clear
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {trades.length} Trades · {totalBuys} Buys · {totalSells} Sells
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus size={14} /> Add Trade
          </Button>
        </div>
      </Card>

      <Card>
        {loading && <div className="py-8 text-center text-sm text-gray-400">Loading...</div>}
        {error && <div className="py-8 text-center text-sm text-red-500">{error}</div>}
        {!loading && !error && trades.length === 0 && <div className="py-8 text-center text-sm text-gray-400">No Trades Recorded Yet</div>}
        {trades.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Symbol</th>
                  <th className="py-2 pr-3">Side</th>
                  <th className="py-2 pr-3 text-right">Price</th>
                  <th className="py-2 pr-3 text-right">Quantity</th>
                  <th className="py-2 pr-3 text-right">Fees</th>
                  <th className="py-2 pr-3">Strategy</th>
                  <th className="py-2 pr-3">Reason</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr key={trade.id} className="border-b border-gray-100 last:border-0 dark:border-gray-700">
                    <td className="py-2 pr-3 whitespace-nowrap">{trade.tradeDate}</td>
                    <td className="py-2 pr-3">
                      <div className="font-medium">{trade.symbol}</div>
                      {trade.name && <div className="text-xs text-gray-400">{trade.name}</div>}
                    </td>
                    <td className="py-2 pr-3">
                      <Badge color={trade.side === 'buy' ? 'emerald' : 'red'}>{trade.side === 'buy' ? 'Buy' : 'Sell'}</Badge>
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">{formatCurrency(trade.price)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{trade.quantity.toLocaleString()}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{trade.fees.toFixed(2)}</td>
                    <td className="py-2 pr-3">
                      {trade.strategy ? (
                        <Badge color="blue">{trade.strategy}</Badge>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">-</span>
                      )}
                    </td>
                    <td className="py-2 pr-3 max-w-48 truncate text-gray-500 dark:text-gray-400" title={trade.reason}>
                      {trade.reason || '-'}
                    </td>
                    <td className="py-2 text-right whitespace-nowrap">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(trade)} aria-label={`Edit ${trade.symbol}`}>
                        <Pencil size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => void handleDelete(trade)} aria-label={`Delete ${trade.symbol}`}>
                        <Trash2 size={14} className="text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        title={editingTrade ? 'Edit Trade' : 'Add Trade'}
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleSubmit()}>{editingTrade ? 'Save Changes' : 'Add Trade'}</Button>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel htmlFor="trade-date">Trade Date</FieldLabel>
            <Input
              id="trade-date"
              type="date"
              value={form.tradeDate}
              onChange={(event) => setForm({ ...form, tradeDate: event.target.value })}
            />
          </div>
          <div>
            <FieldLabel htmlFor="trade-side">Side</FieldLabel>
            <Select
              id="trade-side"
              value={form.side}
              onChange={(event) => setForm({ ...form, side: event.target.value as 'buy' | 'sell' })}
            >
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </Select>
          </div>
          <div>
            <FieldLabel htmlFor="trade-symbol">Symbol</FieldLabel>
            <Input
              id="trade-symbol"
              value={form.symbol}
              onChange={(event) => setForm({ ...form, symbol: event.target.value })}
              placeholder="600519"
              maxLength={6}
            />
          </div>
          <div>
            <FieldLabel htmlFor="trade-name">Name</FieldLabel>
            <Input
              id="trade-name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="贵州茅台"
            />
          </div>
          <div>
            <FieldLabel htmlFor="trade-price">Price</FieldLabel>
            <Input
              id="trade-price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(event) => setForm({ ...form, price: Number(event.target.value) })}
            />
          </div>
          <div>
            <FieldLabel htmlFor="trade-quantity">Quantity</FieldLabel>
            <Input
              id="trade-quantity"
              type="number"
              step="100"
              min="0"
              value={form.quantity}
              onChange={(event) => setForm({ ...form, quantity: Number(event.target.value) })}
            />
          </div>
          <div>
            <FieldLabel htmlFor="trade-fees">Fees</FieldLabel>
            <Input
              id="trade-fees"
              type="number"
              step="0.01"
              min="0"
              value={form.fees}
              onChange={(event) => setForm({ ...form, fees: Number(event.target.value) })}
            />
          </div>
          <div>
            <FieldLabel htmlFor="trade-strategy">Strategy</FieldLabel>
            <Select id="trade-strategy" value={form.strategy} onChange={(event) => setForm({ ...form, strategy: event.target.value })}>
              <option value="">None</option>
              {SUGGESTED_STRATEGIES.map((strategy) => (
                <option key={strategy} value={strategy}>
                  {strategy}
                </option>
              ))}
            </Select>
          </div>
          <div className="col-span-2">
            <FieldLabel htmlFor="trade-tags">Tags (Comma Separated)</FieldLabel>
            <Input
              id="trade-tags"
              value={form.tags.join(', ')}
              onChange={(event) =>
                setForm({
                  ...form,
                  tags: event.target.value
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
          <div className="col-span-2">
            <FieldLabel htmlFor="trade-reason">Reason</FieldLabel>
            <Textarea
              id="trade-reason"
              value={form.reason}
              onChange={(event) => setForm({ ...form, reason: event.target.value })}
              placeholder="Why Did You Enter Or Exit This Position?"
            />
          </div>
        </div>
        {formError && (
          <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-300">{formError}</div>
        )}
        {warnings.map((warning) => (
          <div
            key={warning}
            className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
          >
            {warning}
          </div>
        ))}
      </Modal>
    </div>
  );
}

export { TradesView };
