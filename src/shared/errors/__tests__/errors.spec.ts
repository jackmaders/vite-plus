import { describe, expect, it } from "vite-plus/test";

import { ApplicationError, GENERIC_ERROR_MESSAGE } from "../index";

describe("application errors", () => {
  it("preserves the exact failure code, status and native cause", () => {
    expect.assertions(4);
    // Arrange
    const cause = new Error("private database parameters");

    // Act
    const error = new ApplicationError("TODO_NOT_FOUND", "Todo not found", { cause, status: 404 });

    // Assert
    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe("TODO_NOT_FOUND");
    expect(error.status).toBe(404);
    expect(error.cause).toBe(cause);
  });

  it("defaults failures to status 500", () => {
    expect.assertions(1);
    // Act
    const error = new ApplicationError("FAILED", "Please try again.");

    // Assert
    expect(error.status).toBe(500);
  });

  it.each([{}, { referenceId: "" }])(
    "renders the public message without an absent reference: %s",
    (options) => {
      expect.assertions(1);
      // Act
      const error = new ApplicationError("MISSING", "Record not found", options);

      // Assert
      expect(error.clientMessage).toBe("Record not found");
    },
  );

  it("includes the reference in the client message", () => {
    expect.assertions(1);
    // Act
    const error = new ApplicationError("UNEXPECTED", GENERIC_ERROR_MESSAGE, {
      referenceId: "reference-1",
    });

    // Assert
    expect(error.clientMessage).toBe(
      "Something went wrong. Please try again. Reference: reference-1",
    );
  });

  it("keeps an existing application error when normalizing", () => {
    expect.assertions(1);
    // Arrange
    const error = new ApplicationError("MISSING", "Record not found");

    // Act
    const normalized = ApplicationError.from(error);

    // Assert
    expect(normalized).toBe(error);
  });

  it.each([new Error("SELECT secret FROM users"), "private failure", null])(
    "hides unknown failure details: %#",
    (cause) => {
      expect.assertions(3);
      // Act
      const error = ApplicationError.from(cause);

      // Assert
      expect(error.clientMessage).toBe(GENERIC_ERROR_MESSAGE);
      expect(error.code).toBe("UNEXPECTED");
      expect(error.cause).toBe(cause);
    },
  );
});
