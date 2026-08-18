import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { DatabaseError, DefaultInternalServerError, ServiceError } from '@trading-journal/backend-errors';

type PublicRouteContext = Context<{
  Bindings: Env;
  Variables: { AuthenticatedUserId: string; AuthenticatedUserEmailAddress: string };
}>;

interface ExtendedPublicResponse<TResponse> {
  body?: TResponse;
  rawBody?: BodyInit | null;
  statusCode?: ContentfulStatusCode;
  headers?: Record<string, string>;
}

abstract class IBasePublicRoute<TResponse extends object = object> {
  protected abstract handleRequest(c: PublicRouteContext): Promise<TResponse | ExtendedPublicResponse<TResponse>>;

  public async handle(c: PublicRouteContext): Promise<Response> {
    try {
      const response: TResponse | ExtendedPublicResponse<TResponse> = await this.handleRequest(c);
      return this.toResponse(response, c);
    } catch (error: unknown) {
      return this.toErrorResponse(error, c);
    }
  }

  protected toResponse(response: TResponse | ExtendedPublicResponse<TResponse>, c: PublicRouteContext): Response {
    if (
      response &&
      typeof response === 'object' &&
      ('body' in response || 'rawBody' in response || 'statusCode' in response || 'headers' in response)
    ) {
      const extendedResponse: ExtendedPublicResponse<TResponse> = response;
      const statusCode: ContentfulStatusCode = extendedResponse.statusCode ?? 200;
      for (const [key, value] of Object.entries(extendedResponse.headers ?? {})) {
        c.header(key, value);
      }
      c.status(statusCode);
      if (statusCode >= 300 && statusCode < 400) {
        return c.body(null);
      }
      if ('rawBody' in extendedResponse) {
        return c.body((extendedResponse.rawBody ?? null) as never);
      }
      return c.json(extendedResponse.body);
    }
    return c.json(response);
  }

  protected toErrorResponse(error: unknown, c: PublicRouteContext): Response {
    if (error instanceof ServiceError && error.getErrorCode() < 500) {
      return c.json(
        { Exception: { Type: error.getErrorType(), Message: error.getErrorMessage() } },
        error.getErrorCode() as ContentfulStatusCode,
      );
    }
    if (error instanceof DatabaseError) {
      console.error('Caught database error during execution:', error);
      return c.json(
        { Exception: { Type: error.getErrorType(), Message: error.getErrorMessage() } },
        error.getErrorCode() as ContentfulStatusCode,
      );
    }
    console.error('Caught service error during execution:', error);
    return c.json(
      { Exception: { Type: new DefaultInternalServerError().getErrorType(), Message: new DefaultInternalServerError().getErrorMessage() } },
      new DefaultInternalServerError().getErrorCode() as ContentfulStatusCode,
    );
  }
}

export { IBasePublicRoute };
export type { ExtendedPublicResponse, PublicRouteContext };
