import { useState } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { settingsService } from '../../services/domainServices';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input, FieldLabel } from '../ui/Input';

function SettingsView(): React.JSX.Element {
  const { data, loading, error, refresh } = useAsync(() => settingsService.get(), []);
  const [initialCapital, setInitialCapital] = useState<string>('');
  const [timeZone, setTimeZone] = useState<string>('Asia/Shanghai');
  const [saving, setSaving] = useState<boolean>(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (loading) return <div className="py-12 text-center text-sm text-gray-400">Loading...</div>;
  if (error) return <div className="py-12 text-center text-sm text-red-500">{error}</div>;
  if (data && initialCapital === '' && timeZone === 'Asia/Shanghai') {
    setInitialCapital(String(data.initialCapital));
    setTimeZone(data.timeZone);
  }

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    setSaveError(null);
    try {
      await settingsService.update({ initialCapital: Number(initialCapital) || 0, timeZone });
      setNotice('Settings Saved');
      void refresh();
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-4">
      {notice && (
        <div
          className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
          role="status"
        >
          {notice}
        </div>
      )}
      <Card title="Settings">
        <div className="space-y-4">
          <div>
            <FieldLabel htmlFor="initial-capital">Initial Capital</FieldLabel>
            <Input
              id="initial-capital"
              type="number"
              step="0.01"
              min="0"
              value={initialCapital}
              onChange={(event) => setInitialCapital(event.target.value)}
              placeholder="100000"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Used As The Baseline For Projected Equity When No Snapshot Exists.
            </p>
          </div>
          <div>
            <FieldLabel htmlFor="time-zone">Time Zone</FieldLabel>
            <Input id="time-zone" value={timeZone} onChange={(event) => setTimeZone(event.target.value)} />
          </div>
          {saveError && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-300">{saveError}</div>
          )}
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export { SettingsView };
