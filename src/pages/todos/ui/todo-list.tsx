import type { Todo } from "@/shared/db";

import type { TodoFilter } from "./todo-filters";
import { TodoItem, type TodoItemProps } from "./todo-item";

interface TodoListProps extends Omit<TodoItemProps, "isUpdating" | "todo"> {
  filter: TodoFilter;
  todos: Todo[];
  updatingId?: string | null;
}

const EMPTY_COUNT = 0;

function TodoList({ todos, ...actions }: TodoListProps) {
  if (todos.length === EMPTY_COUNT) {
    return <p>No todos found</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {todos.map((item) => (
        <TodoItem key={item.id} todo={item} {...actions} />
      ))}
    </div>
  );
}

export { TodoList };
export type { TodoListProps };
