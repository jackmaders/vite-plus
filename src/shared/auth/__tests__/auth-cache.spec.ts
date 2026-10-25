import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vite-plus/test";

import { resetAuthCache } from "../auth-cache";

describe("resetAuthCache function", () => {
  it("cancels in-flight queries, removes all queries from cache, and invalidates router if provided", async () => {
    expect.assertions(3);

    // Arrange
    const queryClient = new QueryClient();
    const cancelSpy = vi.spyOn(queryClient, "cancelQueries").mockResolvedValue();
    const clearSpy = vi.spyOn(queryClient, "clear");
    const router = {
      invalidate: vi.fn<() => Promise<void>>().mockResolvedValue(),
    };

    // Act
    await resetAuthCache({ queryClient, router });

    // Assert
    expect(cancelSpy).toHaveBeenCalledOnce();
    expect(clearSpy).toHaveBeenCalledOnce();
    expect(router.invalidate).toHaveBeenCalledOnce();
  });

  it("works when router is not provided", async () => {
    expect.assertions(2);

    // Arrange
    const queryClient = new QueryClient();
    const cancelSpy = vi.spyOn(queryClient, "cancelQueries").mockResolvedValue();
    const clearSpy = vi.spyOn(queryClient, "clear");

    // Act
    await resetAuthCache({ queryClient });

    // Assert
    expect(cancelSpy).toHaveBeenCalledOnce();
    expect(clearSpy).toHaveBeenCalledOnce();
  });
});
