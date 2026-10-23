import { useSuspenseQuery } from "@tanstack/react-query";

import { todosQueryOptions } from "../api/todo-query-options";
import { CreateTodoForm } from "./create-todo-form";
import { TodoList } from "./todo-list";

function TodosPage() {
  const { data: todos } = useSuspenseQuery(todosQueryOptions());

  return (
    <main className="mx-auto flex w-page flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight text-(--sea-ink)">Todos</h1>
      <section aria-labelledby="create-todo-heading" className="flex flex-col gap-3">
        <h2 id="create-todo-heading" className="text-lg font-semibold">
          Create a todo
        </h2>
        <CreateTodoForm aria-label="Create a todo" />
      </section>
      <section aria-labelledby="todo-list-heading" className="flex flex-col gap-3">
        <h2 id="todo-list-heading" className="text-lg font-semibold">
          Your todos
        </h2>
        <TodoList todos={todos} />
      </section>
    </main>
  );
}

export { TodosPage };
