import { queryOptions } from "@tanstack/react-query";

import { getTodosFn } from "./todos.functions";

export function todosQueryOptions() {
  return queryOptions({
    queryFn: getTodosFn,
    queryKey: ["todos"],
  });
}
