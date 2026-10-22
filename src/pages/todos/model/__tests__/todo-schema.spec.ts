import { describe, expect, it } from "vite-plus/test";

import {
  createTodoInputSchema,
  deleteTodoInputSchema,
  todoCompletionStatusSchema,
  todosSearchSchema,
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

  it("throws when description exceeds 1024 characters", () => {
    expect.assertions(1);

    // Arrange
    const invalidInput = { description: "a".repeat(1025), title: "Valid title" };

    // Act
    function parse() {
      createTodoInputSchema.parse(invalidInput);
    }

    // Assert
    expect(parse).toThrow("Description must not exceed 1024 characters");
  });
});

describe("update todo input schema valid inputs", () => {
  it("parses valid update input with all fields provided", () => {
    expect.assertions(4);

    // Arrange
    const rawInput = {
      data: {
        completed: true,
        description: "New desc",
        title: "  New title  ",
      },
      id: "todo-1",
    };

    // Act
    const parsed = updateTodoInputSchema.parse(rawInput);

    // Assert
    expect(parsed.id).toBe("todo-1");
    expect(parsed.data.title).toBe("New title");
    expect(parsed.data.description).toBe("New desc");
    expect(parsed.data.completed).toBe(true);
  });

  it("parses valid update input with empty data", () => {
    expect.assertions(4);

    // Arrange
    const rawInput = { data: {}, id: "todo-1" };

    // Act
    const parsed = updateTodoInputSchema.parse(rawInput);

    // Assert
    expect(parsed.id).toBe("todo-1");
    expect(parsed.data.title).toBeUndefined();
    expect(parsed.data.description).toBeUndefined();
    expect(parsed.data.completed).toBeUndefined();
  });
});

describe("update todo input schema toggle completed", () => {
  it("parses valid toggle update input", () => {
    expect.assertions(2);

    // Arrange
    const rawInput = { data: { completed: true }, id: "todo-1" };

    // Act
    const parsed = updateTodoInputSchema.parse(rawInput);

    // Assert
    expect(parsed.id).toBe("todo-1");
    expect(parsed.data.completed).toBe(true);
  });
});

describe("update todo input schema invalid inputs", () => {
  it("throws when id is empty", () => {
    expect.assertions(1);

    // Arrange
    const invalidInput = { data: {}, id: "" };

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
    const invalidInput = { data: { title: "" }, id: "todo-1" };

    // Act
    function parse() {
      updateTodoInputSchema.parse(invalidInput);
    }

    // Assert
    expect(parse).toThrow(/too_small/iu);
  });

  it("throws when completed is invalid", () => {
    expect.assertions(1);

    // Arrange
    const invalidInput = { data: { completed: "yes" }, id: "todo-1" };

    // Act
    function parse() {
      updateTodoInputSchema.parse(invalidInput);
    }

    // Assert
    expect(parse).toThrow(/invalid_type/iu);
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

describe("todo completion status schema", () => {
  it("parses valid status values", () => {
    expect.assertions(3);

    // Arrange
    const all = "all";
    const active = "active";
    const completed = "completed";

    // Act
    const parsedAll = todoCompletionStatusSchema.parse(all);
    const parsedActive = todoCompletionStatusSchema.parse(active);
    const parsedCompleted = todoCompletionStatusSchema.parse(completed);

    // Assert
    expect(parsedAll).toBe("all");
    expect(parsedActive).toBe("active");
    expect(parsedCompleted).toBe("completed");
  });

  it("throws for invalid status values", () => {
    expect.assertions(1);

    // Arrange
    const invalid = "unknown";

    // Act
    function parse() {
      todoCompletionStatusSchema.parse(invalid);
    }

    // Assert
    expect(parse).toThrow(/invalid_value/iu);
  });
});

describe("todos search schema", () => {
  it("parses valid search status", () => {
    expect.assertions(1);

    // Arrange
    const raw = { status: "active" };

    // Act
    const parsed = todosSearchSchema.parse(raw);

    // Assert
    expect(parsed.status).toBe("active");
  });

  it("defaults to all when status is missing", () => {
    expect.assertions(1);

    // Arrange
    const raw = {};

    // Act
    const parsed = todosSearchSchema.parse(raw);

    // Assert
    expect(parsed.status).toBe("all");
  });

  it("falls back to all on invalid status", () => {
    expect.assertions(1);

    // Arrange
    const raw = { status: "invalid" };

    // Act
    const parsed = todosSearchSchema.parse(raw);

    // Assert
    expect(parsed.status).toBe("all");
  });
});
