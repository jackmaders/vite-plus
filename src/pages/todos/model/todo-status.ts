import type { Todo } from "@/shared/db";

import type { TodoCompletionStatus } from "./todo-schema";

function computeStatusCounts(todos: Todo[]): Record<TodoCompletionStatus, number> {
  const active = todos.filter((todo) => !todo.completed).length;
  return { active, all: todos.length, completed: todos.length - active };
}

function filterTodosByStatus(todos: Todo[], status: TodoCompletionStatus): Todo[] {
  if (status === "all") {
    return todos;
  }
  return todos.filter((todo) => (status === "completed" ? todo.completed : !todo.completed));
}

export { computeStatusCounts, filterTodosByStatus };
