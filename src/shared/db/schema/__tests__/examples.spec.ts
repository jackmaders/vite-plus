import { describe, expect, it } from "vite-plus/test";

import { examples } from "@/shared/db/schema/examples";

function invokeDefaultFn<TValue>(defaultFn: (() => TValue) | undefined): TValue {
  if (!defaultFn) {
    throw new TypeError("Expected defaultFn to be defined");
  }

  return defaultFn();
}

describe("examples schema defaults", () => {
  it("generates a random uuid for the id column default", () => {
    expect.assertions(1);

    // Act
    const id = invokeDefaultFn(examples.id.defaultFn);

    // Assert
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u);
  });

  it("generates a current date for the createdAt column default", () => {
    expect.assertions(1);

    // Act
    const createdAt = invokeDefaultFn(examples.createdAt.defaultFn);

    // Assert
    expect(createdAt).toBeInstanceOf(Date);
  });

  it("generates a current date for the updatedAt column default", () => {
    expect.assertions(1);

    // Act
    const updatedAt = invokeDefaultFn(examples.updatedAt.defaultFn);

    // Assert
    expect(updatedAt).toBeInstanceOf(Date);
  });
});
