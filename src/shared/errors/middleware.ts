import { createMiddleware } from "@tanstack/react-start";

import { HttpStatusCodes } from "../lib/http-status-codes";
import { ApplicationError } from "./application-error";
import { logger } from "./logger";

const errorMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  try {
    return await next();
  } catch (error: unknown) {
    if (error instanceof ApplicationError) {
      const isRoutineError = error.statusCode < HttpStatusCodes.INTERNAL_SERVER_ERROR;

      if (isRoutineError) {
        logger.warn(`[${error.code}] ${error.message}`, error.details);
      } else {
        logger.error(`[${error.code}] ${error.message}`, error);
      }

      throw error;
    }

    logger.error("Unhandled INTERNAL_SERVER_ERROR:", error);
    throw new ApplicationError("INTERNAL_SERVER_ERROR", { cause: error });
  }
});

export { errorMiddleware };
