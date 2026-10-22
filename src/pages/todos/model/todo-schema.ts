import * as z from "zod";

import { insertTodoSchema, selectTodoSchema, updateTodoSchema } from "@/shared/db";

const createTodoInputSchema = insertTodoSchema.pick({ description: true, title: true });
type CreateTodoInput = z.infer<typeof createTodoInputSchema>;

const updateTodoDataSchema = updateTodoSchema;
type UpdateTodoData = z.infer<typeof updateTodoDataSchema>;

const updateTodoInputSchema = z.object({
  data: updateTodoDataSchema,
  id: selectTodoSchema.shape.id,
});
type UpdateTodoInput = z.infer<typeof updateTodoInputSchema>;

const deleteTodoInputSchema = selectTodoSchema.pick({ id: true });
type DeleteTodoInput = z.infer<typeof deleteTodoInputSchema>;

const todoFilterSchema = z.enum(["all", "active", "completed"]);
type TodoFilter = z.infer<typeof todoFilterSchema>;

const todosSearchSchema = z.object({
  filter: z.preprocess((value) => {
    if (value === "active" || value === "completed") {
      return value;
    }
    return "all";
  }, todoFilterSchema.default("all")),
});
type TodosSearch = z.infer<typeof todosSearchSchema>;

export {
  createTodoInputSchema,
  deleteTodoInputSchema,
  todoFilterSchema,
  todosSearchSchema,
  updateTodoDataSchema,
  updateTodoInputSchema,
};
export type {
  CreateTodoInput,
  DeleteTodoInput,
  TodoFilter,
  TodosSearch,
  UpdateTodoData,
  UpdateTodoInput,
};
