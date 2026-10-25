import { ApplicationError } from "./application-error";

function getErrorMessage(error: unknown): string {
  if (error instanceof ApplicationError) {
    return error.toJSON().message;
  }

  return "Something went wrong. Please try again.";
}

export { getErrorMessage };
