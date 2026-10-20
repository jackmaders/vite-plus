import { describe, expect, it } from "vite-plus/test";

import {
  createTodoInputSchema,
  deleteTodoInputSchema,
  toggleTodoInputSchema,
  updateTodoInputSchema,
} from "../todo-schema";

describe("create todo input schema valid inputs", () => {
  it("parses valid input and trims title", () => {
    expect.assertions(2);

    // Arrange
    const rawInput = { description: "Paperwork", title: "  Clean desk  " };

    // Act
    const parsed = createTodoInputSchema.parse(rawInput);

    // Assert
    expect(parsed.title).toBe("Clean desk");
    expect(parsed.description).toBe("Paperwork");
  });

  it("parses valid input with null description", () => {
    expect.assertions(2);

    // Arrange
    const rawInput = { description: null, title: "Buy milk" };

    // Act
    const parsed = createTodoInputSchema.parse(rawInput);

    // Assert
    expect(parsed.title).toBe("Buy milk");
    expect(parsed.description).toBeNull();
  });
});

describe("create todo input schema invalid inputs", () => {
  it("throws when title is empty", () => {
    expect.assertions(1);

    // Arrange
    const invalidInput = { title: "" };

    // Act
    function parse() {
      createTodoInputSchema.parse(invalidInput);
    }

    // Assert
    expect(parse).toThrow("Title is required");
  });

  it("throws when title is only whitespace", () => {
    expect.assertions(1);

    // Arrange
    const invalidInput = { title: "   " };

    // Act
    function parse() {
      createTodoInputSchema.parse(invalidInput);
    }

    // Assert
    expect(parse).toThrow("Title is required");
  });
});

describe("toggle todo input schema", () => {
  it("parses valid toggle input", () => {
    expect.assertions(2);

    // Arrange
    const rawInput = { completed: true, id: "todo-1" };

    // Act
    const parsed = toggleTodoInputSchema.parse(rawInput);

    // Assert
    expect(parsed.id).toBe("todo-1");
    expect(parsed.completed).toBe(true);
  });

  it("throws when id is empty", () => {
    expect.assertions(1);

    // Arrange
    const invalidInput = { completed: true, id: "" };

    // Act
    function parse() {
      toggleTodoInputSchema.parse(invalidInput);
    }

    // Assert
    expect(parse).toThrow(/too_small/iu);
  });

  it("throws when completed is invalid", () => {
    expect.assertions(1);

    // Arrange
    const invalidInput = { completed: "yes", id: "todo-1" };

    // Act
    function parse() {
      toggleTodoInputSchema.parse(invalidInput);
    }

    // Assert
    expect(parse).toThrow(/invalid_type/iu);
  });
});

describe("update todo input schema valid inputs", () => {
  it("parses valid update input with all fields provided", () => {
    expect.assertions(3);

    // Arrange
    const rawInput = { description: "New desc", id: "todo-1", title: "  New title  " };

    // Act
    const parsed = updateTodoInputSchema.parse(rawInput);

    // Assert
    expect(parsed.id).toBe("todo-1");
    expect(parsed.title).toBe("New title");
    expect(parsed.description).toBe("New desc");
  });

  it("parses valid update input with only id", () => {
    expect.assertions(3);

    // Arrange
    const rawInput = { id: "todo-1" };

    // Act
    const parsed = updateTodoInputSchema.parse(rawInput);

    // Assert
    expect(parsed.id).toBe("todo-1");
    expect(parsed.title).toBeUndefined();
    expect(parsed.description).toBeUndefined();
  });
});

describe("update todo input schema invalid inputs", () => {
  it("throws when id is empty", () => {
    expect.assertions(1);

    // Arrange
    const invalidInput = { id: "" };

    // Act
    function parse() {
      updateTodoInputSchema.parse(invalidInput);
    }

    // Assert
    expect(parse).toThrow(/too_small/iu);
  });

  it("throws when title is empty string", () => {
    expect.assertions(1);

    // Arrange
    const invalidInput = { id: "todo-1", title: "" };

    // Act
    function parse() {
      updateTodoInputSchema.parse(invalidInput);
    }

    // Assert
    expect(parse).toThrow(/too_small/iu);
  });
});

describe("delete todo input schema", () => {
  it("parses valid delete input", () => {
    expect.assertions(1);

    // Arrange
    const rawInput = { id: "todo-1" };

    // Act
    const parsed = deleteTodoInputSchema.parse(rawInput);

    // Assert
    expect(parsed.id).toBe("todo-1");
  });

  it("throws a validation error when id is empty", () => {
    expect.assertions(1);

    // Arrange
    const invalidInput = { id: "" };

    // Act
    function parse() {
      deleteTodoInputSchema.parse(invalidInput);
    }

    // Assert
    expect(parse).toThrow(/too_small/iu);
  });
});
