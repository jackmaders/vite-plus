import { createSerializationAdapter } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";

import { ApplicationError } from "@/shared/errors";
import { reportServerError } from "@/shared/errors/index.server";

interface PublicError {
  code: string;
  message: string;
  status: number;
  referenceId: string | undefined;
}

/** Allowlist public fields; causes and server stack traces never cross RPC/SSR. */
const errorSerializationAdapter = createSerializationAdapter<Error, PublicError>({
  fromSerializable: ({ code, message, status, referenceId }) =>
    new ApplicationError(code, message, { referenceId, status }),
  key: "ApplicationError",
  test: (value): value is Error => value instanceof Error,
  toSerializable: (cause) => {
    const error = prepareError(cause);
    return {
      code: error.code,
      message: error.message,
      referenceId: error.referenceId,
      status: error.status,
    };
  },
});

// Also sanitizes errors consumed by Router before request middleware can see them.
const prepareError = createIsomorphicFn()
  // eslint-disable-next-line promise/prefer-await-to-callbacks -- Native synchronous environment selection.
  .server((error: Error) => reportServerError(error))
  // eslint-disable-next-line promise/prefer-await-to-callbacks -- Native synchronous environment selection.
  .client((error: Error) => ApplicationError.from(error));

export { errorSerializationAdapter };
