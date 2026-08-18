import { ServiceError } from './IServiceError';

class NotFoundError extends ServiceError {
  constructor(message: string) {
    super(message);
  }

  public getErrorType(): string {
    return 'NotFound';
  }

  public getErrorCode(): number {
    return 404;
  }

  public getErrorMessage(): string {
    return this.message;
  }
}

export { NotFoundError };
