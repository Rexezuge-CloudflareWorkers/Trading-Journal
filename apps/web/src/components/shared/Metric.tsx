import type { ReactNode } from 'react';
import { Card } from '../ui/Card';

interface MetricProps {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
}

function Metric({ label, value, sub }: MetricProps): React.JSX.Element {
  return (
    <Card className="p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</div>
      <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{sub}</div>}
    </Card>
  );
}

export { Metric };
