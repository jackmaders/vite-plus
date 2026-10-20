import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/shared/auth/index.server";
import { createTodo, deleteTodo, getTodos, toggleTodo, updateTodo } from "@/shared/db/index.server";

import {
  createTodoInputSchema,
  deleteTodoInputSchema,
  toggleTodoInputSchema,
  updateTodoInputSchema,
} from "../model/todo-schema";

const getTodosFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const todos = await getTodos({ userId: context.session.user.id });
    return todos;
  });

const createTodoFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(createTodoInputSchema)
  .handler(async ({ context, data }) => {
    const created = await createTodo(data, { userId: context.session.user.id });
    return created;
  });

const toggleTodoFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(toggleTodoInputSchema)
  .handler(async ({ context, data }) => {
    const toggled = await toggleTodo(data.id, data.completed, {
      userId: context.session.user.id,
    });
    return toggled;
  });

const updateTodoFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(updateTodoInputSchema)
  .handler(async ({ context, data: { id, ...input } }) => {
    const updated = await updateTodo(id, input, {
      userId: context.session.user.id,
    });
    return updated;
  });

const deleteTodoFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(deleteTodoInputSchema)
  .handler(async ({ context, data }) => {
    const deleted = await deleteTodo(data.id, {
      userId: context.session.user.id,
    });
    return deleted;
  });

export { createTodoFn, deleteTodoFn, getTodosFn, toggleTodoFn, updateTodoFn };
