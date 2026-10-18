# Coding standards

Applies when writing or reviewing application code.

## Rules

- Follow the conventions in the nearest relevant implementation. When introducing
  a different pattern, explain the reason.
- Keep code specific to one route or component beside its use. Extract shared code
  when multiple callers need the same behavior.
- Use names that describe the domain concept or behavior. Explain non-obvious
  constraints in comments beside the code they affect.
- Use existing styling tokens in `src/styles.css` when they fit the design.

## Tooling

Formatting, lint rules, and TypeScript options are defined in `vite.config.ts` and
`tsconfig.json`. Consult those files when resolving tooling failures; keep their
enforceable rules there as the source of truth.

## Verification

Complete the validation checklist in the root `AGENTS.md`. Explain any intentional
departure from an existing convention in the handoff.

<!-- Review: Which recurring code-review decisions need an explicit rule here? -->
