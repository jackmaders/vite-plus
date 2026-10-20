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
  toggleTodoInputSchema,
  updateTodoInputSchema,
  type TodoFilter,
  type TodosSearch,
};
