import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";

import type { Todo } from "@/shared/db";

import { createTodoFn, deleteTodoFn, toggleTodoFn, todosQueryOptions, updateTodoFn } from "../api";
import { TodoFilters, type TodoFilter } from "./todo-filters";
import { TodoForm } from "./todo-form";
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

function useTodoMutations(setUpdatingId: (id: string) => void) {
  const queryClient = useQueryClient();

  async function invalidate() {
    setUpdatingId("");
    await queryClient.invalidateQueries({ queryKey: ["todos"] });
  }

  const createMutation = useMutation({
    mutationFn: async (data: { description?: string | null; title: string }) => {
      await createTodoFn({ data });
    },
    onSettled: invalidate,
  });

  const toggleMutation = useMutation({
    mutationFn: async (data: { completed: boolean; id: string }) => {
      setUpdatingId(data.id);
      await toggleTodoFn({ data });
    },
    onSettled: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: { description?: string | null; title?: string };
    }) => {
      setUpdatingId(id);
      await updateTodoFn({ data: { id, ...input } });
    },
    onSettled: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      setUpdatingId(id);
      await deleteTodoFn({ data: { id } });
    },
    onSettled: invalidate,
  });

  return { createMutation, deleteMutation, toggleMutation, updateMutation };
}

export function TodosPage() {
  const [updatingId, setUpdatingId] = useState("");
  const { filter, onFilterChange } = useTodoFilter();
  const { data: todos = [] } = useQuery(todosQueryOptions());
  const mutations = useTodoMutations(setUpdatingId);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Todos</h1>
        <p className="text-sm text-muted-foreground">Manage your tasks and stay organized.</p>
      </header>
      <TodoForm
        isCreating={mutations.createMutation.isPending}
        onCreate={(input) => {
          mutations.createMutation.mutate(input);
        }}
      />
      <TodoFilters counts={computeCounts(todos)} filter={filter} onFilterChange={onFilterChange} />
      <TodoList
        filter={filter}
        onDelete={(id) => {
          mutations.deleteMutation.mutate(id);
        }}
        onToggle={(id, completed) => {
          mutations.toggleMutation.mutate({ completed, id });
        }}
        onUpdate={(id, input) => {
          mutations.updateMutation.mutate({ id, input });
        }}
        todos={filterTodos(todos, filter)}
        updatingId={updatingId}
      />
    </div>
  );
}
