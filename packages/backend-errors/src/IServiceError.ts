abstract class ServiceError extends Error {
  public abstract getErrorType(): string;

  public abstract getErrorCode(): number;

  public abstract getErrorMessage(): string;
}

export { ServiceError };
