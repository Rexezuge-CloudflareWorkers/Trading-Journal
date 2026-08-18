import { SettingsDAO } from '@trading-journal/backend-data/dao';
import { SettingsInputSchema } from '@trading-journal/shared/schema';
import type { SettingsInput } from '@trading-journal/shared/schema';
import { MoneyUtil, TimestampUtil } from '@trading-journal/shared/utils';
import { IUserRoute } from '@/endpoints/IUserRoute';
import type { RouteContext } from '@/endpoints/IUserRoute';

interface UpdateSettingsResponse {
  initialCapital: number;
  timeZone: string;
}

class UpdateSettingsRoute extends IUserRoute<UpdateSettingsResponse> {
  protected async handleRequest(c: RouteContext, userId: string): Promise<UpdateSettingsResponse> {
    const input: SettingsInput = await this.validateJson(c, SettingsInputSchema);
    const now: string = TimestampUtil.getCurrentIsoString();
    const dao: SettingsDAO = new SettingsDAO(c.env.DB);
    await dao.upsert({
      userId,
      initialCapital: MoneyUtil.round2(input.initialCapital),
      timeZone: input.timeZone,
      createdAt: now,
      updatedAt: now,
    });
    return { initialCapital: MoneyUtil.round2(input.initialCapital), timeZone: input.timeZone };
  }
}

export { UpdateSettingsRoute };
