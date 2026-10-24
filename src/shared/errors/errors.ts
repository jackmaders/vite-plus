interface ApplicationErrorOptions extends ErrorOptions {
  referenceId?: string | undefined;
  status?: number;
}

const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";
const DEFAULT_ERROR_STATUS = 500;

/** A failure with a stable code and a message deliberately safe for public display. */
class ApplicationError extends Error {
  public override name = "ApplicationError";
  public readonly code: string;
  public readonly referenceId: string | undefined;
  public readonly status: number;

  /** Keep internal details in options.cause; the message is public. */
  public constructor(code: string, clientMessage: string, options: ApplicationErrorOptions = {}) {
    super(clientMessage, options);
    this.code = code;
    this.referenceId = options.referenceId;
    this.status = options.status ?? DEFAULT_ERROR_STATUS;
  }

  /**
   * Normalize unknown failures without exposing their original messages.
   *
   * @param {unknown} cause - An application error or an unclassified failure.
   *
   * @returns {ApplicationError} The existing application error or a safe fallback retaining the
   *   cause.
   */
  public static from(cause: unknown): ApplicationError {
    if (cause instanceof ApplicationError) {
      return cause;
    }
    return new ApplicationError("UNEXPECTED", GENERIC_ERROR_MESSAGE, { cause });
  }

  /**
   * User-facing text, including a reference when the failure has been reported.
   *
   * @returns {string} The public message with an optional reference.
   */
  public get clientMessage(): string {
    if ((this.referenceId?.length ?? 0) === 0) {
      return this.message;
    }
    return `${this.message} Reference: ${this.referenceId}`;
  }
}

export { ApplicationError, GENERIC_ERROR_MESSAGE, type ApplicationErrorOptions };
