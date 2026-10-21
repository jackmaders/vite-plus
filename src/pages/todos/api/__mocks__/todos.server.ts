import { vi } from "vite-plus/test";

const getTodos = vi.fn<() => Promise<unknown[]>>().mockResolvedValue([]);
const createTodo = vi.fn<() => Promise<unknown>>().mockResolvedValue(null);
const updateTodo = vi.fn<() => Promise<unknown>>().mockResolvedValue(null);
const deleteTodo = vi.fn<() => Promise<unknown>>().mockResolvedValue(null);

export { createTodo, deleteTodo, getTodos, updateTodo };
