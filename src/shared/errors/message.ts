import { ApplicationError } from "./application-error";

/**
 * Returns a configured public message without exposing diagnostic overrides.
 *
 * @param {unknown} error The failure being presented to the user.
 *
 * @returns {string} A configured message or the generic fallback.
 */
function getErrorMessage(error: unknown) {
  return error instanceof ApplicationError
    ? error.toJSON().message
    : "Something went wrong. Please try again.";
}

export { getErrorMessage };
