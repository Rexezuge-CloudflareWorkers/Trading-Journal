export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', minimumFractionDigits: 2 }).format(value);
}

export function formatSigned(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}`;
}

export function pnlClass(value: number): string {
  if (value > 0) return 'text-emerald-600';
  if (value < 0) return 'text-red-600';
  return 'text-gray-500';
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
