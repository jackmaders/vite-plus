import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/shared/auth";

import {
  createTodoInputSchema,
  deleteTodoInputSchema,
  updateTodoInputSchema,
} from "../model/todo-schema";
import { createTodo, deleteTodo, getTodos, updateTodo } from "./todos-operations";

const getTodosFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => await getTodos({ userId: context.session.user.id }));

const createTodoFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(createTodoInputSchema)
  .handler(
    async ({ context, data }) => await createTodo(data, { userId: context.session.user.id }),
  );

const updateTodoFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(updateTodoInputSchema)
  .handler(
    async ({ context, data }) =>
      await updateTodo(data.id, data.data, { userId: context.session.user.id }),
  );

const deleteTodoFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(deleteTodoInputSchema)
  .handler(
    async ({ context, data }) => await deleteTodo(data.id, { userId: context.session.user.id }),
  );

export { createTodoFn, deleteTodoFn, getTodosFn, updateTodoFn };
