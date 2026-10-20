import type { Todo } from "@/shared/db";
import { Card } from "@/shared/ui/shadcn/card";

import type { TodoFilter } from "./todo-filters";
import { TodoItem, type TodoItemProps } from "./todo-item";

interface TodoListProps extends Omit<TodoItemProps, "isUpdating" | "todo"> {
  filter: TodoFilter;
  todos: Todo[];
  updatingId?: string | null;
}

const EMPTY_COUNT = 0;

function TodoList({ filter, todos, updatingId, ...actions }: TodoListProps) {
  if (todos.length === EMPTY_COUNT) {
    const empty = filter === "all" ? "No todos found" : `No ${filter} todos found`;
    return <Card className="p-6 text-center text-muted-foreground">{empty}</Card>;
  }

  return (
    <div className="flex flex-col gap-2">
      {todos.map((item) => (
        <TodoItem key={item.id} isUpdating={updatingId === item.id} todo={item} {...actions} />
      ))}
    </div>
  );
}

export { TodoList };
export type { TodoListProps };
