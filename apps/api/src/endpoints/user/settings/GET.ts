import { SettingsDAO, DEFAULT_TIME_ZONE } from '@trading-journal/backend-data/dao';
import type { Settings } from '@trading-journal/shared/model';
import { IUserRoute } from '@/endpoints/IUserRoute';
import type { RouteContext } from '@/endpoints/IUserRoute';

interface GetSettingsResponse {
  initialCapital: number;
  timeZone: string;
}

class GetSettingsRoute extends IUserRoute<GetSettingsResponse> {
  protected async handleRequest(c: RouteContext, userId: string): Promise<GetSettingsResponse> {
    const settings: Settings | null = await new SettingsDAO(c.env.DB).getByUserId(userId);
    return {
      initialCapital: settings?.initialCapital ?? 0,
      timeZone: settings?.timeZone ?? DEFAULT_TIME_ZONE,
    };
  }
}

export { GetSettingsRoute };
