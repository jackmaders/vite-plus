# Architecture

Applies when adding routes or changing route authentication, loader data fetching,
or server functions.

## Routes

- When a route requires authentication, place it under
  `src/routes/_authenticated`.
- When a route uses TanStack Query for data required on initial render,
  populate the query cache in its loader before rendering.

## Server functions

- When client code invokes a server operation, expose it through
  `createServerFn`.
- Use `GET` for reads and `POST` for writes.
- Keep server functions responsible for validation and middleware wiring.
  Handlers forward validated input and context to extracted server operations.
- When a server function accepts input, validate it with `.validator(schema)`.
- When a server function requires authentication, attach authentication
  middleware.
- When an operation accesses user-owned data, pass the authenticated user
  from middleware context to database operations and derive ownership
  fields from that user.
