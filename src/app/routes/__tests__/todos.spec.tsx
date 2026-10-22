import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vite-plus/test";

import { Route } from "@/app/routes/_authenticated/todos";
import { TodosPage, todosQueryOptions } from "@/pages/todos";

vi.mock(import("@/shared/auth/auth.server"));
vi.mock(import("@/shared/db/db.server"));

function parseSearch(input: Record<string, unknown>) {
  const { validateSearch } = Route.options;
  if (typeof validateSearch === "function") {
    return validateSearch(input);
  }
  if (validateSearch && "parse" in validateSearch && typeof validateSearch.parse === "function") {
    return validateSearch.parse(input);
  }
  throw new TypeError("Expected validateSearch to be defined");
}

function getLoader() {
  const { loader } = Route.options;
  if (typeof loader !== "function") {
    throw new TypeError("Expected loader to be a function");
  }
  return loader;
}

type LoaderArgs = Parameters<ReturnType<typeof getLoader>>[0];

describe("todos route search params validation", () => {
  it("accepts valid status values", () => {
    expect.assertions(3);

    expect(parseSearch({ status: "all" })).toStrictEqual({ status: "all" });
    expect(parseSearch({ status: "active" })).toStrictEqual({ status: "active" });
    expect(parseSearch({ status: "completed" })).toStrictEqual({ status: "completed" });
  });

  it("defaults to 'all' when status is missing or empty", () => {
    expect.assertions(1);

    expect(parseSearch({})).toStrictEqual({ status: "all" });
  });

  it("falls back to 'all' on invalid status value", () => {
    expect.assertions(1);

    expect(parseSearch({ status: "invalid" })).toStrictEqual({ status: "all" });
  });
});

describe("todos route loader and component", () => {
  it("prefetches todos query data using queryClient", async () => {
    expect.assertions(1);

    const queryClient = new QueryClient();
    const querySpy = vi.spyOn(queryClient, "query").mockResolvedValue([]);
    const loader = getLoader();
    const args = {
      context: { queryClient },
    } as unknown as LoaderArgs;

    await loader(args);

    expect(querySpy).toHaveBeenCalledExactlyOnceWith({
      ...todosQueryOptions(),
      staleTime: "static",
    });
  });

  it("uses TodosPage as its component", () => {
    expect.assertions(1);

    expect(Route.options.component).toBe(TodosPage);
  });
});
