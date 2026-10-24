# Error handling research

Investigated 23 October 2026. These findings distinguish upstream behavior from
the proposed application policy. The installed code is the compatibility target;
the linked upstream sources explain the APIs and should be rechecked on upgrade.

## Versions and representative flow

The template declares React 19.2, TanStack Start 1.169.3, Router 1.170.45,
Query 5.104.4, Form 1.33.5, Drizzle 1.0.0-rc.4, Zod 4.6.7, and Cloudflare D1.
The installed transitive packages examined include start-client-core 1.170.38,
start-server-core 1.169.44, router-core 1.171.38, and query-core 5.104.4.
Package ranges can change the installed versions independently of the top-level
versions. Vite config sets Start's `srcDirectory` to `src/app`, so its custom
configuration entry belongs at `src/app/start.ts`.

Todo create/update/delete already traverse a Drizzle operation, authenticated
server function, Query mutation hook, and form/dialog. This makes todos the
representative flow without adding a demonstration endpoint to production.

## Server exceptions and native middleware

Start supports throwing errors from server functions and rejects their client
calls; it also supports redirects and not-found responses as framework control
flow. Preserve those signals rather than treating them as application failures.
Use `useServerFn` in component-facing hooks where redirect handling is needed.
[Server functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions).

Start supplies global `functionMiddleware` and `requestMiddleware` configuration.
The former applies to every server function; the latter applies to requests,
including server routes and SSR. These are the native extension points for
cross-cutting reporting. Adding a custom Start entry requires explicitly
retaining `createCsrfMiddleware({ filter: (ctx) => ctx.handlerType === 'serverFn' })`;
Start only installs that default automatically when there is no custom entry.
[Middleware](https://tanstack.com/start/latest/docs/framework/react/guide/middleware).

Installed `executeMiddleware` makes downstream `next()` reject on failure, so
global function middleware can use ordinary `try/catch`, report, and rethrow.
Only the outermost invocation converts failure into the internal `{ error }`
transport envelope. Do not return an application `{ data, error }` result from
server handlers: Query would see a fulfilled promise. Global middleware covers
downstream validation and authentication failures as well as handlers.
[Implementation](https://github.com/TanStack/router/blob/main/packages/start-client-core/src/createServerFn.ts),
verified against installed `start-client-core/src/createServerFn.ts`.

Application recommendation: use native middleware once, with a shared reporter,
and keep each server function's existing validation/middleware/handler chain.
No `withErrorHandling(fn)` decoration is needed.

## Error identity across transport

Default serialization is insufficient for application subclasses: the installed
`ShallowErrorPlugin` matches `Error`, serializes only its message, and reconstructs
`new Error(message)`. It drops subclasses and fields such as `code`. This also
means an unsafe SQL-bearing message can cross the transport even though stack
and cause do not.
[ShallowErrorPlugin](https://github.com/TanStack/router/blob/main/packages/router-core/src/ssr/serializer/ShallowErrorPlugin.ts).

Use the native `createSerializationAdapter` API with `test`, `toSerializable`,
and `fromSerializable`, registered through `createStart({ serializationAdapters })`.
Installed Start orders custom adapters before defaults for RPC serialization and
shares them with SSR hydration. Match the application's base error, encode an
allowlisted category/code/safe message/reference ID, and reconstruct the matching
subclass. Keep stack, cause, SQL, credentials, and request input server-side.
Test real transport and hydration, not just conversion functions.
[Adapter interface](https://github.com/TanStack/router/blob/main/packages/router-core/src/ssr/serializer/transformer.ts),
[Start configuration](https://github.com/TanStack/router/blob/main/packages/start-client-core/src/createStart.ts).

## Validation behavior worth preserving deliberately

Zod's `safeParse` provides a result with a success discriminator; `parse` throws
on invalid input. Use these directly for client validation and server validation
respectively rather than inventing a validation engine.
[Zod errors](https://zod.dev/error-customization).

There is an installed Start-specific trap: `.validator(zodSchema)` takes the
Standard Schema branch before the `.parse` branch. Failed validation throws a
plain `Error(JSON.stringify(issues))`, so a global `instanceof ZodError` check
will not detect it. A supported functional validator calling `schema.parse(data)`
preserves `ZodError`, enabling central translation to `ValidationError`. Do not
infer validation by parsing arbitrary error messages.
[Validator implementation](https://github.com/TanStack/router/blob/main/packages/start-client-core/src/createServerFn.ts),
installed `execValidator` at lines 873–898.

## Drizzle and D1

Drizzle already exports `DrizzleQueryError`, `DrizzleError`, and
`TransactionRollbackError`. `DrizzleQueryError` extends `Error` directly, rather
than extending `DrizzleError`; it stores query, params, and cause, and its message
contains SQL and parameters. Inspect with Drizzle's native `is(error,
DrizzleQueryError)` where appropriate and retain the original error as `cause`
when translating to an application error. Do not expose this message to users.
[Error classes](https://github.com/drizzle-team/drizzle-orm/blob/main/drizzle-orm/src/errors.ts).

The installed D1 adapter and SQLite async executor wrap prepare/execute failures
in `DrizzleQueryError`. Drizzle's logger receives query text and parameters before
execution; it is not a universal exception hook. Translation belongs at the DB
adapter/operation seam, while reporting belongs at the application's outer
failure-handling seams. An empty collection is a successful read; absent rows
from an operation requiring a record need an explicit application decision.
[D1 adapter](https://github.com/drizzle-team/drizzle-orm/blob/main/drizzle-orm/src/d1/session.ts),
[Drizzle logging](https://orm.drizzle.team/docs/goodies#logging).

D1 methods themselves throw `Error`. Cloudflare documents message prefixes and
specific failures, and warns that retry safety depends on idempotence. Do not
blindly retry writes or treat every constraint failure as the same domain
conflict. Constraint translation should identify a known domain constraint; keep
unrecognized failures as database failures.
[Debug D1](https://developers.cloudflare.com/d1/observability/debug-d1/).

## TanStack Query and client results

A query function must throw or reject for Query to enter its error state. A
fulfilled `{ error }` object is successful query data. Leave query/mutation
functions using rejected promises, including when invoked from browser code.
Query is the intentional client-side exception to a default result-returning
application convention.
[Query functions](https://tanstack.com/query/latest/docs/framework/react/guides/query-functions).

Query already returns a discriminated union through `status` and its derived
flags. Prefer narrowing the native result rather than converting it into another
query-state abstraction. Its error defaults to `Error`; leave that broad type
and narrow with `instanceof` because network/runtime errors need not be owned
application errors. Registering a narrow global error class does not make runtime
errors obey it. A strict application result can use
`{ status: 'success'; data: T; error: null } | { status: 'error'; data: undefined;
error: E }` for imperative client operations. TypeScript then requires narrowing
before unsafe data use; it cannot force a caller to inspect an ignored result.
[Query TypeScript](https://tanstack.com/query/latest/docs/framework/react/typescript).

For a click mutation, native `mutate` plus `onError`/mutation state avoids an
unhandled rejection. `mutateAsync` rejects and must be caught by its caller.
When a client operation's interface promises a result, convert its own failure
at that interface with ordinary `try/catch`; do not wrap every function with a
generic higher-order helper. Mutations do not retry by default, which is a useful
default for writes without idempotency protection.
[Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/mutations).

Query retry can be a predicate. Application policy should avoid retrying
validation, authentication, permission, missing-record, or conflict failures,
and use a bounded retry policy for appropriate reads. Preserve the distinction
between browser retry defaults and server-side loader behavior.
[Query retries](https://tanstack.com/query/latest/docs/framework/react/guides/query-retries).

Global QueryCache callbacks observe cache operations regardless of which
component triggered them. They are separate from per-query defaults, and their
return values are not awaited. Query v5 removed per-hook query `onError`.
Use cache callbacks for shared client reporting if needed; avoid duplicating the
server report for an already reported reference ID.
[QueryCacheConfig](https://tanstack.com/query/latest/docs/framework/react/reference/interfaces/QueryCacheConfig),
[v5 migration](https://tanstack.com/query/latest/docs/framework/react/guides/migrating-to-v5).

MutationCache callbacks provide the equivalent global mutation seam and can be
awaited. User-facing recovery remains local to the form/dialog; global logging
does not substitute for handling the error where the user acted.
[MutationCacheConfig](https://tanstack.com/query/latest/docs/framework/react/reference/interfaces/MutationCacheConfig).
