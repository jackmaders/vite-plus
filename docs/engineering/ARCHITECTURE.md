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

This section defines the repository-specific TanStack setup and authenticated data flow. The files under `.agents/skills` are managed by `npx skills`; use them as general references and follow this section when their examples differ from the project. Check `pnpm-lock.yaml` and the installed package source when dependency versions change or live documentation is ambiguous.

The current lockfile resolves TanStack Start 1.169.3, Router 1.170.45, Query 5.104.4, Form 1.33.5, Zod 4.6.7, Drizzle ORM 1.0.0-rc.5-ab785fc, and `@cloudflare/vite-plugin` 1.64.0. `package.json` uses version ranges for some packages, so use the lockfile for the installed versions.

### Setup and entry points

- `vite.config.ts` composes the Cloudflare Vite plugin, TanStack Start Vite plugin with `srcDirectory: "src/app"`, and React plugin. Start generates `src/app/routeTree.gen.ts`; `src/app/router.tsx` creates the router. The app does not use `app.config.ts`, Vinxi/Nitro setup, or a separate TanStack Router Vite plugin.
- Put file routes in `src/app/routes` and keep them thin. Routes delegate page rendering to `src/pages`; authenticated routes belong under `src/app/routes/_authenticated`.
- Use Start server functions for application calls to server-side operations. Use Start server routes for externally addressed HTTP endpoints. The Better Auth HTTP handler is mounted at `src/app/routes/api/auth/$.ts`.
- TanStack Form uses the shared `useAppForm` hook and Zod schemas directly through Standard Schema support. This project does not install or require a Zod form adapter.
- The database uses Drizzle's D1 adapter and SQLite tables. Schemas live in `src/shared/db/schema`, migrations in `drizzle/`, and `getDb()` defaults to the Cloudflare `env.DB` binding. Pass the authenticated user's ID to every operation on user-owned rows.

### Authenticated read and write flow

The todo modules show the server-side pieces of this flow, but there is not yet a todo route or page that connects them end to end. Use this sequence when adding one:

1. Add a thin file route under `src/app/routes/_authenticated` and delegate its component to `src/pages/todos`.
2. Keep the query key and server-function query function together in `todosQueryOptions()`. For data needed in the initial render, await that shared option in the route loader and read the same option with `useSuspenseQuery` in the page:

   ```tsx
   const Route = createFileRoute("/_authenticated/todos")({
     loader: ({ context }) => context.queryClient.query(todosQueryOptions()),
     component: TodosPage,
   });
   ```

   ```tsx
   function TodosPage() {
     const { data: todos } = useSuspenseQuery(todosQueryOptions());
     return <TodoList todos={todos} />;
   }
   ```

3. Create the `QueryClient` inside `getRouter()` in `src/app/router.tsx`. `setupRouterSsrQueryIntegration` owns the Query provider and SSR dehydration, hydration, and streaming. Keep Router responsible for navigation and loaders; Query owns cached data, freshness, mutation state, and invalidation. An awaited query failure follows the route loader's error handling. After a mutation, invalidate the Query key that owns the changed data.
4. Put reads and writes behind `createServerFn`: use `GET` for reads and `POST` for writes. Attach `authMiddleware`, validate write input with `.validator(schema)`, and pass `context.session.user.id` into the Drizzle operation. Scope updates and deletes by both record ID and user ID.
5. Keep database work in `src/pages/todos/api/todos-operations.ts` and schemas in `src/shared/db/schema`. Server functions in `src/pages/todos/api/todos.functions.ts` validate and connect middleware context to those operations; they do not own SQL queries.

For SSR and loader examples, use the [TanStack Start Query guide](https://tanstack.com/start/latest/docs/framework/react/guide/tanstack-query). Query 5.104.4 supports the guide's `queryClient.query` loader pattern. Verify any version-sensitive API against the lockfile and installed package before copying a live-doc example.

### Validation and errors

- Reuse Zod schemas directly in TanStack Form validators. Standard Schema validation checks form values, but Form's `onSubmit({ value })` receives the original input. Parse in `onSubmit` when that caller needs the schema's transformed output. The [Form submission guide](https://tanstack.com/form/latest/docs/framework/react/guides/submission-handling) documents this behavior.
- Start server-function `.validator(schema)` validates at the request boundary and passes the schema result to the handler. For Standard Schema validators, the current Start implementation returns `result.value`; check the [validator implementation](https://github.com/TanStack/router/blob/main/packages/start-client-core/src/createServerFn.ts) against the installed package when upgrading. Keep server validation even when the form also validates: server functions are an independently callable boundary.
- Await critical Query reads in the route loader so failures reach Router's route error handling. Use a route error component for route-specific recovery UI. Mutations surface rejected promises to their caller; the shared form wrapper stores submission failures in `errorMap.onSubmit`, and forms must render `FormError` to display that message. `CreateTodoForm` currently does not render it; this is recorded as a separate functional follow-up on issue #23.

See the first-party [Start stable migration guide](https://tanstack.com/start/latest/docs/framework/react/migrate-from-release-candidate), [Start server functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions), [Start server routes](https://tanstack.com/start/latest/docs/framework/react/guide/server-routes), [Router and Query integration](https://tanstack.com/router/latest/docs/integrations/query), [Drizzle with D1](https://orm.drizzle.team/docs/sqlite/connect-cloudflare-d1), and [Cloudflare TanStack Start guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/) when the task needs vendor details beyond this repository's conventions.
