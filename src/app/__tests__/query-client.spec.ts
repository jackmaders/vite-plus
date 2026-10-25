import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { ApplicationError } from "@/shared/errors";
import { toast } from "@/shared/ui/shadcn/toast";

import { getRouter } from "../router";

vi.mock(import("@/shared/ui/shadcn/toast"));
vi.mock(import("@tanstack/react-router-ssr-query"));

afterEach(() => {
  vi.clearAllMocks();
});

describe("api failure notifications", () => {
  it("toasts mutation errors and preserves rejection and custom callbacks", async () => {
    expect.hasAssertions();
    // Arrange
    const client = getRouter().options.context.queryClient;
    const apiError = new ApplicationError("TODO_CREATE_FAILED");
    const onError = vi.fn<() => void>();
    const mutation = client.getMutationCache().build(client, {
      mutationFn: vi.fn<() => Promise<never>>().mockRejectedValue(apiError),
      onError,
    });

    // Act
    const failure = await mutation.execute({}).catch((error: unknown) => error);

    // Assert
    expect(failure).toBe(apiError);
    expect(onError).toHaveBeenCalledOnce();
    expect(toast.add).toHaveBeenCalledExactlyOnceWith({ title: apiError.message, type: "error" });
  });

  it("leaves initial query errors to the route error boundary", async () => {
    expect.hasAssertions();
    // Arrange
    const client = getRouter().options.context.queryClient;
    const apiError = new Error("Network unavailable");

    // Act
    const failure = await client
      .query({
        queryFn: vi.fn<() => Promise<never>>().mockRejectedValue(apiError),
        queryKey: ["initial"],
        retry: false,
      })
      .catch((error: unknown) => error);

    // Assert
    expect(failure).toBe(apiError);
    expect(toast.add).not.toHaveBeenCalled();
  });

  it("toasts background query errors while preserving cached data", async () => {
    expect.hasAssertions();
    // Arrange
    const client = getRouter().options.context.queryClient;
    const queryKey = ["cached"];
    client.setQueryData(queryKey, ["saved"]);
    const apiError = new Error("Refetch failed");

    // Act
    const failure = await client
      .query({
        queryFn: vi.fn<() => Promise<never>>().mockRejectedValue(apiError),
        queryKey,
        retry: false,
        staleTime: 0,
      })
      .catch((error: unknown) => error);

    // Assert
    expect(failure).toBeInstanceOf(Error);
    expect(client.getQueryData(queryKey)).toStrictEqual(["saved"]);
    expect(toast.add).toHaveBeenCalledExactlyOnceWith({
      title: "Something went wrong. Please try again.",
      type: "error",
    });
  });

  it("does not toast errors for queries handled inline", async () => {
    expect.hasAssertions();
    // Arrange
    const client = getRouter().options.context.queryClient;
    const queryKey = ["inline"];
    client.setQueryData(queryKey, ["saved"]);

    // Act
    const failure = await client
      .query({
        meta: { errorHandling: "inline" },
        queryFn: vi.fn<() => Promise<never>>().mockRejectedValue(new Error("Refetch failed")),
        queryKey,
        retry: false,
        staleTime: 0,
      })
      .catch((error: unknown) => error);

    // Assert
    expect(failure).toBeInstanceOf(Error);
    expect(client.getQueryData(queryKey)).toStrictEqual(["saved"]);
    expect(toast.add).not.toHaveBeenCalled();
  });
});
