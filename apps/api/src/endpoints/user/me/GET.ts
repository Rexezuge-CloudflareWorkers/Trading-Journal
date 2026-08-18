import { UserService } from '@trading-journal/backend-services/user';
import { IUserRoute } from '@/endpoints/IUserRoute';
import type { RouteContext } from '@/endpoints/IUserRoute';

interface GetCurrentUserResponse {
  email: string;
  userId: string;
  displayName: string;
}

class GetCurrentUserRoute extends IUserRoute<GetCurrentUserResponse> {
  protected async handleRequest(c: RouteContext, userId: string, email: string): Promise<GetCurrentUserResponse> {
    const user = await new UserService(c.env, userId).getCurrentUser();
    return {
      email,
      userId,
      displayName: user?.displayName ?? '',
    };
  }
}

export { GetCurrentUserRoute };
export type { GetCurrentUserResponse };
