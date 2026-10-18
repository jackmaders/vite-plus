# Architecture

Applies when adding routes or changing route authentication or loader data fetching.

## Routes

- When a route requires authentication, place it under
  `src/routes/_authenticated`.
- When a route uses TanStack Query for data required on initial render,
  populate the query cache in its loader before rendering.
