import * as z from "zod";

import { insertTodoSchema, selectTodoSchema, updateTodoSchema } from "@/shared/db";

const ID_MIN_LENGTH = 1;

/**
 * Validates todo ID parameter for update and delete operations. Derives base string validation from
 * selectTodoSchema.shape.id while enforcing minimum length.
 */
const todoIdSchema = selectTodoSchema.shape.id.trim().min(ID_MIN_LENGTH);

/**
 * Input schema for creating a todo. Drizzle insertTodoSchema produces validated and normalized
 * (trimmed) values. Note: TanStack Form validation runs this schema on client input but does NOT
 * transform form values; TanStack Start's Zod validator on the server function produces parsed,
 * normalized server input.
 */
const createTodoInputSchema = insertTodoSchema.pick({ description: true, title: true });
type CreateTodoInput = z.infer<typeof createTodoInputSchema>;

/**
 * Input schema for update payload data. Explicitly allowlists only client-writable fields:
 * completed, description, title. Server-owned identity, ownership, and timestamps are excluded.
 */
const updateTodoDataSchema = updateTodoSchema;
type UpdateTodoData = z.infer<typeof updateTodoDataSchema>;

const updateTodoInputSchema = z.object({
  data: updateTodoDataSchema,
  id: todoIdSchema,
});
type UpdateTodoInput = z.infer<typeof updateTodoInputSchema>;

const deleteTodoInputSchema = z.object({
  id: todoIdSchema,
});
type DeleteTodoInput = z.infer<typeof deleteTodoInputSchema>;

export {
  createTodoInputSchema,
  deleteTodoInputSchema,
  todoIdSchema,
  updateTodoDataSchema,
  updateTodoInputSchema,
};
export type { CreateTodoInput, DeleteTodoInput, UpdateTodoData, UpdateTodoInput };
