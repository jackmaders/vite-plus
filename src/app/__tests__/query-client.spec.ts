import { CancelledError, QueryObserver } from "@tanstack/react-query";
import { notFound, redirect } from "@tanstack/react-router";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { ApplicationError } from "@/shared/errors";
import { toast } from "@/shared/ui/shadcn/toast";

import { createQueryClient } from "../query-client";

vi.mock(import("@/shared/ui/shadcn/toast"));

afterEach(() => {
  vi.clearAllMocks();
});

describe("api failure notifications", () => {
  it("reports failed mutations once and preserves custom error callbacks", async () => {
    expect.assertions(3);
    // Arrange
    const client = createQueryClient();
    const applicationError = new ApplicationError("TODO_CREATE_FAILED", {
      message: "private override",
    });
    const onError = vi.fn<() => void>();
    const mutation = client.getMutationCache().build(client, {
      mutationFn: vi.fn<() => Promise<never>>().mockRejectedValue(applicationError),
      onError,
    });

    // Act
    const failure = await mutation.execute({}).catch((error: unknown) => error);

    // Assert
    expect(failure).toBe(applicationError);
    expect(onError).toHaveBeenCalledOnce();
    expect(toast.add).toHaveBeenCalledExactlyOnceWith({
      title: "Todo item could not be created.",
      type: "error",
    });
  });

  it("lets inline mutation errors reject without a duplicate toast", async () => {
    expect.assertions(2);
    // Arrange
    const client = createQueryClient();
    const applicationError = new ApplicationError("TODO_NOT_FOUND");
    const mutation = client.getMutationCache().build(client, {
      meta: { errorHandling: "inline" },
      mutationFn: vi.fn<() => Promise<never>>().mockRejectedValue(applicationError),
    });

    // Act
    const failure = await mutation.execute({}).catch((error: unknown) => error);

    // Assert
    expect(failure).toBe(applicationError);
    expect(toast.add).not.toHaveBeenCalled();
  });

  it("uses a generic message for unknown and network failures", async () => {
    expect.assertions(1);
    // Arrange
    const client = createQueryClient();
    const mutation = client.getMutationCache().build(client, {
      mutationFn: vi
        .fn<() => Promise<never>>()
        .mockRejectedValue(new TypeError("private network diagnostics")),
    });

    // Act
    await mutation.execute({}).catch((error: unknown) => error);

    // Assert
    expect(toast.add).toHaveBeenCalledExactlyOnceWith({
      title: "Something went wrong. Please try again.",
      type: "error",
    });
  });

  it.each([redirect({ href: "/" }), notFound(), new CancelledError()])(
    "does not toast framework signals: %s",
    async (signal) => {
      expect.assertions(1);
      // Arrange
      const client = createQueryClient();
      const mutation = client
        .getMutationCache()
        .build(client, { mutationFn: vi.fn<() => Promise<never>>().mockRejectedValue(signal) });

      // Act
      await mutation.execute({}).catch((error: unknown) => error);

      // Assert
      expect(toast.add).not.toHaveBeenCalled();
    },
  );

  it("leaves initial query failures to Router", async () => {
    expect.assertions(1);
    // Arrange
    const client = createQueryClient();

    // Act
    await client
      .query({
        queryFn: vi.fn<() => Promise<never>>().mockRejectedValue(new Error("unavailable")),
        queryKey: ["initial"],
        retry: false,
      })
      .catch((error: unknown) => error);

    // Assert
    expect(toast.add).not.toHaveBeenCalled();
  });

  it("reports a shared background refetch once while retaining cached data", async () => {
    expect.assertions(2);
    // Arrange
    const { client, queryKey, refetch, unsubscribe } = createSharedQuery();

    // Act
    await refetch();
    unsubscribe();

    // Assert
    expect(toast.add).toHaveBeenCalledExactlyOnceWith({
      title: "Permission denied.",
      type: "error",
    });
    expect(client.getQueryData(queryKey)).toStrictEqual(["cached"]);
  });

  it("suppresses background query notifications for inline handling", async () => {
    expect.assertions(1);
    // Arrange
    const client = createQueryClient();
    const queryKey = ["inline"];
    client.setQueryData(queryKey, []);

    // Act
    await client
      .query({
        meta: { errorHandling: "inline" },
        queryFn: vi.fn<() => Promise<never>>().mockRejectedValue(new Error("failed")),
        queryKey,
        retry: false,
      })
      .catch((error: unknown) => error);

    // Assert
    expect(toast.add).not.toHaveBeenCalled();
  });
});

function createSharedQuery() {
  const client = createQueryClient();
  const queryKey = ["shared"];
  client.setQueryData(queryKey, ["cached"]);
  const options = {
    enabled: false,
    queryFn: vi
      .fn<() => Promise<never>>()
      .mockRejectedValue(new ApplicationError("USER_FORBIDDEN")),
    queryKey,
    retry: false,
  };
  const first = new QueryObserver(client, options);
  const second = new QueryObserver(client, options);
  const unsubscribeFirst = first.subscribe(vi.fn<() => void>());
  const unsubscribeSecond = second.subscribe(vi.fn<() => void>());
  return {
    client,
    queryKey,
    refetch: async () => await first.refetch(),
    unsubscribe: () => {
      unsubscribeFirst();
      unsubscribeSecond();
    },
  };
}
