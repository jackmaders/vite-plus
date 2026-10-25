import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";

import { todoKeys } from "./todo-query-options";

type TodoMutationOptions<TVariables, TData> = Omit<
  UseMutationOptions<TData, Error, TVariables>,
  "mutationFn"
>;

// Slice-private mutation helper that consolidates todo mutation completion policy:
// 1. Awaits cache invalidation on success so dependent queries refresh as part of completion.
// 2. Invokes and awaits any caller-provided onSuccess callback, returning its result.
// 3. Keeps mutateAsync and isPending active until both invalidation and caller callbacks resolve.
function useTodoMutation<TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  { onSuccess, ...options }: TodoMutationOptions<TVariables, TData> = {},
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: todoKeys.all });
      return await onSuccess?.(...args);
    },
  });
}

export { useTodoMutation };
export type { TodoMutationOptions };
