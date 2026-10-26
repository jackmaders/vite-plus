# Vite+ Starter Application

This context is the starter application and its conventions for organizing,
validating, persisting, and testing application behavior.

## Language

### Architecture

**Module**:
A JavaScript or TypeScript source file with its own import and export boundary.
A slice can contain multiple modules.

**Domain entity**:
A business concept represented in the application’s data model. In architecture
examples and fixture names, `<entity>` is a placeholder for that concept.

**Entities layer**:
The optional Feature-Sliced Design layer for reusable business domain models.
This repository does not currently have an `entities/` layer.

### Authentication

**User**:
A person represented by an authenticated identity in the application.

**Account**:
An authentication record connecting a User to credentials or an identity
provider. An Account belongs to a User; it is not the User.

**Session**:
A time-bounded authenticated state associated with a User.

**Profile**:
The user-facing view of a User’s name and email address. It is not a separate
identity from the User.

### Data

**Database schema**:
Drizzle table declarations that describe persisted columns, indexes, and
constraints.

**Validation schema**:
A Zod parser that defines the accepted shape and constraints of runtime data.
When fields mirror persisted data, it can be derived from the Drizzle database
schema and narrowed for the fields a caller may supply.

### Tests

**Browser test**:
A Playwright test that exercises the built application through a browser. The
suite lives under `tests/browser/` and runs in Chromium, Firefox, and WebKit.
