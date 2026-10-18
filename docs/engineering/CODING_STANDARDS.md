# Coding standards

Applies when naming application modules, exports, or SQL columns.

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
