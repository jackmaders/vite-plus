# Testing

Applies when naming or placing test files.

## Naming

- Place unit tests in a colocated `__tests__` directory and name them
  `<module>.spec.ts` or `<module>.spec.tsx`.
- When a test requires the Cloudflare Workers runtime, place it in
  `__tests__/workers/` and name it `<module>.spec.ts`.
- Place browser tests in `tests/e2e/` and name them `<scenario>.test.ts`.
