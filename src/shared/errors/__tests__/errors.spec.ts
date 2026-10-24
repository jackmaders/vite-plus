import { describe, expect, expectTypeOf, it } from "vite-plus/test";

import { errorClasses } from "../errors";
import { AppError, NotFoundError, UnexpectedError, getErrorMessage, type Result } from "../index";

describe("application errors", () => {
  it.each(Object.values(errorClasses))(
    "preserves error categories and individual codes: %s",
    (ErrorClass) => {
      expect.assertions(4);
      // Act
      const error = new ErrorClass("EXAMPLE_CODE", "Safe message");

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.code).toBe("EXAMPLE_CODE");
      expect(error.status).toBeTypeOf("number");
    },
  );

  it("hides unclassified messages", () => {
    expect.hasAssertions();

    // Act
    const message = getErrorMessage(new Error("SELECT secret FROM users"));

    // Assert
    expect(message).toBe("Something went wrong. Please try again.");
  });

  it("includes the reference for a reported unexpected failure", () => {
    expect.hasAssertions();

    // Act
    const message = getErrorMessage(
      new UnexpectedError("UNEXPECTED", "Something went wrong. Please try again.", {
        referenceId: "reference-1",
      }),
    );

    // Assert
    expect(message).toBe("Something went wrong. Please try again. Reference: reference-1");
  });

  it("omits an absent reference", () => {
    expect.assertions(1);
    // Act
    const message = getErrorMessage(new NotFoundError("MISSING", "Record not found"));

    // Assert
    expect(message).toBe("Record not found");
  });

  it("omits an empty reference", () => {
    expect.assertions(1);
    // Act
    const message = getErrorMessage(
      new NotFoundError("MISSING", "Record not found", { referenceId: "" }),
    );

    // Assert
    expect(message).toBe("Record not found");
  });

  it("requires narrowing before success data can be used", () => {
    expect.hasAssertions();

    // Arrange
    const result = { error: new NotFoundError("MISSING", "Missing"), status: "error" } as Result<
      { title: string },
      NotFoundError
    >;

    // Assert
    expect(result.status).toBe("error");
    expectTypeOf(result.data).toEqualTypeOf<{ title: string } | undefined>();
    // Narrowing is the behavior under test.
    // eslint-disable-next-line vitest/no-conditional-in-test
    if (result.status === "success") {
      expectTypeOf(result.data).toEqualTypeOf<{ title: string }>();
      expectTypeOf(result.error).toEqualTypeOf<undefined>();
    } else {
      expectTypeOf(result.error).toEqualTypeOf<NotFoundError>();
      expectTypeOf(result.data).toEqualTypeOf<undefined>();
    }
  });
});
