import type { Todo } from "@/shared/db";

import type { TodoFilter } from "./todo-schema";

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

export { computeCounts, filterTodos };
