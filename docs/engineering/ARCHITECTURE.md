# Architecture

Applies when designing modules, adding routes, placing components, or changing
route authentication, loader data fetching, or server functions.

## Module responsibilities

- When behaviors change for independent reasons, separate them into
  modules with distinct responsibilities.
- When user groups have different requirements, isolate their behavior
  so changes for one group leave the others unaffected.

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

## Components

- Place feature-specific components in
  `src/features/<feature>/components`.
- Place application-wide components in `src/components`, using the
  specialized `ui` and `form` directories where applicable.
- When another feature needs a feature-specific component, move it to
  `src/components`.
- Place shadcn UI primitives in `src/components/ui`.
- Place reusable TanStack Form components in `src/components/form`.
