import { env } from "cloudflare:workers";
import { sql } from "drizzle-orm";
import { describe, expect, it } from "vite-plus/test";

import { getDb } from "../../index.server";

describe("database client initialization", () => {
  it("initializes a drizzle client using the default workerd env.DB binding and executes a query", async () => {
    expect.assertions(2);

    // Arrange
    const db = getDb();

    // Act
    const result = await db.all<{ value: number }>(sql`SELECT 1 AS value;`);

    // Assert
    expect(db.$client).toBe(env.DB);
    expect(result).toStrictEqual([{ value: 1 }]);
  });

  it("initializes a drizzle client using an explicitly provided D1 binding and executes a query", async () => {
    expect.assertions(2);

    // Arrange
    const db = getDb(env.DB);

    // Act
    const result = await db.all<{ value: number }>(sql`SELECT 2 AS value;`);

    // Assert
    expect(db.$client).toBe(env.DB);
    expect(result).toStrictEqual([{ value: 2 }]);
  });
});
