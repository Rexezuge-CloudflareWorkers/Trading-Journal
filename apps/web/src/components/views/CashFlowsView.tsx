import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { cashFlowsService } from '../../services/domainServices';
import type { CashFlow, CashFlowInput } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { Input, Select, Textarea, FieldLabel } from '../ui/Input';
import { formatCurrency, today } from '../../lib/utils';

const emptyForm: CashFlowInput = {
  date: today(),
  type: 'deposit',
  amount: 0,
  note: '',
};

function CashFlowsView(): React.JSX.Element {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingFlow, setEditingFlow] = useState<CashFlow | null>(null);
  const [form, setForm] = useState<CashFlowInput>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const { data, loading, error, refresh } = useAsync(() => cashFlowsService.list(), []);

  const { cashFlows = [] } = data ?? {};

  const totals = useMemo(() => {
    let deposits = 0;
    let withdrawals = 0;
    for (const flow of cashFlows) {
      if (flow.type === 'deposit') deposits += flow.amount;
      else withdrawals += flow.amount;
    }
    return { deposits, withdrawals, net: deposits - withdrawals };
  }, [cashFlows]);

  const handleSubmit = async (): Promise<void> => {
    setFormError(null);
    try {
      if (editingFlow) {
        await cashFlowsService.update(editingFlow.id, form);
        setNotice('Cash Flow Updated');
      } else {
        await cashFlowsService.create(form);
        setNotice('Cash Flow Added');
      }
      setModalOpen(false);
      void refresh();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDelete = async (flow: CashFlow): Promise<void> => {
    if (!window.confirm('Delete This Cash Flow?')) return;
    try {
      await cashFlowsService.delete(flow.id);
      setNotice('Cash Flow Deleted');
      void refresh();
    } catch (err: unknown) {
      setNotice(err instanceof Error ? err.message : String(err));
    }
  };

  const openCreate = (): void => {
    setEditingFlow(null);
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (flow: CashFlow): void => {
    setEditingFlow(flow);
    setForm({ date: flow.date, type: flow.type, amount: flow.amount, note: flow.note });
    setFormError(null);
    setModalOpen(true);
  };

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

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Total Deposits</div>
          <div className="mt-1 text-lg font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(totals.deposits)}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Total Withdrawals</div>
          <div className="mt-1 text-lg font-semibold text-red-600 dark:text-red-400">{formatCurrency(totals.withdrawals)}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Net Deposits</div>
          <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(totals.net)}</div>
        </Card>
      </div>

      <Card
        title="Cash Flows"
        action={
          <Button size="sm" onClick={openCreate}>
            <Plus size={14} /> Add Cash Flow
          </Button>
        }
      >
        {loading && <div className="py-8 text-center text-sm text-gray-400">Loading...</div>}
        {error && <div className="py-8 text-center text-sm text-red-500">{error}</div>}
        {!loading && !error && cashFlows.length === 0 && (
          <div className="py-8 text-center text-sm text-gray-400">No Cash Flows Recorded Yet</div>
        )}
        {cashFlows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3 text-right">Amount</th>
                  <th className="py-2 pr-3">Note</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cashFlows.map((flow) => (
                  <tr key={flow.id} className="border-b border-gray-100 last:border-0 dark:border-gray-700">
                    <td className="py-2 pr-3 whitespace-nowrap">{flow.date}</td>
                    <td className="py-2 pr-3">
                      <Badge color={flow.type === 'deposit' ? 'emerald' : 'red'}>{flow.type === 'deposit' ? 'Deposit' : 'Withdraw'}</Badge>
                    </td>
                    <td
                      className={`py-2 pr-3 text-right tabular-nums ${
                        flow.type === 'deposit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {flow.type === 'deposit' ? '+' : '-'}
                      {formatCurrency(flow.amount)}
                    </td>
                    <td className="py-2 pr-3 max-w-48 truncate text-gray-500 dark:text-gray-400" title={flow.note}>
                      {flow.note || '-'}
                    </td>
                    <td className="py-2 text-right whitespace-nowrap">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(flow)} aria-label={`Edit ${flow.date}`}>
                        <Pencil size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => void handleDelete(flow)} aria-label={`Delete ${flow.date}`}>
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
        title={editingFlow ? 'Edit Cash Flow' : 'Add Cash Flow'}
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleSubmit()}>{editingFlow ? 'Save Changes' : 'Add Cash Flow'}</Button>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel htmlFor="cash-flow-date">Date</FieldLabel>
            <Input id="cash-flow-date" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
          </div>
          <div>
            <FieldLabel htmlFor="cash-flow-type">Type</FieldLabel>
            <Select
              id="cash-flow-type"
              value={form.type}
              onChange={(event) => setForm({ ...form, type: event.target.value as 'deposit' | 'withdraw' })}
            >
              <option value="deposit">Deposit</option>
              <option value="withdraw">Withdraw</option>
            </Select>
          </div>
          <div className="col-span-2">
            <FieldLabel htmlFor="cash-flow-amount">Amount</FieldLabel>
            <Input
              id="cash-flow-amount"
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(event) => setForm({ ...form, amount: Number(event.target.value) })}
            />
          </div>
          <div className="col-span-2">
            <FieldLabel htmlFor="cash-flow-note">Note</FieldLabel>
            <Textarea
              id="cash-flow-note"
              value={form.note}
              onChange={(event) => setForm({ ...form, note: event.target.value })}
              placeholder="Why Did You Add Or Withdraw Funds?"
            />
          </div>
        </div>
        {formError && (
          <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-300">{formError}</div>
        )}
      </Modal>
    </div>
  );
}

export { CashFlowsView };
