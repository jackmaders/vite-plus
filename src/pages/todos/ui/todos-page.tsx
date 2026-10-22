import { useFilteredTodos } from "../model/use-filtered-todos";
import { CreateTodoForm } from "./create-todo-form";
import { TodoList } from "./todo-list";
import { TodoStatusTabs } from "./todo-status-tabs";

export function TodosPage() {
  const { counts, onStatusChange, status, todos } = useFilteredTodos();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Todos</h1>
        <p className="text-sm text-muted-foreground">Manage your tasks and stay organized.</p>
      </header>
      <CreateTodoForm />
      <TodoStatusTabs counts={counts} onStatusChange={onStatusChange} status={status} />
      <TodoList todos={todos} />
    </div>
  );
}
