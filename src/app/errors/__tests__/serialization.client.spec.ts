import { describe, expect, it, vi } from "vite-plus/test";

import { ApplicationError } from "@/shared/errors";

import { errorSerializationAdapter } from "../serialization";

vi.mock(import("@tanstack/react-start"), () => ({
  createIsomorphicFn: () =>
    ({
      server: () => ({ client: (implementation: (error: Error) => Error) => implementation }),
    }) as never,
}));

describe("client serialization", () => {
  it("keeps typed error metadata", () => {
    expect.assertions(1);
    // Arrange
    const error = new ApplicationError("TODO_NOT_FOUND", "Todo not found", { status: 404 });

    // Act
    const serialized = errorSerializationAdapter.toSerializable(error);

    // Assert
    expect(serialized).toMatchObject({ code: "TODO_NOT_FOUND", status: 404 });
  });

  it("hides unclassified error details", () => {
    expect.assertions(2);
    // Arrange
    const error = new Error("Private browser state");

    // Act
    const serialized = errorSerializationAdapter.toSerializable(error);
    const restored = errorSerializationAdapter.fromSerializable(serialized);

    // Assert
    expect(restored).toBeInstanceOf(ApplicationError);
    expect(serialized.message).toBe("Something went wrong. Please try again.");
  });
});
