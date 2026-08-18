import { ServiceError } from './IServiceError';

class BadRequestError extends ServiceError {
  constructor(message: string) {
    super(message);
  }

  public getErrorType(): string {
    return 'BadRequest';
  }

  public getErrorCode(): number {
    return 400;
  }

  public getErrorMessage(): string {
    return this.message;
  }
}

export { BadRequestError };
