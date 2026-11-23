import { isNotFound, isRedirect } from "@tanstack/react-router";

import { HttpStatusCodes } from "../lib/http-status-codes";
import { ApplicationError } from "./application-error";
import { logger } from "./logger";

async function withServerErrorHandling<TResult>(next: () => Promise<TResult>): Promise<TResult> {
  try {
    return await next();
  } catch (error: unknown) {
    if (isRedirect(error) || isNotFound(error)) {
      throw error;
    }

    if (error instanceof ApplicationError) {
      handleApplicationError(error);

      throw error;
    }

    logger.error("Unhandled INTERNAL_SERVER_ERROR:", error);
    throw new ApplicationError("INTERNAL_SERVER_ERROR", { cause: error });
  }
}

function handleApplicationError(error: ApplicationError) {
  if (error.statusCode < HttpStatusCodes.INTERNAL_SERVER_ERROR) {
    logger.warn(`[${error.code}] ${error.message}`, error.details);
  } else {
    logger.error(`[${error.code}] ${error.message}`, error);
  }
}

export { withServerErrorHandling };
