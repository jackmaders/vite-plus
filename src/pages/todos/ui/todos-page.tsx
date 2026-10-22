import { useQuery } from "@tanstack/react-query";

import { todosQueryOptions } from "../api/todo-query-options";
import { computeCounts, filterTodos } from "../model/todo-filters";
import { CreateTodoForm } from "./create-todo-form";
import { TodoFilters } from "./todo-filters";
import { TodoList } from "./todo-list";
import { useTodoFilter } from "./use-todo-filter";

export function TodosPage() {
  const { filter, onFilterChange } = useTodoFilter();
  const { data: todos = [] } = useQuery(todosQueryOptions());

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Todos</h1>
        <p className="text-sm text-muted-foreground">Manage your tasks and stay organized.</p>
      </header>
      <CreateTodoForm />
      <TodoFilters counts={computeCounts(todos)} filter={filter} onFilterChange={onFilterChange} />
      <TodoList todos={filterTodos(todos, filter)} />
    </div>
  );
}
