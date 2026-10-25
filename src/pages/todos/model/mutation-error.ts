import { ApplicationError } from "@/shared/errors";

function getTodoErrorMessage(error: unknown) {
  const message =
    error instanceof ApplicationError
      ? error.toJSON().message
      : "Something went wrong. Please try again.";
  return error instanceof ApplicationError && error.code === "TODO_NOT_FOUND"
    ? `${message} Refresh the list to continue.`
    : message;
}

export { getTodoErrorMessage };
