import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import type { Todo } from "@/shared/db";

import { todosQueryOptions } from "../api/todo-query-options";
import { computeStatusCounts, filterTodosByStatus } from "./todo-status";
import { useTodoStatus } from "./use-todo-status";

const EMPTY_TODOS: Todo[] = [];

function useFilteredTodos() {
  const { onStatusChange, status } = useTodoStatus();
  const query = useQuery(todosQueryOptions());
  const allTodos = query.data ?? EMPTY_TODOS;

  const counts = useMemo(() => computeStatusCounts(allTodos), [allTodos]);
  const todos = useMemo(() => filterTodosByStatus(allTodos, status), [allTodos, status]);

  return {
    allTodos,
    counts,
    onStatusChange,
    query,
    status,
    todos,
  };
}

export { useFilteredTodos };
