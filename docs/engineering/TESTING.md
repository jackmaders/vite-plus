# Testing

Applies when implementing new behavior or writing, reviewing, or organizing tests.

## Naming

- Place unit tests in a colocated `__tests__` directory and name them
  `<module>.spec.ts` or `<module>.spec.tsx`.
- When a test requires the Cloudflare Workers runtime, place it in
  `__tests__/workers/` and name it `<module>.spec.ts`.
- Place browser tests in `tests/e2e/` and name them `<scenario>.test.ts`.

## Unit tests

- When implementing new behavior, first write a failing test stating
  the expected result.
- Make test preconditions explicit and keep setup simple. Routine behavior
  changes should affect only the relevant test data and expectations.
- Assert externally observable results so implementation changes that
  preserve behavior leave tests passing.
- Test expected exceptions, including their required recovery or
  propagation behavior.
- Separate test setup, the action under test, and assertions into distinct
  Arrange, Act, and Assert sections.
- Place all `expect` statements in the Assert section. Perform actions and capture
  their results before that section; assertion expressions should only inspect
  those results.
- Test one behavior per test. Split independent claims so each failure
  identifies the behavior that broke.
- Keep unit tests fast and runnable in any order. Isolate mutable state
  and control external inputs such as time, randomness, and network responses.
