import { z } from "zod";

import { insertTodoSchema } from "@/shared/db";

const MIN_LENGTH = 1;

const createTodoInputSchema = insertTodoSchema.pick({ description: true, title: true }).extend({
  title: z.string().trim().min(MIN_LENGTH, "Title is required"),
});

const toggleTodoInputSchema = z.object({
  completed: z.boolean(),
  id: z.string().min(MIN_LENGTH),
});

const updateTodoInputSchema = z.object({
  description: z.string().nullable().optional(),
  id: z.string().min(MIN_LENGTH),
  title: z.string().trim().min(MIN_LENGTH).optional(),
});

const deleteTodoInputSchema = z.object({ id: z.string().min(MIN_LENGTH) });

export {
  createTodoInputSchema,
  deleteTodoInputSchema,
  toggleTodoInputSchema,
  updateTodoInputSchema,
};
