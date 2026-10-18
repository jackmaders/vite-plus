# Testing

Applies when choosing, writing, or changing tests or test infrastructure.

## Choosing tests

- Use unit or component tests for logic and UI behavior that can be exercised in
  isolation.
- Use browser tests for behavior that depends on a real browser or spans a user
  journey.
- For a bug fix, cover the reported failure with a regression test when practical.

## Existing patterns

- Unit and component tests use `*.spec.ts` or `*.spec.tsx` inside `__tests__`
  directories near the source.
- Import Vitest APIs from `vite-plus/test`.
- For React tests, use Testing Library queries based on roles and accessible names,
  and `userEvent` for interactions.
- Reuse `tests/vitest/wrappers/tanstack-router-wrapper.tsx` when a component needs
  router context.
- Browser tests live in `tests/e2e/`; their configuration is in
  `playwright.config.ts`.

## Verification

Follow the validation checklist in the root `AGENTS.md`. For browser changes, also
run the relevant E2E tests with `vp run test:e2e`. Consult the test configuration
for environment and coverage requirements.

Report which checks ran and any failures or checks that could not run.

<!-- Review: Which user journeys should require browser coverage? -->
