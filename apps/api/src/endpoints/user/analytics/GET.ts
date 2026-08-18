import { AnalyticsService } from '@trading-journal/backend-services/analytics';
import type { AnalyticsResponse } from '@trading-journal/backend-services/analytics';
import { IUserRoute } from '@/endpoints/IUserRoute';
import type { RouteContext } from '@/endpoints/IUserRoute';

class GetAnalyticsRoute extends IUserRoute<AnalyticsResponse> {
  protected async handleRequest(c: RouteContext, userId: string): Promise<AnalyticsResponse> {
    return new AnalyticsService(c.env, userId).getAnalytics();
  }
}

export { GetAnalyticsRoute };
