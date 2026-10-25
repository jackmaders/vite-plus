// @vitest-environment node
import { describe, expect, it, vi } from "vite-plus/test";

import { toast } from "@/shared/ui/shadcn/toast";

import { createQueryClient } from "../query-client";

vi.mock(import("@/shared/ui/shadcn/toast"));

describe("server-side error notifications", () => {
  it("does not emit browser notifications during SSR", async () => {
    expect.assertions(1);
    // Arrange
    const client = createQueryClient();
    const mutation = client.getMutationCache().build(client, {
      mutationFn: vi.fn<() => Promise<never>>().mockRejectedValue(new Error("failed")),
    });

    // Act
    await mutation.execute({}).catch((error: unknown) => error);

    // Assert
    expect(toast.add).not.toHaveBeenCalled();
  });
});
