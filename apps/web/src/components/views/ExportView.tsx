import { useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { importService } from '../../services/domainServices';
import { downloadUrl } from '../../services/api';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Select, FieldLabel } from '../ui/Input';
import type { ImportResult } from '../../types';

function ExportView(): React.JSX.Element {
  const [csvTable, setCsvTable] = useState<string>('trades');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [busy, setBusy] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImportFile = async (file: File | null): Promise<void> => {
    if (!file) return;
    setImportError(null);
    setImportResult(null);
    setBusy(true);
    try {
      const text: string = await file.text();
      const payload: unknown = JSON.parse(text);
      const result: ImportResult = await importService.import(payload as never);
      setImportResult(result);
    } catch (err: unknown) {
      setImportError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card title="Export Full Backup" className="space-y-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Download All Trades, Cash Flows, Equity Snapshots And Settings As A Single JSON File. Keep It As Your Local Backup.
        </p>
        <Button size="sm" onClick={() => downloadUrl('/user/export')}>
          <Download size={14} /> Download JSON Backup
        </Button>
      </Card>

      <Card title="Export CSV" className="space-y-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">Export A Single Table As CSV For Spreadsheets.</p>
        <div className="flex items-end gap-3">
          <div className="w-48">
            <FieldLabel htmlFor="csv-table">Table</FieldLabel>
            <Select id="csv-table" value={csvTable} onChange={(event) => setCsvTable(event.target.value)}>
              <option value="trades">Trades</option>
              <option value="cash-flows">Cash Flows</option>
              <option value="equity-snapshots">Equity Snapshots</option>
            </Select>
          </div>
          <Button size="sm" variant="secondary" onClick={() => downloadUrl(`/user/export?format=csv&table=${csvTable}`)}>
            <Download size={14} /> Download CSV
          </Button>
        </div>
      </Card>

      <Card title="Import Backup" className="space-y-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Restore From A Previously Downloaded JSON Backup. Import Is Idempotent — Re-Running It Is Safe.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="text-sm text-gray-600 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-gray-200 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700 dark:text-gray-300 dark:file:bg-gray-700 dark:file:text-gray-100"
          onChange={(event) => void handleImportFile(event.target.files?.[0] ?? null)}
          disabled={busy}
        />
        {importError && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-300">{importError}</div>
        )}
        {importResult && (
          <div
            className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
            role="status"
          >
            Import Complete: {importResult.trades} Trades, {importResult.cashFlows} Cash Flows, {importResult.equitySnapshots} Snapshots,
            {importResult.settings} Settings Row.
          </div>
        )}
      </Card>
    </div>
  );
}

export { ExportView };
