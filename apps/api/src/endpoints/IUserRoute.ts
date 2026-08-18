import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { BadRequestError, DatabaseError, DefaultInternalServerError, ServiceError } from '@trading-journal/backend-errors';
import type { ZodType } from 'zod';
import type { UserContext } from '@/middleware';

type RouteContext = UserContext;

interface ExtendedResponse<TResponse> {
  body?: TResponse;
  rawBody?: BodyInit | null;
  statusCode?: ContentfulStatusCode;
  headers?: Record<string, string>;
}

abstract class IUserRoute<TResponse extends object = object> {
  protected abstract handleRequest(c: RouteContext, userId: string, email: string): Promise<TResponse | ExtendedResponse<TResponse>>;

  public async handle(c: RouteContext): Promise<Response> {
    try {
      const userId: string = c.get('AuthenticatedUserId');
      const email: string = c.get('AuthenticatedUserEmailAddress');
      const response: TResponse | ExtendedResponse<TResponse> = await this.handleRequest(c, userId, email);
      return this.toResponse(response, c);
    } catch (error: unknown) {
      return this.toErrorResponse(error, c);
    }
  }

  protected async validateJson<T>(c: RouteContext, schema: ZodType<T>): Promise<T> {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      body = {};
    }
    const validationResult = schema.safeParse(body);
    if (!validationResult.success) {
      throw new BadRequestError(
        validationResult.error.issues.map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`).join('; '),
      );
    }
    return validationResult.data;
  }

  protected getQueryParam(c: RouteContext, name: string): string | undefined {
    return c.req.query(name)?.trim() || undefined;
  }

  protected toResponse(response: TResponse | ExtendedResponse<TResponse>, c: RouteContext): Response {
    if (
      response &&
      typeof response === 'object' &&
      ('body' in response || 'rawBody' in response || 'statusCode' in response || 'headers' in response)
    ) {
      const extendedResponse: ExtendedResponse<TResponse> = response;
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

  protected toErrorResponse(error: unknown, c: RouteContext): Response {
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

export { IUserRoute };
export type { ExtendedResponse, RouteContext };
