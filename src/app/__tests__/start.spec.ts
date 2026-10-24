import type { createCsrfMiddleware } from "@tanstack/react-start";
import { describe, expect, it, vi } from "vite-plus/test";

import { startInstance } from "../start";

type CsrfFilter = NonNullable<NonNullable<Parameters<typeof createCsrfMiddleware>[0]>["filter"]>;

const { filter } = vi.hoisted(() => ({ filter: { current: null as CsrfFilter | null } }));

vi.mock(import("@tanstack/react-start"), async (importOriginal) => ({
  ...(await importOriginal()),
  createCsrfMiddleware: (options) => {
    filter.current = options?.filter ?? null;
    return {} as never;
  },
}));

describe("start global configuration", () => {
  it("retains CSRF protection for server functions", async () => {
    expect.assertions(3);

    // Act
    const options = await startInstance.getOptions();

    const serverFunctions = await filter.current?.({ handlerType: "serverFn" } as never);
    const router = await filter.current?.({ handlerType: "router" } as never);

    // Assert
    expect(options.requestMiddleware).toHaveLength(2);
    expect(serverFunctions).toBe(true);
    expect(router).toBe(false);
  });
});
