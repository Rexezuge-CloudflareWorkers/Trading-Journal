import { CashFlowDAO, EquitySnapshotDAO, SettingsDAO, TradeDAO, UserDAO } from '@trading-journal/backend-data/dao';
import { BadRequestError } from '@trading-journal/backend-errors';
import type { CashFlow, EquitySnapshot, Settings, Trade, User } from '@trading-journal/shared/model';
import type { ImportPayload } from '@trading-journal/shared/schema';
import { CsvUtil, MoneyUtil, TimestampUtil } from '@trading-journal/shared/utils';
import type { CsvColumn } from '@trading-journal/shared/utils';

interface ExportPayload {
  version: 1;
  exportedAt: string;
  user: { id: string; email: string };
  trades: Trade[];
  cashFlows: CashFlow[];
  equitySnapshots: EquitySnapshot[];
  settings: Settings | null;
}

interface ImportResult {
  trades: number;
  cashFlows: number;
  equitySnapshots: number;
  settings: number;
}

interface ExportImportServiceEnv {
  DB: D1Database;
}

class ExportImportService {
  private readonly userId: string;
  private readonly tradeDAO: TradeDAO;
  private readonly cashFlowDAO: CashFlowDAO;
  private readonly snapshotDAO: EquitySnapshotDAO;
  private readonly settingsDAO: SettingsDAO;
  private readonly userDAO: UserDAO;

  constructor(env: ExportImportServiceEnv, userId: string) {
    this.userId = userId;
    this.tradeDAO = new TradeDAO(env.DB);
    this.cashFlowDAO = new CashFlowDAO(env.DB);
    this.snapshotDAO = new EquitySnapshotDAO(env.DB);
    this.settingsDAO = new SettingsDAO(env.DB);
    this.userDAO = new UserDAO(env.DB);
  }

  public async exportAll(): Promise<ExportPayload> {
    const user: User | null = await this.userDAO.getUser(this.userId);
    const [trades, cashFlows, equitySnapshots, settings]: [Trade[], CashFlow[], EquitySnapshot[], Settings | null] = await Promise.all([
      this.tradeDAO.listByUserId(this.userId),
      this.cashFlowDAO.listByUserId(this.userId),
      this.snapshotDAO.listByUserId(this.userId),
      this.settingsDAO.getByUserId(this.userId),
    ]);

    return {
      version: 1,
      exportedAt: TimestampUtil.getCurrentIsoString(),
      user: { id: this.userId, email: user?.email ?? '' },
      trades,
      cashFlows,
      equitySnapshots,
      settings,
    };
  }

  public async importAll(payload: ImportPayload): Promise<ImportResult> {
    const now: string = TimestampUtil.getCurrentIsoString();

    if (payload.trades.length > 0) {
      const statements: D1PreparedStatement[] = payload.trades.map((trade) =>
        this.tradeDAO
          .getDatabase()
          .prepare(
            `INSERT INTO trades (id, user_id, trade_date, symbol, name, side, price, quantity, fees, strategy, tags, reason, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT (id) DO UPDATE SET user_id = excluded.user_id, trade_date = excluded.trade_date, symbol = excluded.symbol,
               name = excluded.name, side = excluded.side, price = excluded.price, quantity = excluded.quantity, fees = excluded.fees,
               strategy = excluded.strategy, tags = excluded.tags, reason = excluded.reason, updated_at = excluded.updated_at`,
          )
          .bind(
            trade.id,
            this.userId,
            trade.tradeDate,
            trade.symbol,
            trade.name ?? '',
            trade.side,
            trade.price,
            trade.quantity,
            trade.fees ?? 0,
            trade.strategy ?? '',
            JSON.stringify(trade.tags ?? []),
            trade.reason ?? '',
            now,
            now,
          ),
      );
      await this.tradeDAO.getDatabase().batch(statements);
    }

    if (payload.cashFlows.length > 0) {
      const statements: D1PreparedStatement[] = payload.cashFlows.map((flow) =>
        this.cashFlowDAO
          .getDatabase()
          .prepare(
            `INSERT INTO cash_flows (id, user_id, date, type, amount, note, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT (id) DO UPDATE SET user_id = excluded.user_id, date = excluded.date, type = excluded.type,
               amount = excluded.amount, note = excluded.note, updated_at = excluded.updated_at`,
          )
          .bind(flow.id, this.userId, flow.date, flow.type, flow.amount, flow.note ?? '', now, now),
      );
      await this.cashFlowDAO.getDatabase().batch(statements);
    }

    if (payload.equitySnapshots.length > 0) {
      const statements: D1PreparedStatement[] = payload.equitySnapshots.map((snapshot) =>
        this.snapshotDAO
          .getDatabase()
          .prepare(
            `INSERT INTO equity_snapshots (id, user_id, date, total_equity, note, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT (user_id, date) DO UPDATE SET id = excluded.id, total_equity = excluded.total_equity,
               note = excluded.note, updated_at = excluded.updated_at`,
          )
          .bind(snapshot.id, this.userId, snapshot.date, snapshot.totalEquity, snapshot.note ?? '', now, now),
      );
      await this.snapshotDAO.getDatabase().batch(statements);
    }

    if (payload.settings) {
      const settingsRow: Settings = {
        userId: this.userId,
        initialCapital: MoneyUtil.round2(payload.settings.initialCapital),
        timeZone: payload.settings.timeZone,
        createdAt: now,
        updatedAt: now,
      };
      await this.settingsDAO.upsert(settingsRow);
    }

    return {
      trades: payload.trades.length,
      cashFlows: payload.cashFlows.length,
      equitySnapshots: payload.equitySnapshots.length,
      settings: payload.settings ? 1 : 0,
    };
  }

