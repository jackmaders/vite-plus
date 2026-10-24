import { createSerializationAdapter } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";

import {
  AppError,
  GENERIC_ERROR_MESSAGE,
  UnexpectedError,
  errorClasses,
  type ErrorKind,
} from "@/shared/errors";
import { reportServerError } from "@/shared/errors/index.server";

interface PublicError {
  kind: ErrorKind;
  code: string;
  message: string;
  referenceId: string | undefined;
}

/** Allowlist public fields; causes and server stack traces never cross RPC/SSR. */
const errorSerializationAdapter = createSerializationAdapter<Error, PublicError>({
  fromSerializable: ({ kind, code, message, referenceId }) =>
    new errorClasses[kind](code, message, { referenceId }),
  key: "ApplicationError",
  test: (value): value is Error => value instanceof Error,
  toSerializable: (cause) => {
    const error = prepareError(cause);
    return {
      code: error.code,
      kind: error.kind,
      message: error.message,
      referenceId: error.referenceId,
    };
  },
});

// Also sanitizes errors consumed by Router before request middleware can see them.
const prepareError = createIsomorphicFn()
  // eslint-disable-next-line promise/prefer-await-to-callbacks -- Native synchronous environment selection.
  .server((error: Error) => reportServerError(error))
  // eslint-disable-next-line promise/prefer-await-to-callbacks -- Native synchronous environment selection.
  .client((error: Error) =>
    error instanceof AppError ? error : new UnexpectedError("UNEXPECTED", GENERIC_ERROR_MESSAGE),
  );

export { errorSerializationAdapter };
