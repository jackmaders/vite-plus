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
  .handler(async ({ context }) => await getTodos({ userId: context.session.user.id }));

const createTodoFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(createTodoInputSchema)
  .handler(
    async ({ context, data }) => await createTodo(data, { userId: context.session.user.id }),
  );

const toggleTodoFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(toggleTodoInputSchema)
  .handler(
    async ({ context, data }) =>
      await toggleTodo(data.id, data.completed, {
        userId: context.session.user.id,
      }),
  );
const updateTodoFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(updateTodoInputSchema)
  .handler(
    async ({ context, data: { id, ...input } }) =>
      await updateTodo(id, input, {
        userId: context.session.user.id,
      }),
  );

const deleteTodoFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(deleteTodoInputSchema)
  .handler(
    async ({ context, data }) =>
      await deleteTodo(data.id, {
        userId: context.session.user.id,
      }),
  );

export { createTodoFn, deleteTodoFn, getTodosFn, toggleTodoFn, updateTodoFn };
