import { describe, expect, it } from "vite-plus/test";

import { selectTodoSchema } from "@/shared/db";

import {
  createTodoInputSchema,
  deleteTodoInputSchema,
  updateTodoInputSchema,
} from "../todo-schema";

describe("select todo schema persisted-record semantics", () => {
  it("preserves whitespace on persisted records without trim refinement", () => {
    expect.assertions(2);

    // Arrange
    const record = {
      completed: false,
      createdAt: new Date(),
      description: "  whitespace description  ",
      id: "  padded-id  ",
      title: "  padded title  ",
      updatedAt: new Date(),
      userId: "user-1",
    };

    // Act
    const parsed = selectTodoSchema.parse(record);

    // Assert
    expect(parsed.title).toBe("  padded title  ");
    expect(parsed.description).toBe("  whitespace description  ");
  });
});
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
  it("fails with too_small code on path ['title'] when title is empty", () => {
    expect.assertions(3);

    // Arrange
    const invalidInput = { title: "" };

    // Act
    const result = createTodoInputSchema.safeParse(invalidInput);
    const issue = result.error?.issues[0];

    // Assert
    expect(result.success).toBe(false);
    expect(issue?.code).toBe("too_small");
    expect(issue?.path).toStrictEqual(["title"]);
  });

  it("fails with too_small code on path ['title'] when title is only whitespace", () => {
    expect.assertions(3);

    // Arrange
    const invalidInput = { title: "   " };

    // Act
    const result = createTodoInputSchema.safeParse(invalidInput);
    const issue = result.error?.issues[0];

    // Assert
    expect(result.success).toBe(false);
    expect(issue?.code).toBe("too_small");
    expect(issue?.path).toStrictEqual(["title"]);
  });

  it("fails with too_big code on path ['description'] when description exceeds 1024 characters", () => {
    expect.assertions(3);

    // Arrange
    const invalidInput = { description: "a".repeat(1025), title: "Valid title" };

    // Act
    const result = createTodoInputSchema.safeParse(invalidInput);
    const issue = result.error?.issues[0];

    // Assert
    expect(result.success).toBe(false);
    expect(issue?.code).toBe("too_big");
    expect(issue?.path).toStrictEqual(["description"]);
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

describe("update todo input schema strips server-owned fields", () => {
  it("strips id, userId, createdAt, updatedAt from data payload", () => {
    expect.assertions(5);

    // Arrange
    const rawInput = {
      data: {
        completed: true,
        createdAt: new Date(),
        description: "Valid desc",
        id: "server-id",
        title: "Valid title",
        unknownField: "malicious",
        updatedAt: new Date(),
        userId: "server-user",
      },
      id: "todo-1",
    };

    // Act
    const parsed = updateTodoInputSchema.parse(rawInput);

    // Assert
    expect(parsed.data).toStrictEqual({
      completed: true,
      description: "Valid desc",
      title: "Valid title",
    });
    expect("id" in parsed.data).toBe(false);
    expect("userId" in parsed.data).toBe(false);
    expect("createdAt" in parsed.data).toBe(false);
    expect("updatedAt" in parsed.data).toBe(false);
  });
});

describe("update todo input schema invalid inputs", () => {
  it("fails with too_small code on path ['id'] when id is empty", () => {
    expect.assertions(3);

    // Arrange
    const invalidInput = { data: {}, id: "" };

    // Act
    const result = updateTodoInputSchema.safeParse(invalidInput);
    const issue = result.error?.issues[0];

    // Assert
    expect(result.success).toBe(false);
    expect(issue?.code).toBe("too_small");
    expect(issue?.path).toStrictEqual(["id"]);
  });

  it("fails with too_small code on path ['data', 'title'] when title is empty string", () => {
    expect.assertions(3);

    // Arrange
    const invalidInput = { data: { title: "" }, id: "todo-1" };

    // Act
    const result = updateTodoInputSchema.safeParse(invalidInput);
    const issue = result.error?.issues[0];

    // Assert
    expect(result.success).toBe(false);
    expect(issue?.code).toBe("too_small");
    expect(issue?.path).toStrictEqual(["data", "title"]);
  });

  it("fails with invalid_type code on path ['data', 'completed'] when completed is invalid", () => {
    expect.assertions(3);

    // Arrange
    const invalidInput = { data: { completed: "yes" }, id: "todo-1" };

    // Act
    const result = updateTodoInputSchema.safeParse(invalidInput);
    const issue = result.error?.issues[0];

    // Assert
    expect(result.success).toBe(false);
    expect(issue?.code).toBe("invalid_type");
    expect(issue?.path).toStrictEqual(["data", "completed"]);
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

  it("fails with too_small code on path ['id'] when id is empty", () => {
    expect.assertions(3);

    // Arrange
    const invalidInput = { id: "" };

    // Act
    const result = deleteTodoInputSchema.safeParse(invalidInput);
    const issue = result.error?.issues[0];

    // Assert
    expect(result.success).toBe(false);
    expect(issue?.code).toBe("too_small");
    expect(issue?.path).toStrictEqual(["id"]);
  });
});
