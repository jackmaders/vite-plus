import { createTableRelationsHelpers } from "drizzle-orm";
import { describe, expect, it } from "vite-plus/test";

import {
  account,
  accountRelations,
  session,
  sessionRelations,
  user,
  userRelations,
  verification,
} from "@/shared/db/schema/auth";

function invokeDefaultFn<TValue>(defaultFn: (() => TValue) | undefined): TValue {
  if (!defaultFn) {
    throw new TypeError("Expected defaultFn to be defined");
  }

  return defaultFn();
}

function invokeOnUpdateFn<TValue>(onUpdateFn: (() => TValue) | undefined): TValue {
  if (!onUpdateFn) {
    throw new TypeError("Expected onUpdateFn to be defined");
  }

  return onUpdateFn();
}

describe("auth schema defaults", () => {
  it("generates a random uuid for user, session, account, and verification id columns", () => {
    expect.assertions(4);

    // Act
    const userId = invokeDefaultFn(user.id.defaultFn);
    const sessionId = invokeDefaultFn(session.id.defaultFn);
    const accountId = invokeDefaultFn(account.id.defaultFn);
    const verificationId = invokeDefaultFn(verification.id.defaultFn);

    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u;

    // Assert
    expect(userId).toMatch(uuidPattern);
    expect(sessionId).toMatch(uuidPattern);
    expect(accountId).toMatch(uuidPattern);
    expect(verificationId).toMatch(uuidPattern);
  });

  it("provides onUpdate callback that generates a Date instance for updatedAt", () => {
    expect.assertions(4);

    // Act
    const userUpdated = invokeOnUpdateFn(user.updatedAt.onUpdateFn);
    const sessionUpdated = invokeOnUpdateFn(session.updatedAt.onUpdateFn);
    const accountUpdated = invokeOnUpdateFn(account.updatedAt.onUpdateFn);
    const verificationUpdated = invokeOnUpdateFn(verification.updatedAt.onUpdateFn);

    // Assert
    expect(userUpdated).toBeInstanceOf(Date);
    expect(sessionUpdated).toBeInstanceOf(Date);
    expect(accountUpdated).toBeInstanceOf(Date);
    expect(verificationUpdated).toBeInstanceOf(Date);
  });
});

describe("auth schema relations", () => {
  it("configures user relations with sessions and accounts", () => {
    expect.assertions(4);

    // Arrange
    const helpers = createTableRelationsHelpers(user);

    // Act
    const relationsConfig = userRelations.config(helpers);

    // Assert
    expect(userRelations.table).toBe(user);
    expect(relationsConfig.sessions.referencedTableName).toBe("session");
    expect(relationsConfig.accounts.referencedTableName).toBe("account");
    expect(relationsConfig.sessions.fieldName).toBe("sessions");
  });

  it("configures session relations pointing to user", () => {
    expect.assertions(3);

    // Arrange
    const helpers = createTableRelationsHelpers(session);

    // Act
    const relationsConfig = sessionRelations.config(helpers);

    // Assert
    expect(sessionRelations.table).toBe(session);
    expect(relationsConfig.user.referencedTableName).toBe("user");
    expect(relationsConfig.user.fieldName).toBe("user");
  });

  it("configures account relations pointing to user", () => {
    expect.assertions(3);

    // Arrange
    const helpers = createTableRelationsHelpers(account);

    // Act
    const relationsConfig = accountRelations.config(helpers);

    // Assert
    expect(accountRelations.table).toBe(account);
    expect(relationsConfig.user.referencedTableName).toBe("user");
    expect(relationsConfig.user.fieldName).toBe("user");
  });
});

type TableWithForeignKeys = Record<symbol, { reference: () => { foreignTable: unknown } }[]>;

function getFirstForeignKeyReference(table: unknown) {
  const fksSymbol = Symbol.for("drizzle:SQLiteInlineForeignKeys");
  const target = table as TableWithForeignKeys;
  const fks = target[fksSymbol];
  if (!fks || fks.length === 0) {
    throw new TypeError("Expected table to have foreign keys");
  }
  const [firstFk] = fks;
  if (!firstFk) {
    throw new TypeError("Expected first foreign key to exist");
  }
  return firstFk.reference();
}

describe("auth schema foreign keys", () => {
  it("resolves foreign key references to user.id for session and account", () => {
    expect.assertions(2);

    // Act
    const sessionRef = getFirstForeignKeyReference(session);
    const accountRef = getFirstForeignKeyReference(account);

    // Assert
    expect(sessionRef.foreignTable).toBe(user);
    expect(accountRef.foreignTable).toBe(user);
  });
});
