import { pnlClass } from '../../lib/utils';

interface HorizontalBarItem {
  label: string;
  value: number;
  detail?: string;
}

interface HorizontalBarListProps {
  items: HorizontalBarItem[];
  formatter?: (value: number) => string;
}

function HorizontalBarList({ items, formatter }: HorizontalBarListProps): React.JSX.Element {
  if (items.length === 0) {
    return <div className="py-8 text-center text-sm text-gray-400">No Data</div>;
  }

  const maxAbs: number = Math.max(...items.map((item) => Math.abs(item.value)), 1);

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-3">
          <span className="w-20 shrink-0 truncate text-xs text-gray-600 dark:text-gray-300">{item.label}</span>
          <div className="relative h-4 flex-1 overflow-hidden rounded bg-gray-100 dark:bg-gray-700">
            <div
              className="absolute inset-y-0 rounded"
              style={{
                left: item.value >= 0 ? '50%' : `${50 - (Math.abs(item.value) / maxAbs) * 50}%`,
                width: `${(Math.abs(item.value) / maxAbs) * 50}%`,
                backgroundColor: item.value >= 0 ? '#10b981' : '#ef4444',
              }}
            />
          </div>
          <span className={`w-28 shrink-0 text-right text-xs font-medium ${pnlClass(item.value)}`}>
            {formatter ? formatter(item.value) : item.value.toFixed(2)}
            {item.detail ? ` (${item.detail})` : ''}
          </span>
        </li>
      ))}
    </ul>
  );
}

export { HorizontalBarList };
export type { HorizontalBarItem, HorizontalBarListProps };
