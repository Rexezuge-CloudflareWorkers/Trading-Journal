import { ServiceError } from './IServiceError';

class ConflictError extends ServiceError {
  constructor(message: string) {
    super(message);
  }

  public getErrorType(): string {
    return 'Conflict';
  }

  public getErrorCode(): number {
    return 409;
  }

  public getErrorMessage(): string {
    return this.message;
  }
}

export { ConflictError };
