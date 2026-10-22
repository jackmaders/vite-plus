# Architecture

Applies when designing modules or their public interfaces, integrating vendor SDKs,
adding routes, placing UI or form primitives, or changing route authentication,
loader data fetching, or server functions.

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
- When exposing helpers would couple callers to changing implementation
  details, keep those helpers private. Expose the operations callers need.

## Dependency boundaries

- Isolate vendor SDK calls behind application-owned adapters.
  Keep vendor API changes inside those adapters.
- When concrete dependencies would couple consumers to unrelated
  implementation details, introduce dependency interfaces.
  Define those interfaces around the operations consumers need.

## Routes

- Place TanStack Router file routes in `src/app/routes` as thin wrappers
  that delegate to `src/pages`.
- When a route requires authentication, place it under
  `src/app/routes/_authenticated`.
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

- Place shadcn UI primitives in `src/shared/ui/shadcn`.
- Place reusable TanStack Form components in `src/shared/ui/form`.

## TanStack integration in this repository

Use this section as the authority for repository conventions; consult managed
skills and first-party docs for vendor API details. Check `pnpm-lock.yaml` and
the installed package source for version-sensitive behavior.

### Setup and data flow

- Configure TanStack Start through its Vite plugin in `vite.config.ts` with
  `srcDirectory: "src/app"`; `src/app/router.tsx` creates the router.
- `getRouter()` creates a `QueryClient` for each router.
  `setupRouterSsrQueryIntegration` provides the Query context and handles SSR
  dehydration, hydration, and streaming.
- Share query options between the route loader and page. For initial data, use
  `context.queryClient.query(options)` in the loader and
  `useSuspenseQuery(options)` in the page, as in the
  [Start and Query guide](https://tanstack.com/start/latest/docs/framework/react/guide/tanstack-query).
  Follow this loader method for the repository's installed Query API when
  managed skills show a different method.

  ```tsx
  const Route = createFileRoute("/_authenticated/todos")({
    loader: ({ context }) => context.queryClient.query(todosQueryOptions()),
    component: TodosPage,
  });

  function TodosPage() {
    const { data: todos } = useSuspenseQuery(todosQueryOptions());
    return <TodoList todos={todos} />;
  }
  ```

- For authenticated read/write examples, follow the [todo server functions](../../src/pages/todos/api/todos.functions.ts)
  and [Drizzle operations](../../src/pages/todos/api/todos-operations.ts).
- Router owns navigation and loader errors; Query owns cached data and mutation
  invalidation. Await critical reads in the loader and invalidate the query key
  after a mutation.
- Use Start server routes for externally addressed HTTP endpoints.

### Validation and errors

- The shared `useAppForm` hook accepts Zod validators through Standard Schema
  support. Pass schemas directly, as in the
  [Form submission guide](https://tanstack.com/form/latest/docs/framework/react/guides/submission-handling).
- TanStack Form calls `onSubmit` with the original input, even when validators use a transforming schema. Call `schema.parse(value)` there when the handler needs transformed output.
- A Start server-function `.validator(schema)` passes the validated schema
  result to its handler, including Standard Schema transformations.
- The shared form exposes `<form.FormError />`, which renders the submission
  message from `errorMap.onSubmit`. Include it where submission failures should
  appear.
