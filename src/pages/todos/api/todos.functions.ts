import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/shared/auth/index.server";
import {
  createTodo,
  deleteTodo,
  getDb,
  getTodos,
  toggleTodo,
  updateTodo,
} from "@/shared/db/index.server";

import {
  createTodoInputSchema,
  deleteTodoInputSchema,
  toggleTodoInputSchema,
  updateTodoInputSchema,
} from "../model/todo-schema";

const getTodosFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const todos = await getTodos(getDb(), context.session.user.id);
    return todos;
  });

const createTodoFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(createTodoInputSchema)
  .handler(async ({ context, data }) => {
    const created = await createTodo(getDb(), context.session.user.id, data);
    return created;
  });

const toggleTodoFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(toggleTodoInputSchema)
  .handler(async ({ context, data }) => {
    const toggled = await toggleTodo(getDb(), context.session.user.id, data.id, data.completed);
    return toggled;
  });

const updateTodoFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(updateTodoInputSchema)
  .handler(async ({ context, data: { id, ...input } }) => {
    const updated = await updateTodo(getDb(), context.session.user.id, id, input);
    return updated;
  });

const deleteTodoFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(deleteTodoInputSchema)
  .handler(async ({ context, data }) => {
    const deleted = await deleteTodo(getDb(), context.session.user.id, data.id);
    return deleted;
  });

export { createTodoFn, deleteTodoFn, getTodosFn, toggleTodoFn, updateTodoFn };
