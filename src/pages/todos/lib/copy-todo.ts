import type { Todo } from "@/shared/db";
import { ApplicationError, type Result } from "@/shared/errors";

/**
 * Copy a title, returning local UI failures as explicit results.
 *
 * @param {Pick<Todo, "title">} todo - The title to copy.
 *
 * @returns {Promise<Result<string>>} The copied title or a safe error.
 */
async function copyTodo(todo: Pick<Todo, "title">): Promise<Result<string>> {
  try {
    await navigator.clipboard.writeText(todo.title);
    return { data: todo.title, status: "success" };
  } catch (error) {
    return {
      error: new ApplicationError(
        "CLIPBOARD_WRITE_FAILED",
        "Unable to copy. Please copy the title manually.",
        { cause: error },
      ),
      status: "error",
    };
  }
}

export { copyTodo };
