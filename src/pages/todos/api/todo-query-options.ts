import { queryOptions } from "@tanstack/react-query";

import { getTodosFn } from "./todos.functions";

const todoKeys = {
  all: ["todos"] as const,
  detail: (id: string) => [...todoKeys.all, "detail", id] as const,
  details: () => [...todoKeys.all, "detail"] as const,
  lists: () => [...todoKeys.all, "list"] as const,
};

function todosQueryOptions() {
  return queryOptions({
    queryFn: async () => await getTodosFn(),
    queryKey: todoKeys.lists(),
  });
}

export { todoKeys, todosQueryOptions };
