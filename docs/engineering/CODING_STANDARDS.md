# Coding standards

Applies when naming application modules, exports, or SQL columns, or changing
database schemas, input validation schemas, or database operations.

## Naming

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
