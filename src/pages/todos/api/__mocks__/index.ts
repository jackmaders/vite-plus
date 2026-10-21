import { vi } from "vite-plus/test";

export { todoKeys, todosQueryOptions } from "../todo-query-options";
export {
  createTodoFn,
  deleteTodoFn,
  getTodosFn,
  updateTodoFn,
} from "../../__mocks__/todos.functions";

const mockMutate = vi.fn<() => void>();
const mockMutateAsync = vi.fn<() => Promise<unknown>>().mockResolvedValue(null);

const useCreateTodo = vi.fn<
  () => {
    isError: boolean;
    isPending: boolean;
    isSuccess: boolean;
    mutate: typeof mockMutate;
    mutateAsync: typeof mockMutateAsync;
  }
>(() => ({
  isError: false,
  isPending: false,
  isSuccess: false,
  mutate: mockMutate,
  mutateAsync: mockMutateAsync,
}));

export { mockMutate, mockMutateAsync, useCreateTodo };
