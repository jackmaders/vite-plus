import type { QueryClient } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vite-plus/test";

import { Route as TodosRoute } from "@/app/routes/_authenticated/todos";
import { todosQueryOptions } from "@/pages/todos";

vi.mock(import("@/pages/todos"), (async (importOriginal: () => Promise<unknown>) => {
  const actual = await importOriginal();
  return {
    ...(actual as Record<string, unknown>),
    TodosPage: () => <h1>Todos Page</h1>,
  };
}) as never);

function getLoader() {
  const options = TodosRoute.options as unknown as {
    loader?: (ctx: { context: { queryClient: QueryClient } }) => Promise<unknown>;
  };
  const { loader } = options;
  if (!loader) {
    throw new TypeError("Expected loader to be defined");
  }
  return loader;
}

function getComponent() {
  const options = TodosRoute.options as unknown as {
    component?: React.ComponentType;
  };
  const { component } = options;
  if (!component) {
    throw new TypeError("Expected component to be defined");
  }
  return component;
}

describe("todos route options", () => {
  it("configures private no-store cache headers", () => {
    expect.assertions(1);

    // Arrange
    const options = TodosRoute.options as unknown as {
      headers?: () => Record<string, string>;
    };

    // Act
    const headers = options.headers?.();

    // Assert
    expect(headers).toStrictEqual({ "Cache-Control": "private, no-store" });
  });

  it("pre-fetches todos data in loader", async () => {
    expect.assertions(1);

    // Arrange
    const loader = getLoader();
    const queryClient = {
      query: vi.fn<() => Promise<unknown>>(),
    } as unknown as QueryClient;

    // Act
    await loader({
      context: { queryClient },
    });

    // Assert
    expect(queryClient.query).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: todosQueryOptions().queryKey,
      }),
    );
  });

  it("renders TodosPage via Route component option", () => {
    expect.assertions(1);

    // Arrange
    const Component = getComponent();

    // Act
    render(<Component />);

    // Assert
    expect(screen.getByRole("heading", { name: "Todos Page" })).toBeDefined();
  });
});
