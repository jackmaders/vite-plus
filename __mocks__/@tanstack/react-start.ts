import { vi } from "vite-plus/test";

interface MiddlewareOption {
  options?: {
    server?: (ctx: {
      context: Record<string, unknown>;
      next: (args: { context?: Record<string, unknown> }) => Promise<unknown>;
    }) => Promise<unknown>;
  };
}

interface MockServerFnBuilder {
  handler: (
    fn: (args: { context: Record<string, unknown>; data: unknown }) => unknown,
  ) => (opts?: { data?: unknown }) => Promise<unknown>;
  middleware: (middlewareList: MiddlewareOption[]) => MockServerFnBuilder;
  validator: (val: unknown) => MockServerFnBuilder;
}

interface MockMiddlewareBuilder {
  client: (fn: unknown) => { options: { client: unknown } };
  server: (fn: unknown) => { options: { server: unknown } };
}

function createMockServerFn(): MockServerFnBuilder {
  const middlewares: MiddlewareOption[] = [];

  const builder: MockServerFnBuilder = {
    handler: (fn) => async (opts) => {
      const context: Record<string, unknown> = {};
      for (const mw of middlewares) {
        if (typeof mw.options?.server === "function") {
          // eslint-disable-next-line no-await-in-loop
          await mw.options.server({
            context,
            next: async (res) => {
              if (res.context) {
                Object.assign(context, res.context);
              }
              await Promise.resolve();
              return res;
            },
          });
        }
      }
      return fn({ context, data: opts?.data });
    },
    middleware: (list) => {
      middlewares.push(...list);
      return builder;
    },
    validator: () => builder,
  };
  return builder;
}

const createServerFn = vi.fn<() => MockServerFnBuilder>(() => createMockServerFn());

const createMiddleware = vi.fn<() => MockMiddlewareBuilder>(() => ({
  client: vi.fn<(fn: unknown) => { options: { client: unknown } }>((fn: unknown) => ({
    options: { client: fn },
  })),
  server: vi.fn<(fn: unknown) => { options: { server: unknown } }>((fn: unknown) => ({
    options: { server: fn },
  })),
}));

export { createMiddleware, createServerFn };
