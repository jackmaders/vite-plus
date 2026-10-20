import { vi } from "vite-plus/test";

const getTodosFn = vi.fn<() => Promise<unknown[]>>().mockResolvedValue([]);
const createTodoFn = vi.fn<() => Promise<unknown>>().mockResolvedValue(null);
const toggleTodoFn = vi.fn<() => Promise<unknown>>().mockResolvedValue(null);
const updateTodoFn = vi.fn<() => Promise<unknown>>().mockResolvedValue(null);
const deleteTodoFn = vi.fn<() => Promise<unknown>>().mockResolvedValue(null);

export { createTodoFn, deleteTodoFn, getTodosFn, toggleTodoFn, updateTodoFn };
