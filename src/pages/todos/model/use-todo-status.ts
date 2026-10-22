import { useNavigate, useSearch } from "@tanstack/react-router";

import type { TodoCompletionStatus } from "./todo-schema";

function useTodoStatus() {
  const search = useSearch({ strict: false });
  const navigate = useNavigate();
  const status: TodoCompletionStatus = search.status ?? "all";

  function onStatusChange(next: TodoCompletionStatus) {
    void navigate({ search: { status: next }, to: "/todos" });
  }

  return { onStatusChange, status };
}

export { useTodoStatus };
