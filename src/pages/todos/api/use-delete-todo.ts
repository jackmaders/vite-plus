import { useServerFn } from "@tanstack/react-start";

import type { Todo } from "@/shared/db";

import type { DeleteTodoInput } from "../model/todo-schema";
import { deleteTodoFn } from "./todos.functions";
import { useTodoMutation, type TodoMutationOptions } from "./use-todo-mutation";

type DeleteTodoMutationOptions = TodoMutationOptions<DeleteTodoInput, Todo>;

function useDeleteTodo(options: DeleteTodoMutationOptions = {}) {
  const deleteTodo = useServerFn(deleteTodoFn);

  return useTodoMutation(async (data: DeleteTodoInput) => await deleteTodo({ data }), options);
}

export { useDeleteTodo };
export type { DeleteTodoMutationOptions };
