import { vi } from "vite-plus/test";

const createServerFn = vi.fn<() => { handler: (fn: (...args: unknown[]) => unknown) => unknown }>(
  () => ({
    handler: (fn: (...args: unknown[]) => unknown) => fn,
  }),
);

export { createServerFn };
