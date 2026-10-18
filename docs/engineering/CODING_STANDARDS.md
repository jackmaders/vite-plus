# Coding standards

Applies when naming application modules, exports, functions, variables, or SQL
columns, changing database schemas, input validation schemas, database
operations, component props, error handling, or object and data design, or
writing comments.

## Code organization

- Place entry points before their implementation helpers so readers see the
  workflow before its details.
- When adjacent blocks express different concepts, separate them with blank
  lines.
- Declare local variables near their first use, inside the smallest block that
  needs them.

## Naming

### Functions and variables

- Name functions for their purpose or result.
- Give widely used variables descriptive names. Give related private
  helpers names that distinguish their specific operations.

### Server modules

- When a file directly imports an external server-only runtime dependency,
  name it `<name>.server.ts`.
- Keep ordinary filenames for files that only import local server modules.
- When a module defines server functions, name it `<name>.functions.ts`.
- When an export is created with `createServerFn`, suffix its name with `Fn`.

### Data modules

- When a module defines TanStack Query keys and query options, name it
  `<entity>-query-options.ts`.
- When a module contains entity-specific database reads and writes, name it
  `<entity>-db-queries.ts`, applying the server dependency suffix when required.
- When a module defines Zod schemas for an entity, name it
  `<entity>-schema.ts`.
- When a module defines a mutation hook, name it `use-<verb>-<entity>.ts`.
- Use snake_case for SQL column names.

### Framework conventions

- When a framework requires a particular name, use that name.

## Comments

- Keep comments accurate as the code changes.
- Explain business constraints, non-obvious behavior, or risks when maintainers
  need that context to use or change the code safely.
- Document public API behavior, inputs, outputs, and side effects.
- Do not add comments that narrate why a change was made, who requested it, or
  what feedback it addresses; keep that history in the conversation or commit.
- Remove comments that only restate the code. Prefer clear names and helpers
  that explain mechanics.
- Delete commented-out code; version history retains it.
- Write TODOs with an action and the condition for resolving them.

## Objects and data

- When getters or setters couple callers to internal storage, replace
  them with operations that preserve freedom to change the storage.
- When a requirement calls for variation, choose an extension strategy
  that supports that requirement.
- Ask collaborators for operations directly. Avoid chaining through
  returned service objects; ordinary access to plain data is fine.
- When business behavior must change independently, separate it from
  raw data so callers can use the data without depending on that behavior.

## Database

- When declaring a foreign key, specify its deletion behavior explicitly.
- Declare Drizzle indexes and composite unique constraints in the table
  callback. Column-level unique constraints may remain on the column.
- When validation mirrors table fields, derive Zod schemas from the
  Drizzle schema.
- Limit client input schemas to fields the client must supply. Omit
  generated and server-owned fields from create inputs.
- When reading or writing user-owned records, scope the operation to
  the authenticated user's ID.
- If an operation expects a row but `.returning()` returns none,
  throw an error.

## Error handling

- Handle failures with guard clauses or separate error handling.
  Keep the success path readable as sequential steps.
- When callers need application-owned error types, translate vendor
  exceptions at the adapter boundary.
- Represent expected alternatives with conditions, explicit results,
  or defaults. Reserve exceptions for failures.
- When an empty value preserves the API's meaning, use it—for example,
  return an empty collection. When absence is a distinct result callers
  must handle, use `null`.

// todo: Decide server-operation and TanStack Query error-handling conventions.

## Component props

- When a component wraps an element or another component, derive its props
  from `ComponentProps<"element">` or
  `ComponentProps<typeof WrappedComponent>`.
- When a wrapper owns props, exclude them from the forwarded props using
  `Omit` and spread the remaining props onto the wrapped element or component.
