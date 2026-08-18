import { useState } from 'react';
import { CandlestickChart, ArrowDownUp, TrendingUp, Download, Settings } from 'lucide-react';
import { TradesView } from './components/views/TradesView';
import { CashFlowsView } from './components/views/CashFlowsView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { SettingsView } from './components/views/SettingsView';
import { ExportView } from './components/views/ExportView';
import { useAsync } from './hooks/useAsync';
import { apiFetch } from './services/api';
import type { CurrentUser } from './types';
import { cn } from './lib/cn';

type TabId = 'trades' | 'cash-flows' | 'analytics' | 'export' | 'settings';

const NAV_ITEMS: { id: TabId; label: string; icon: typeof CandlestickChart }[] = [
  { id: 'trades', label: 'Trades', icon: CandlestickChart },
  { id: 'cash-flows', label: 'Cash Flows', icon: ArrowDownUp },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'export', label: 'Backup', icon: Download },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function SpaApp(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabId>('trades');
  const { data: user } = useAsync(() => apiFetch<CurrentUser>('/user/me'), []);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-700 dark:bg-gray-900/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <CandlestickChart size={20} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">Trading Journal</span>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">{user?.email ?? '...'}</span>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2" aria-label="Main Navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  activeTab === item.id
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
                )}
                aria-current={activeTab === item.id ? 'page' : undefined}
              >
                <Icon size={14} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        {activeTab === 'trades' && <TradesView />}
        {activeTab === 'cash-flows' && <CashFlowsView />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'export' && <ExportView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}

export { SpaApp };