  public async exportCsv(table: string): Promise<string> {
    switch (table) {
      case 'trades': {
        const rows: CsvTableRow[] = (await this.tradeDAO.listByUserId(this.userId)).map((trade) => ({
          id: trade.id,
          tradeDate: trade.tradeDate,
          symbol: trade.symbol,
          name: trade.name,
          side: trade.side,
          price: trade.price,
          quantity: trade.quantity,
          fees: trade.fees,
          strategy: trade.strategy,
          tags: trade.tags.join('|'),
          reason: trade.reason,
        }));
        return CsvUtil.toCsv(rows, TRADE_CSV_COLUMNS);
      }
      case 'cash-flows': {
        const rows: CsvTableRow[] = (await this.cashFlowDAO.listByUserId(this.userId)).map((flow) => ({
          id: flow.id,
          date: flow.date,
          type: flow.type,
          amount: flow.amount,
          note: flow.note,
        }));
        return CsvUtil.toCsv(rows, CASH_FLOW_CSV_COLUMNS);
      }
      case 'equity-snapshots': {
        const rows: CsvTableRow[] = (await this.snapshotDAO.listByUserId(this.userId)).map((snapshot) => ({
          id: snapshot.id,
          date: snapshot.date,
          totalEquity: snapshot.totalEquity,
          note: snapshot.note,
        }));
        return CsvUtil.toCsv(rows, EQUITY_SNAPSHOT_CSV_COLUMNS);
      }
      default:
        throw new BadRequestError(`Unsupported CSV table: ${table}`);
    }
  }
}

type CsvTableRow = Record<string, unknown>;

const TRADE_CSV_COLUMNS: CsvColumn<CsvTableRow>[] = [
  { key: 'id', label: 'ID' },
  { key: 'tradeDate', label: 'Trade Date' },
  { key: 'symbol', label: 'Symbol' },
  { key: 'name', label: 'Name' },
  { key: 'side', label: 'Side' },
  { key: 'price', label: 'Price' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'fees', label: 'Fees' },
  { key: 'strategy', label: 'Strategy' },
  { key: 'tags', label: 'Tags' },
  { key: 'reason', label: 'Reason' },
];

const CASH_FLOW_CSV_COLUMNS: CsvColumn<CsvTableRow>[] = [
  { key: 'id', label: 'ID' },
  { key: 'date', label: 'Date' },
  { key: 'type', label: 'Type' },
  { key: 'amount', label: 'Amount' },
  { key: 'note', label: 'Note' },
];

const EQUITY_SNAPSHOT_CSV_COLUMNS: CsvColumn<CsvTableRow>[] = [
  { key: 'id', label: 'ID' },
  { key: 'date', label: 'Date' },
  { key: 'totalEquity', label: 'Total Equity' },
  { key: 'note', label: 'Note' },
];

export { ExportImportService };
export type { ExportImportServiceEnv, ExportPayload, ImportResult };
