import { ServiceError } from './IServiceError';

class InternalServerError extends ServiceError {
  public getErrorType(): string {
    return 'InternalServerError';
  }

  public getErrorCode(): number {
    return 500;
  }

  public getErrorMessage(): string {
    return 'An internal server error occurred.';
  }
}

class DefaultInternalServerError extends ServiceError {
  public getErrorType(): string {
    return 'InternalServerError';
  }

  public getErrorCode(): number {
    return 500;
  }

  public getErrorMessage(): string {
    return 'An internal server error occurred.';
  }
}

export { DefaultInternalServerError, InternalServerError };
