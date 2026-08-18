import { Hono } from 'hono';
import { createD1SessionEnv } from '@trading-journal/backend-data/utils';
import { BackupService } from '@trading-journal/backend-services/backup';
import { SPA_HTML } from '@/generated/spa-shell';
import {
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
} from '@/endpoints';
import { MiddlewareHandlers } from '@/middleware';
import type { UserContext } from '@/middleware';

type TradingJournalEnv = {
  Bindings: Env;
  Variables: { AuthenticatedUserId: string; AuthenticatedUserEmailAddress: string };
};

class TradingJournalWorker {
  private readonly app: Hono<TradingJournalEnv>;

  constructor() {
    const app: Hono<TradingJournalEnv> = new Hono<TradingJournalEnv>();

    app.get('/', (c) => c.redirect('/user/'));

    app.use('/user/*', MiddlewareHandlers.userAuthentication());

    app.get('/user/me', (c) => new GetCurrentUserRoute().handle(c as UserContext));

    app.get('/user/trades', (c) => new ListTradesRoute().handle(c as UserContext));
    app.post('/user/trades', (c) => new CreateTradeRoute().handle(c as UserContext));
    app.put('/user/trades/:tradeId', (c) => new UpdateTradeRoute().handle(c as UserContext));
    app.delete('/user/trades/:tradeId', (c) => new DeleteTradeRoute().handle(c as UserContext));

    app.get('/user/cash-flows', (c) => new ListCashFlowsRoute().handle(c as UserContext));
    app.post('/user/cash-flows', (c) => new CreateCashFlowRoute().handle(c as UserContext));
    app.put('/user/cash-flows/:cashFlowId', (c) => new UpdateCashFlowRoute().handle(c as UserContext));
    app.delete('/user/cash-flows/:cashFlowId', (c) => new DeleteCashFlowRoute().handle(c as UserContext));

    app.get('/user/equity', (c) => new ListEquitySnapshotsRoute().handle(c as UserContext));
    app.post('/user/equity', (c) => new UpsertEquitySnapshotRoute().handle(c as UserContext));
    app.put('/user/equity/:snapshotId', (c) => new UpdateEquitySnapshotRoute().handle(c as UserContext));
    app.delete('/user/equity/:snapshotId', (c) => new DeleteEquitySnapshotRoute().handle(c as UserContext));

    app.get('/user/analytics', (c) => new GetAnalyticsRoute().handle(c as UserContext));

    app.get('/user/settings', (c) => new GetSettingsRoute().handle(c as UserContext));
    app.put('/user/settings', (c) => new UpdateSettingsRoute().handle(c as UserContext));

    app.get('/user/export', (c) => new ExportRoute().handle(c as UserContext));
    app.post('/user/import', (c) => new ImportRoute().handle(c as UserContext));

    app.post('/api/backup/run', (c) => new TriggerBackupRoute().handle(c));

    app.get('*', (c) => {
      const path: string = new URL(c.req.url).pathname;
      if (!path.startsWith('/user/')) {
        return c.notFound();
      }
      if (String(c.env.SERVE_SPA_FROM_WORKER) !== 'false') {
        return c.html(SPA_HTML);
      }
      return c.notFound();
    });

    this.app = app;
  }

  public async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const path: string = new URL(request.url).pathname;
    if (path.startsWith('/user/') || path.startsWith('/api/')) {
      return this.app.fetch(request, createD1SessionEnv(env), ctx);
    }
    return this.app.fetch(request, env, ctx);
  }

  public async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      BackupService.runBackupForAllUsers(env)
        .then((keys: string[]): void => {
          console.log(`Backup sweep completed: ${keys.length} backup(s) written.`);
        })
        .catch((error: unknown): void => {
          console.error('Backup sweep failed:', error);
        }),
    );
  }
}

export { TradingJournalWorker };
