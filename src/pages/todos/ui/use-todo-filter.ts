import { useNavigate, useSearch } from "@tanstack/react-router";

import type { TodoFilter } from "../model/todo-schema";

function useTodoFilter() {
  const search = useSearch({ strict: false });
  const navigate = useNavigate();
  const filter: TodoFilter = search.filter ?? "all";

  function onFilterChange(next: TodoFilter) {
    void navigate({ search: { filter: next }, to: "/todos" });
  }

  return { filter, onFilterChange };
}

export { useTodoFilter };
