import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
}

function Card({ children, className, title, action }: CardProps): React.JSX.Element {
  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800', className)}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between">
          {title && <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export { Card };
