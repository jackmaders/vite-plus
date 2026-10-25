import { useServerFn } from "@tanstack/react-start";

import type { Todo } from "@/shared/db";

import type { CreateTodoInput } from "../model/todo-schema";
import { createTodoFn } from "./todos.functions";
import { useTodoMutation, type TodoMutationOptions } from "./use-todo-mutation";

type CreateTodoMutationOptions = TodoMutationOptions<CreateTodoInput, Todo>;

function useCreateTodo(options: CreateTodoMutationOptions = {}) {
  const createTodo = useServerFn(createTodoFn);

  return useTodoMutation(async (data: CreateTodoInput) => await createTodo({ data }), options);
}

export { useCreateTodo };
export type { CreateTodoMutationOptions };
