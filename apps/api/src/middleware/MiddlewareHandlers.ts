import type { Context, MiddlewareHandler } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { EmailValidationUtil } from '@trading-journal/backend-services/auth';
import type { EmailValidationEnv } from '@trading-journal/backend-services/auth';
import { UserService } from '@trading-journal/backend-services/user';
import type { UserServiceEnv } from '@trading-journal/backend-services/user';
import { ServiceError } from '@trading-journal/backend-errors';

type UserContext = Context<{
  Bindings: Env;
  Variables: { AuthenticatedUserId: string; AuthenticatedUserEmailAddress: string };
}>;

class MiddlewareHandlers {
  public static userAuthentication(): MiddlewareHandler {
    return async (c: UserContext, next) => {
      try {
        const email: string = await EmailValidationUtil.getAuthenticatedUserEmail(c.req.raw, c.env as EmailValidationEnv);
        const userId: string = await UserService.resolveUser(c.env as UserServiceEnv, email);
        c.set('AuthenticatedUserId', userId);
        c.set('AuthenticatedUserEmailAddress', email);
        await next();
      } catch (error: unknown) {
        if (error instanceof ServiceError && error.getErrorCode() < 500) {
          return c.json(
            { Exception: { Type: error.getErrorType(), Message: error.getErrorMessage() } },
            error.getErrorCode() as ContentfulStatusCode,
          );
        }
        throw error;
      }
    };
  }
}

export { MiddlewareHandlers };
export type { UserContext };
