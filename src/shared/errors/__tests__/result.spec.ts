import { describe, expect, expectTypeOf, it } from "vite-plus/test";

import { ApplicationError, type Result } from "../index";

describe("client results", () => {
  it("narrows data and errors by status", () => {
    expect.assertions(1);
    // Arrange
    const result = {
      error: new ApplicationError("MISSING", "Missing"),
      status: "error",
    } as Result<{
      title: string;
    }>;

    // Assert
    expect(result.status).toBe("error");
    expectTypeOf(result.data).toEqualTypeOf<{ title: string } | undefined>();
    // Narrowing is the behavior under test.
    // eslint-disable-next-line vitest/no-conditional-in-test
    if (result.status === "success") {
      expectTypeOf(result.data).toEqualTypeOf<{ title: string }>();
      expectTypeOf(result.error).toEqualTypeOf<undefined>();
    } else {
      expectTypeOf(result.error).toEqualTypeOf<ApplicationError>();
      expectTypeOf(result.data).toEqualTypeOf<undefined>();
    }
  });
});
