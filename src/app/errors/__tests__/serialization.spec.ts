import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { NotFoundError } from "@/shared/errors";

import { errorSerializationAdapter } from "../serialization";

const { requestContext } = vi.hoisted(() => ({
  requestContext: { current: new Request("http://localhost/test") },
}));
vi.mock(import("@tanstack/react-start/server"), () => ({
  getRequest: () => requestContext.current,
}));

describe("server error serialization", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("round trips a specific class without server details", () => {
    expect.hasAssertions();

    // Arrange
    vi.spyOn(console, "warn").mockImplementation(() => {
      /* Expected serialization reporting. */
    });
    const error = new NotFoundError("TODO_NOT_FOUND", "Todo not found", {
      cause: new Error("private database parameters"),
      referenceId: "reference-1",
    });

    // Act
    const payload = errorSerializationAdapter.toSerializable(error);
    const restored = errorSerializationAdapter.fromSerializable(payload);

    // Assert
    expect(restored).toBeInstanceOf(NotFoundError);
    expect(restored).toMatchObject({ code: "TODO_NOT_FOUND", referenceId: "reference-1" });
    expect(JSON.stringify(payload)).not.toContain("private database parameters");
    expect(restored.cause).toBeUndefined();
  });

  it("recognizes only Error instances", () => {
    expect.assertions(2);
    // Act
    const error = errorSerializationAdapter.test(new Error("failure"));
    const data = errorSerializationAdapter.test({ message: "ordinary data" });

    // Assert
    expect(error).toBe(true);
    expect(data).toBe(false);
  });
});
