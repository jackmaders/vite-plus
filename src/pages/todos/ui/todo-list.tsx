import { cn } from "cn";
import type { ComponentProps } from "react";

import type { Todo } from "@/shared/db";

import { TodoItem } from "./todo-item";

interface TodoListProps extends ComponentProps<"div"> {
  todos: Todo[];
}

function TodoList({ todos, className, ...props }: TodoListProps) {
  if (todos.length === 0) {
    return <p>No todos found</p>;
  }

  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      {todos.map((item) => (
        <TodoItem key={item.id} todo={item} />
      ))}
    </div>
  );
}

export { TodoList };
export type { TodoListProps };
