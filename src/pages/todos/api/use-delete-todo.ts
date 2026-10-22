import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import type { Todo } from "@/shared/db";

import type { DeleteTodoInput } from "../model/todo-schema";
import { todoKeys } from "./todo-query-options";
import { deleteTodoFn } from "./todos.functions";

type DeleteTodoMutationOptions = Omit<
  UseMutationOptions<Todo, Error, DeleteTodoInput>,
  "mutationFn"
>;

function useDeleteTodo(options?: DeleteTodoMutationOptions) {
  const queryClient = useQueryClient();
  const deleteTodo = useServerFn(deleteTodoFn);
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    ...restOptions,
    mutationFn: async (data: DeleteTodoInput) => await deleteTodo({ data }),
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: todoKeys.all });
      onSuccess?.(...args);
    },
  });
}

export { useDeleteTodo };
export type { DeleteTodoMutationOptions };
