import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";

import type { Todo } from "@/shared/db";

import { todosQueryOptions } from "../api/todo-query-options";
import type { TodoFilter } from "../model/todo-schema";
import { CreateTodoForm } from "./create-todo-form";
import { TodoFilters } from "./todo-filters";
import { TodoList } from "./todo-list";

function computeCounts(todos: Todo[]): Record<TodoFilter, number> {
  const active = todos.filter((todo) => !todo.completed).length;
  return { active, all: todos.length, completed: todos.length - active };
}

function filterTodos(todos: Todo[], filter: TodoFilter): Todo[] {
  if (filter === "all") {
    return todos;
  }
  return todos.filter((todo) => (filter === "completed" ? todo.completed : !todo.completed));
}

function useTodoFilter() {
  const search = useSearch({ strict: false });
  const navigate = useNavigate();
  const filter: TodoFilter = search.filter ?? "all";

  function onFilterChange(next: TodoFilter) {
    void navigate({ search: { filter: next }, to: "/todos" });
  }

  return { filter, onFilterChange };
}

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
