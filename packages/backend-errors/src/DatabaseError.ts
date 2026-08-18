import { ServiceError } from './IServiceError';

class DatabaseError extends ServiceError {
  constructor(message: string) {
    super(message);
  }

  public getErrorType(): string {
    return 'DatabaseError';
  }

  public getErrorCode(): number {
    return 500;
  }

  public getErrorMessage(): string {
    return this.message;
  }
}

export { DatabaseError };
