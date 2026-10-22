import { useQuery } from "@tanstack/react-query";

import { todosQueryOptions } from "../api/todo-query-options";
import { computeStatusCounts, filterTodosByStatus } from "../model/todo-status";
import { CreateTodoForm } from "./create-todo-form";
import { TodoList } from "./todo-list";
import { TodoStatusTabs } from "./todo-status-tabs";
import { useTodoStatus } from "./use-todo-status";

export function TodosPage() {
  const { onStatusChange, status } = useTodoStatus();
  const { data: todos = [] } = useQuery(todosQueryOptions());

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Todos</h1>
        <p className="text-sm text-muted-foreground">Manage your tasks and stay organized.</p>
      </header>
      <CreateTodoForm />
      <TodoStatusTabs
        counts={computeStatusCounts(todos)}
        onStatusChange={onStatusChange}
        status={status}
      />
      <TodoList todos={filterTodosByStatus(todos, status)} />
    </div>
  );
}
