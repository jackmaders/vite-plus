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

export {
  createTodoInputSchema,
  deleteTodoInputSchema,
  updateTodoDataSchema,
  updateTodoInputSchema,
};
export type { CreateTodoInput, DeleteTodoInput, UpdateTodoData, UpdateTodoInput };
