# Architecture

Applies when designing modules or their public interfaces, integrating vendor SDKs,
adding routes, placing components, or changing route authentication, loader data
fetching, or server functions.

## Module design

- Group operations that serve the same purpose. When behaviors change for
  independent reasons, separate them into modules with distinct responsibilities.
- When user groups have different requirements, isolate their behavior
  so changes for one group leave the others unaffected.
- When behavior repeatedly uses several fields owned by another module,
  move that behavior to the owning module.
- When parts of a long function share mutable state, group related state
  and operations into focused modules.
- Separate workflow sequencing from the implementation of individual
  steps so they can change independently.
- When a stated requirement needs an abstraction, introduce it.
  Otherwise, keep the design simple.
- Extract a module when it enables independent tests, removes duplication,
  names a concept, or isolates independently changing behavior.
  Otherwise, keep the module intact.
- When exposing helpers would couple callers to changing implementation
  details, keep those helpers private. Expose the operations callers need.

## Dependency boundaries

- Isolate vendor SDK calls behind application-owned adapters.
  Keep vendor API changes inside those adapters.
- When concrete dependencies would couple consumers to unrelated
  implementation details, introduce dependency interfaces.
  Define those interfaces around the operations consumers need.

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
