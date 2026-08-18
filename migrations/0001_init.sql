-- 0001_init.sql
-- Trading Journal initial schema: users, trades, cash_flows, equity_snapshots, settings

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS trades (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  trade_date TEXT NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  price REAL NOT NULL CHECK (price > 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  fees REAL NOT NULL DEFAULT 0 CHECK (fees >= 0),
  strategy TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '[]',
  reason TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_trades_user_date ON trades (user_id, trade_date);
CREATE INDEX IF NOT EXISTS idx_trades_user_symbol ON trades (user_id, symbol);

CREATE TABLE IF NOT EXISTS cash_flows (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdraw')),
  amount REAL NOT NULL CHECK (amount > 0),
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cash_flows_user_date ON cash_flows (user_id, date);

CREATE TABLE IF NOT EXISTS equity_snapshots (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  total_equity REAL NOT NULL CHECK (total_equity > 0),
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (user_id, date)
);
CREATE INDEX IF NOT EXISTS idx_equity_snapshots_user_date ON equity_snapshots (user_id, date);

CREATE TABLE IF NOT EXISTS settings (
  user_id TEXT PRIMARY KEY,
  initial_capital REAL NOT NULL DEFAULT 0 CHECK (initial_capital >= 0),
  time_zone TEXT NOT NULL DEFAULT 'Asia/Shanghai',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);