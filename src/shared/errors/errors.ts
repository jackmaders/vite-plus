// eslint-disable-next-line max-classes-per-file -- Keep the closed error taxonomy together.
interface AppErrorOptions extends ErrorOptions {
  referenceId?: string | undefined;
}

/** Messages on application errors are deliberately safe for public display. */
abstract class AppError extends Error {
  public override name = "AppError";
  public abstract readonly kind: ErrorKind;
  public get status() {
    return errorStatuses[this.kind];
  }
  public readonly code: string;
  public readonly referenceId: string | undefined;

  public constructor(code: string, message: string, options: AppErrorOptions = {}) {
    super(message, options);
    this.code = code;
    this.referenceId = options.referenceId;
  }
}

class ValidationError extends AppError {
  public override name = "ValidationError";
  public readonly kind = "validation";
}

class AuthenticationError extends AppError {
  public override name = "AuthenticationError";
  public readonly kind = "authentication";
}

class AuthorizationError extends AppError {
  public override name = "AuthorizationError";
  public readonly kind = "authorization";
}

class NotFoundError extends AppError {
  public override name = "NotFoundError";
  public readonly kind = "not_found";
}

class ConflictError extends AppError {
  public override name = "ConflictError";
  public readonly kind = "conflict";
}

class DependencyError extends AppError {
  public override name = "DependencyError";
  public readonly kind = "dependency";
}

class ClientOperationError extends AppError {
  public override name = "ClientOperationError";
  public readonly kind = "client_operation";
}

class UnexpectedError extends AppError {
  public override name = "UnexpectedError";
  public readonly kind = "unexpected";
}

const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";

const errorClasses = {
  authentication: AuthenticationError,
  authorization: AuthorizationError,
  client_operation: ClientOperationError,
  conflict: ConflictError,
  dependency: DependencyError,
  not_found: NotFoundError,
  unexpected: UnexpectedError,
  validation: ValidationError,
};

type ErrorKind = keyof typeof errorClasses;

const errorStatuses = {
  authentication: 401,
  authorization: 403,
  client_operation: 500,
  conflict: 409,
  dependency: 503,
  not_found: 404,
  unexpected: 500,
  validation: 400,
};

/** Ordinary client operations return this union; Query keeps its native result. */
type Result<TData, TError extends Error = AppError> =
  | { status: "success"; data: TData; error?: never }
  | { status: "error"; data?: never; error: TError };

function getErrorMessage(error: unknown): string {
  if (!(error instanceof AppError)) {
    return GENERIC_ERROR_MESSAGE;
  }
  if ((error.referenceId?.length ?? 0) === 0) {
    return error.message;
  }
  return `${error.message} Reference: ${error.referenceId}`;
}

export {
  GENERIC_ERROR_MESSAGE,
  AppError,
  AuthenticationError,
  AuthorizationError,
  ClientOperationError,
  ConflictError,
  DependencyError,
  NotFoundError,
  UnexpectedError,
  ValidationError,
  errorClasses,
  getErrorMessage,
  type AppErrorOptions,
  type ErrorKind,
  type Result,
};
