import type * as z from "zod";

import { insertTodoSchema, selectTodoSchema, updateTodoSchema } from "@/shared/db";

const createTodoInputSchema = insertTodoSchema.pick({ description: true, title: true });
type CreateTodoInput = z.infer<typeof createTodoInputSchema>;

const updateTodoInputSchema = updateTodoSchema;
type UpdateTodoInput = z.infer<typeof updateTodoInputSchema>;

const deleteTodoInputSchema = selectTodoSchema.pick({ id: true });
type DeleteTodoInput = z.infer<typeof deleteTodoInputSchema>;

export { createTodoInputSchema, deleteTodoInputSchema, updateTodoInputSchema };
export type { CreateTodoInput, DeleteTodoInput, UpdateTodoInput };
