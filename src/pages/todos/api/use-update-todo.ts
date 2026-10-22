import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import type { Todo } from "@/shared/db";

import type { UpdateTodoInput } from "../model/todo-schema";
import { todoKeys } from "./todo-query-options";
import { updateTodoFn } from "./todos.functions";

type UpdateTodoMutationOptions = Omit<
  UseMutationOptions<Todo, Error, UpdateTodoInput>,
  "mutationFn"
>;

function useUpdateTodo(options?: UpdateTodoMutationOptions) {
  const queryClient = useQueryClient();
  const updateTodo = useServerFn(updateTodoFn);

  return useMutation({
    mutationFn: async (data: UpdateTodoInput) => await updateTodo({ data }),
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: todoKeys.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

export { useUpdateTodo };
export type { UpdateTodoMutationOptions };
