import { useServerFn } from "@tanstack/react-start";

import type { Todo } from "@/shared/db";

import type { UpdateTodoInput } from "../model/todo-schema";
import { updateTodoFn } from "./todos.functions";
import { useTodoMutation, type TodoMutationOptions } from "./use-todo-mutation";

type UpdateTodoMutationOptions = TodoMutationOptions<UpdateTodoInput, Todo>;

function useUpdateTodo(options: UpdateTodoMutationOptions = {}) {
  const updateTodo = useServerFn(updateTodoFn);

  return useTodoMutation(async (data: UpdateTodoInput) => await updateTodo({ data }), options);
}

export { useUpdateTodo };
export type { UpdateTodoMutationOptions };
