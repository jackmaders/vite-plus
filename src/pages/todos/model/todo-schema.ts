import { insertTodoSchema, selectTodoSchema, updateTodoSchema } from "@/shared/db";

const createTodoInputSchema = insertTodoSchema.pick({ description: true, title: true });

const toggleTodoInputSchema = selectTodoSchema.pick({
  completed: true,
  id: true,
});

const updateTodoInputSchema = updateTodoSchema.pick({ description: true, title: true }).extend({
  id: selectTodoSchema.shape.id,
});

const deleteTodoInputSchema = selectTodoSchema.pick({ id: true });

export {
  createTodoInputSchema,
  deleteTodoInputSchema,
  toggleTodoInputSchema,
  updateTodoInputSchema,
};
