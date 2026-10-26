# Testing

Applies when implementing new behavior or writing, reviewing, or organizing tests.

## Naming

- Place unit tests in a colocated `__tests__` directory and name them
  `<module>.spec.ts` or `<module>.spec.tsx`.
- Keep each source module's unit tests in one matching test file, including
  validation, error, and recovery scenarios.
- When a test requires the Cloudflare Workers runtime, place it in
  `__tests__/workers/` and name it `<module>.spec.ts`.
- Place browser tests in `tests/e2e/` and name them `<scenario>.test.ts`.
- Place E2E page objects in `tests/e2e/page-objects/` and component objects in
  `tests/e2e/page-objects/components/`, exporting them through
  `tests/e2e/page-objects/index.ts`. Follow the guidelines in
  [.agents/skills/playwright-best-practices/SKILL.md](../../.agents/skills/playwright-best-practices/SKILL.md).

## Fixtures

- Place complex, reusable test data and mock factories in `tests/vitest/fixtures/`
  and import them via `@test/vitest/fixtures/<fixture>`.
- Name fixture files by domain (`session.ts`, `records.ts`, `db.ts`) without
  `test-` or `mock-` prefixes.
- Name static reference records with `TEST_<ENTITY>` (e.g. `TEST_USER`,
  `TEST_RECORD`) and enforce deterministic timestamps and IDs.
- Provide `create<Entity>Fixture(overrides?)` factory functions when tests
  require customized copies of domain entities.
- Provide `createMock<Service>(...)` factory functions for mocked runtimes or
  databases.
- Place slice-private fixtures exclusively used by a single test suite in
  `__tests__/fixtures/` within that slice.
- Never place test fixtures or mock helpers in un-prefixed directories under
  `src/` (such as `src/**/testing/`).

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

## E2E tests and Page Object Model

- Model every browser page, modal, or form interaction through page objects and component objects, following [.agents/skills/playwright-best-practices/SKILL.md](../../.agents/skills/playwright-best-practices/SKILL.md). Keep tests focused on intent and expectations while delegating locators and interactions to page objects.
- Place root page objects in `tests/e2e/page-objects/` and nested UI dialog or form component objects in `tests/e2e/page-objects/components/`. Export them from `tests/e2e/page-objects/index.ts`.
- Expose locators as public properties on page and component objects so tests can run direct assertions against elements.
- Encapsulate navigation and user actions as intent-revealing methods on page objects (e.g. `goto()`, `submitCreate()`, `deleteItem()`).
- Keep test assertions in the test files. Page objects encapsulate elements and interaction mechanics; test files state expectations and verify behavior.
- Decompose complex dialogs and nested forms into discrete component objects under `tests/e2e/page-objects/components/` (one class per file) to keep classes focused and comply with class length limits.

## Diagnostics and reporters

- Test and check outputs default to minimal reporters (such as `dot` reporter) to keep tool output concise.
- When diagnosing a test or typecheck failure, pass explicit reporter or verbose flags for detailed traces:
  - Run unit tests with `--reporter=default` or `--reporter=verbose` (e.g. `vp test <path> --reporter=default`).
  - Run `vp check --fix` to automatically format and resolve linting issues.
