import { ApplicationError, getErrorMessage } from "@/shared/errors";

function getTodoErrorMessage(error: unknown) {
  const message = getErrorMessage(error);
  return error instanceof ApplicationError && error.code === "TODO_NOT_FOUND"
    ? `${message} Refresh the list to continue.`
    : message;
}

export { getTodoErrorMessage };
