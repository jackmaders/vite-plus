import { isNotFound, isRedirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";

import { reportServerError } from "@/shared/errors/index.server";

const functionErrorMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (isRedirect(error) || isNotFound(error) || error instanceof Response) {
      throw error;
    }
    throw reportServerError(error);
  }
});

const requestErrorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (isRedirect(error) || isNotFound(error) || error instanceof Response) {
      throw error;
    }
    throw reportServerError(error);
  }
});

export { functionErrorMiddleware, requestErrorMiddleware };
