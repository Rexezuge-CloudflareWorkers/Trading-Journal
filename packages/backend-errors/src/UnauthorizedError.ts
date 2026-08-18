import { ServiceError } from './IServiceError';

class UnauthorizedError extends ServiceError {
  constructor(message: string) {
    super(message);
  }

  public getErrorType(): string {
    return 'Unauthorized';
  }

  public getErrorCode(): number {
    return 401;
  }

  public getErrorMessage(): string {
    return this.message;
  }
}

export { UnauthorizedError };
