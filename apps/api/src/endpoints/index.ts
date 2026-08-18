import { TriggerBackupRoute } from './api/backup/run/POST';
import { ListCashFlowsRoute } from './user/cash-flows/GET';
import { CreateCashFlowRoute } from './user/cash-flows/POST';
import { UpdateCashFlowRoute } from './user/cash-flows/cashFlowId/PUT';
import { DeleteCashFlowRoute } from './user/cash-flows/cashFlowId/DELETE';
import { GetAnalyticsRoute } from './user/analytics/GET';
import { ListEquitySnapshotsRoute } from './user/equity/GET';
import { UpsertEquitySnapshotRoute } from './user/equity/POST';
import { UpdateEquitySnapshotRoute } from './user/equity/snapshotId/PUT';
import { DeleteEquitySnapshotRoute } from './user/equity/snapshotId/DELETE';
import { ExportRoute } from './user/export/GET';
import { ImportRoute } from './user/import/POST';
import { GetCurrentUserRoute } from './user/me/GET';
import { GetSettingsRoute } from './user/settings/GET';
import { UpdateSettingsRoute } from './user/settings/PUT';
import { ListTradesRoute } from './user/trades/GET';
import { CreateTradeRoute } from './user/trades/POST';
import { UpdateTradeRoute } from './user/trades/tradeId/PUT';
import { DeleteTradeRoute } from './user/trades/tradeId/DELETE';

export {
  CreateCashFlowRoute,
  CreateTradeRoute,
  DeleteCashFlowRoute,
  DeleteEquitySnapshotRoute,
  DeleteTradeRoute,
  ExportRoute,
  GetAnalyticsRoute,
  GetCurrentUserRoute,
  GetSettingsRoute,
  ImportRoute,
  ListCashFlowsRoute,
  ListEquitySnapshotsRoute,
  ListTradesRoute,
  TriggerBackupRoute,
  UpdateCashFlowRoute,
  UpdateEquitySnapshotRoute,
  UpdateSettingsRoute,
  UpdateTradeRoute,
  UpsertEquitySnapshotRoute,
};
