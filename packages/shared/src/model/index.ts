interface Trade {
  id: string;
  userId: string;
  tradeDate: string;
  symbol: string;
  name: string;
  side: 'buy' | 'sell';
  price: number;
  quantity: number;
  fees: number;
  strategy: string;
  tags: string[];
  reason: string;
  createdAt: string;
  updatedAt: string;
}

interface CashFlow {
  id: string;
  userId: string;
  date: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  note: string;
  createdAt: string;
  updatedAt: string;
}

interface EquitySnapshot {
  id: string;
  userId: string;
  date: string;
  totalEquity: number;
  note: string;
  createdAt: string;
  updatedAt: string;
}

interface Settings {
  userId: string;
  initialCapital: number;
  timeZone: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export type { CashFlow, EquitySnapshot, Settings, Trade, User };
