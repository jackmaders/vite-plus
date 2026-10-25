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

## TanStack integration

- Follow repository conventions when managed skill examples conflict.
- Verify version-sensitive APIs against the lockfile, installed source, and
  [first-party migration guidance](https://tanstack.com/start/latest/docs/framework/react/migrate-from-release-candidate).

### Setup

- Configure Start and Cloudflare through their Vite plugins. Start owns route
  generation. Use the separate Router plugin for standalone Router apps.
  See the [Cloudflare Start guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/).
- Create a `QueryClient` inside `getRouter()` for each SSR request. The browser
  retains its router's cache during navigation.
- Use `setupRouterSsrQueryIntegration` for the Query provider, dehydration,
  hydration, and streaming.
- Use `createFileRoute` with `server.handlers` for external HTTP endpoints.
  See the [server routes guide](https://tanstack.com/start/latest/docs/framework/react/guide/server-routes).

### Authenticated reads and writes

- Keep page logic, query options, mutations, schemas, and database operations
  in the owning page slice. Import through its public API from routes.
- Await `context.queryClient.query(options)` in the loader. Read the same
  options with `useSuspenseQuery` in the page.
- Keep privileged operations in server functions. Loaders also run in the browser.
- Handle navigation and initial loader errors through Router. Use Query for
  cached data, refetching, and mutation state.
- Await critical data. Return promises for secondary data rendered with
  Suspense and Await.
- Call mutations through `useServerFn`. Return the query invalidation promise
  from `onSuccess` to keep the mutation pending until refetching finishes.
- Await `mutateAsync` in form submission handlers to propagate failures.
- Set `Cache-Control: private, no-store` on personalized HTML. This controls HTTP
  caching, separately from Query caching and server-function responses.
- On sign-out or account switching, cancel and remove private queries and
  reload authentication context.
- See the [Start and Query guide](https://tanstack.com/start/latest/docs/framework/react/guide/tanstack-query)
  for integration and cache lifecycle details.

Example server functions:

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

Example shared query options:

```ts
function recordsQueryOptions() {
  return queryOptions({
    queryFn: () => getRecordsFn(),
    queryKey: ["records"],
  });
}
```

Example route:

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

Example page, in a separate module:

```tsx
function RecordsPage() {
  const { data: records } = useSuspenseQuery(recordsQueryOptions());
  return <RecordList records={records} />;
}

export { RecordsPage };
```

Example mutation hook:

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

### Validation and errors

- Register application error serialization in Start's `serializationAdapters` so
  server-function failures reject with `ApplicationError` on the client. Transport
  only the stable code, configured public message, name, and status metadata.
  Custom message overrides, details, causes, and server stacks remain server-side.
  Status metadata does not set the server-function response's HTTP status.
- Keep queries and mutations rejecting on failures. Preserve Router redirects
  and not-found signals through error middleware.
- Follow the [server-operation and Query conventions](CODING_STANDARDS.md#error-handling):
  return domain data on success and propagate failures. A resolved error envelope
  is successful Query data, so it does not activate Query's failure handling.
- Create Query clients through `src/app/query-client.ts`. Cache callbacks show
  one browser toast per failed mutation or refetch of previously successful data.
  Initial query failures remain owned by Router. Redirects, not-found signals,
  cancellation, and server rendering do not produce notifications.
- Keep mutation callbacks and awaited invalidation intact when displaying
  failures in the owning UI.
- Show `error.message` from server-function failures in toasts. Keep route
  boundary messaging generic so loader diagnostics do not reach the page.
- Keep failed confirmation dialogs open with inline mutation feedback so users
  can retry.
- Use `/error-test` to trigger known and unexpected failures with buttons.
  `tests/e2e/error-response.test.ts` verifies the actual server-function responses
  through the normal browser test suite. This diagnostic page is excluded from
  unit coverage because the E2E tests exercise it against the built application.
- Pass Zod schemas directly to `useAppForm` validators through Standard Schema.
- Use `z.input<typeof schema>` for form values. Form passes original input to
  `onSubmit`; call `schema.parse(value)` when transformed output is needed.
- Start's `.validator(schema)` passes validated and transformed output to its
  handler.
- Render `<form.FormError />` inside `<form.AppForm>` and `<form.Form>` to show
  submit validation messages and submission failures. Public `ApplicationError`
  and explicit `FormSubmissionError` messages are shown; other failures use the
  generic fallback.
- Keep caught submission failures in the Form's local feedback context rather
  than its validation `errorMap`. This lets valid drafts retry without editing
  while `canSubmit` continues to reflect validation. Clear submission feedback
  before the next attempt.
- See the [Form submission guide](https://tanstack.com/form/latest/docs/framework/react/guides/submission-handling)
  for validation and transformation behavior.
