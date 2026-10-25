import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vite-plus/test";

import { createTestingWrapper } from "@test/vitest/wrappers/testing-wrapper";

import { todoKeys } from "../todo-query-options";
import { useTodoMutation } from "../use-todo-mutation";

describe("useTodoMutation slice helper", () => {
  it("awaits invalidation and caller callback and keeps pending active until complete", async () => {
    expect.hasAssertions();

    // Arrange
    const { executionOrder, queryClient, result, signal } = setupOrderTracking();

    // Act
    const { isSettled, mutatePromise } = startTrackedMutation(result);
    await waitFor(() => {
      expect(executionOrder).toStrictEqual(["invalidate", "start"]);
    });

    const pendingDuringCallback = result.current.isPending;
    await completeTrackedMutation(mutatePromise, signal, result);

    // Assert
    expect(pendingDuringCallback).toBe(true);
    expect(isSettled()).toBe(true);
    expect(executionOrder).toStrictEqual(["invalidate", "start", "end"]);
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: todoKeys.all });
  });

  it("propagates failure when mutationFn rejects", async () => {
    expect.hasAssertions();

    // Arrange
    const { invalidateSpy, onError, onSuccess, result } = setupRejectionTest();

    // Act & Assert
    await expect(result.current.mutateAsync()).rejects.toThrow("mutation error");
    expect(invalidateSpy).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledOnce();
  });

  it("propagates failure when caller onSuccess throws", async () => {
    expect.hasAssertions();

    // Arrange
    const { queryClient, wrapper } = createTestingWrapper();
    vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue();
    const mutationFn = vi.fn<() => Promise<{ id: string }>>().mockResolvedValue({ id: "todo-1" });
    const callerError = new Error("caller callback error");

    const { result } = renderHook(
      () =>
        useTodoMutation(mutationFn, {
          onSuccess: () => {
            throw callerError;
          },
        }),
      { wrapper },
    );

    // Act & Assert
    await expect(result.current.mutateAsync()).rejects.toThrow("caller callback error");
  });
});

function createDeferredSignal() {
  const signal: { promise: Promise<void>; resolve?: () => void } = {
    promise: Promise.resolve(),
  };
  signal.promise = new Promise<void>((resolve) => {
    signal.resolve = resolve;
  });
  return signal;
}

function setupOrderTracking() {
  const executionOrder: string[] = [];
  const signal = createDeferredSignal();
  const { queryClient, wrapper } = createTestingWrapper();

  vi.spyOn(queryClient, "invalidateQueries").mockImplementation(async () => {
    await Promise.resolve();
    executionOrder.push("invalidate");
  });

  const mutationFn = vi.fn<() => Promise<{ id: string }>>().mockResolvedValue({ id: "todo-1" });
  const { result } = renderHook(
    () =>
      useTodoMutation(mutationFn, {
        onSuccess: async () => {
          executionOrder.push("start");
          await signal.promise;
          executionOrder.push("end");
          return "success-result";
        },
      }),
    { wrapper },
  );

  return { executionOrder, queryClient, result, signal };
}

function startTrackedMutation(result: { current: { mutateAsync: () => Promise<unknown> } }) {
  let settled = false;
  const mutatePromise = (async () => {
    await result.current.mutateAsync();
    settled = true;
  })();
  return { isSettled: () => settled, mutatePromise };
}

async function completeTrackedMutation(
  mutatePromise: Promise<void>,
  signal: { resolve?: () => void },
  result: { current: { isPending: boolean } },
) {
  signal.resolve?.();
  await mutatePromise;
  await waitFor(() => {
    expect(result.current.isPending).toBe(false);
  });
}

function setupRejectionTest() {
  const { queryClient, wrapper } = createTestingWrapper();
  const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
  const onSuccess = vi.fn<() => void>();
  const onError = vi.fn<() => void>();
  const mutationFn = vi
    .fn<() => Promise<{ id: string }>>()
    .mockRejectedValue(new Error("mutation error"));

  const { result } = renderHook(() => useTodoMutation(mutationFn, { onError, onSuccess }), {
    wrapper,
  });

  return { invalidateSpy, onError, onSuccess, result };
}
