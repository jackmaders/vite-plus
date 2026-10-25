import { describe, expect, it } from "vite-plus/test";

import { ApplicationError } from "@/shared/errors";

import { getTodoErrorMessage } from "../mutation-error";

describe("todo failure messages", () => {
  it.each([
    {
      error: new ApplicationError("TODO_NOT_FOUND"),
      expectedMessage: "Todo item not found. Refresh the list to continue.",
    },
    {
      error: new ApplicationError("TODO_CREATE_FAILED", { message: "Private diagnostics" }),
      expectedMessage: "Todo item could not be created.",
    },
    {
      error: new Error("Private diagnostics"),
      expectedMessage: "Something went wrong. Please try again.",
    },
  ])("presents a public recovery message for $error", ({ error, expectedMessage }) => {
    expect.assertions(1);

    // Act
    const message = getTodoErrorMessage(error);

    // Assert
    expect(message).toBe(expectedMessage);
  });
});
