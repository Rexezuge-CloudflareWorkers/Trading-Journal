import { TradingJournalWorker } from '@/workers';

const tradingJournalWorker: TradingJournalWorker = new TradingJournalWorker();

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return tradingJournalWorker.fetch(request, env, ctx);
  },
  scheduled(event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    return tradingJournalWorker.scheduled(event, env, ctx);
  },
};
