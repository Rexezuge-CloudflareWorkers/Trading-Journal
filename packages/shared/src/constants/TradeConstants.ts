const TRADE_SIDES: readonly string[] = ['buy', 'sell'] as const;

const TRADE_SIDE_OPTIONS: readonly { value: string; label: string }[] = [
  { value: 'buy', label: 'Buy' },
  { value: 'sell', label: 'Sell' },
];

const CASH_FLOW_TYPES: readonly string[] = ['deposit', 'withdraw'] as const;

const CASH_FLOW_TYPE_OPTIONS: readonly { value: string; label: string }[] = [
  { value: 'deposit', label: 'Deposit' },
  { value: 'withdraw', label: 'Withdraw' },
];

const SUGGESTED_STRATEGIES: readonly string[] = ['突破', '回调', '打板', '低吸', '网格', '波段', '定投', '趋势', '高抛', '止损', '其他'];

export { CASH_FLOW_TYPES, CASH_FLOW_TYPE_OPTIONS, SUGGESTED_STRATEGIES, TRADE_SIDE_OPTIONS, TRADE_SIDES };
