import { forwardRef } from 'react';
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

const baseFieldClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100';

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(baseFieldClass, className)} {...props} />
));
Input.displayName = 'Input';

const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className, ...props }, ref) => (
  <select ref={ref} className={cn(baseFieldClass, className)} {...props} />
));
Select.displayName = 'Select';

const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(baseFieldClass, 'min-h-24', className)} {...props} />
));
Textarea.displayName = 'Textarea';

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }): React.JSX.Element {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
      {children}
    </label>
  );
}

export { FieldLabel, Input, Select, Textarea };
