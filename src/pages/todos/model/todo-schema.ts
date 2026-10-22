import * as z from "zod";

import { insertTodoSchema, selectTodoSchema, updateTodoSchema } from "@/shared/db";

const todoIdSchema = selectTodoSchema.shape.id;
type TodoId = z.infer<typeof todoIdSchema>;

const createTodoInputSchema = insertTodoSchema.pick({ description: true, title: true });
type CreateTodoInput = z.infer<typeof createTodoInputSchema>;

const updateTodoDataSchema = updateTodoSchema;
type UpdateTodoData = z.infer<typeof updateTodoDataSchema>;

const updateTodoInputSchema = z.object({
  data: updateTodoDataSchema,
  id: todoIdSchema,
});
type UpdateTodoInput = z.infer<typeof updateTodoInputSchema>;

const deleteTodoInputSchema = z.object({ id: todoIdSchema });
type DeleteTodoInput = z.infer<typeof deleteTodoInputSchema>;

const todoFilterSchema = z.enum(["all", "active", "completed"]);
type TodoFilter = z.infer<typeof todoFilterSchema>;

const todosSearchSchema = z.object({
  filter: z.preprocess(
    (value) => (todoFilterSchema.safeParse(value).success ? value : "all"),
    todoFilterSchema.default("all"),
  ),
});
type TodosSearch = z.infer<typeof todosSearchSchema>;

export {
  createTodoInputSchema,
  deleteTodoInputSchema,
  todoFilterSchema,
  todoIdSchema,
  todosSearchSchema,
  updateTodoDataSchema,
  updateTodoInputSchema,
};
export type {
  CreateTodoInput,
  DeleteTodoInput,
  TodoFilter,
  TodoId,
  TodosSearch,
  UpdateTodoData,
  UpdateTodoInput,
};
