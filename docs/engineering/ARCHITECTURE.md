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

Use these repository conventions and first-party documentation checked against
installed package versions. When managed skill examples differ, verify the API
in the lockfile and installed package source before using them.

### Setup

- Configure Start through its Vite plugin and the Cloudflare Vite integration.
  Start owns route generation; the separate Router plugin is for standalone
  Router applications. Follow the [Cloudflare Start guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/).
- Create a `QueryClient` inside `getRouter()`: each SSR request gets its own
  router and cache; the browser retains its router's cache during navigation.
  `setupRouterSsrQueryIntegration` supplies the Query provider and handles SSR
  dehydration, hydration, and streaming.
- Use Start server routes with `createFileRoute` and `server.handlers` for
  externally addressed HTTP endpoints. Follow the [server routes guide](https://tanstack.com/start/latest/docs/framework/react/guide/server-routes).
- For streaming, await critical loader data and return promises for secondary
  data rendered through Suspense and Await. Follow the [Start and Query guide](https://tanstack.com/start/latest/docs/framework/react/guide/tanstack-query).
- Check migrations against installed versions, including the supported
  `.validator(schema)` API. Follow the [stable migration guide](https://tanstack.com/start/latest/docs/framework/react/migrate-from-release-candidate).

### Authenticated reads and writes

The following fragments use a hypothetical records domain. Keep the thin route
in the routing layer; the page, query options, mutation hooks, schemas, and
operations belong to the owning page slice. The route imports through the
slice's public API. Schemas, operations, and presentation components are
supplied by the application.

**Server functions** attach authentication and validation before delegating to
Drizzle/D1 operations. The middleware supplies the session; reads and writes
use its user ID to scope database access. Derive ownership fields from this
context, including on inserts.

```ts
const getRecordsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => await getRecords({ userId: context.session.user.id }));

const createRecordFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(createRecordInputSchema)
  .handler(
    async ({ context, data }) => await createRecord(data, { userId: context.session.user.id }),
  );
```

**Shared query options** keep the key and server-function call together.
Loaders also run in the browser during navigation, so privileged operations
stay behind server functions.

```ts
function recordsQueryOptions() {
  return queryOptions({
    queryFn: () => getRecordsFn(),
    queryKey: ["records"],
  });
}
```

**The route** awaits initial data in the router's cache and delegates rendering
to the page. Personalized HTML uses `private, no-store` to prevent HTTP caching;
this is separate from the in-memory Query cache and server-function responses.

```tsx
const Route = createFileRoute("/_authenticated/records")({
  loader: async ({ context }) => {
    await context.queryClient.query(recordsQueryOptions());
  },
  headers: () => ({ "Cache-Control": "private, no-store" }),
  component: RecordsPage,
});

export { Route };
```

**The page**, in a separate module, reads the same query options and composes
the domain UI.

```tsx
function RecordsPage() {
  const { data: records } = useSuspenseQuery(recordsQueryOptions());
  return <RecordList records={records} />;
}

export { RecordsPage };
```

**The mutation hook** calls the server function through `useServerFn` and
invalidates the query that owns the displayed data. Return the invalidation
promise to keep the mutation pending until the active query has refreshed.
Forms await `mutateAsync` so submission failures reach their error UI.

```ts
function useCreateRecord() {
  const queryClient = useQueryClient();
  const createRecord = useServerFn(createRecordFn);

  return useMutation({
    mutationFn: (data: CreateRecordInput) => createRecord({ data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recordsQueryOptions().queryKey }),
  });
}
```

Router owns navigation and initial loader errors; Query owns cached data,
refetching, and mutation state. Choose a Query freshness window for the
application. On sign-out or account switching, cancel and remove the previous
account's private queries and reload authentication context. Request-scoped
SSR caches do not clear private browser caches. See the [Start and Query guide](https://tanstack.com/start/latest/docs/framework/react/guide/tanstack-query)
for cache lifecycle and error recovery details.

### Validation and errors

- Pass Zod schemas directly to `useAppForm` validators through Standard Schema
  support. Follow the [Form submission guide](https://tanstack.com/form/latest/docs/framework/react/guides/submission-handling).
- Form passes the original input to `onSubmit`, even when validators use a
  transforming schema. Use `z.input<typeof schema>` for form values and call
  `schema.parse(value)` in the handler when it needs transformed output.
- A Start server-function `.validator(schema)` passes the validated schema
  result to its handler, including Standard Schema transformations.
- Render `<form.FormError />` within `<form.AppForm>` and `<form.Form>` to show
  rejected submissions stored in `errorMap.onSubmit`. The shared wrapper uses
  an explicit `FormSubmissionError` message or a generic fallback.
