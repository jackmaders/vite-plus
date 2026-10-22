# Formatting, linting and typechecking performance

## Development commands

| Command                               | Checks                                                                           | Warning policy                |
| ------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------- |
| `vp check`                            | Formatting and linting, excluding type analysis and Tailwind canonical spelling  | Show warnings; fail on errors |
| `vp lint [paths...]`                  | Same local lint profile, optionally for selected files                           | Show warnings; fail on errors |
| `vp run typecheck`                    | Full TypeScript compiler diagnostics                                             | Fail on type errors           |
| `vp run check:full`                   | Formatting, every enabled lint rule, type-aware linting and compiler diagnostics | Fail on errors and warnings   |
| `vp run --no-cache check:full`        | Execute the full check without reusing a task result                             | Fail on errors and warnings   |
| `vp run lint:arch --fail-on-warnings` | Architecture checks used by CI                                                   | Fail on errors and warnings   |

Only `FULL_CHECK=1` enables the full profile, regardless of `CI`. The
`check:full` task and `typecheck` script set `FULL_CHECK=1` explicitly.
CI runs `vp check` with step-level `FULL_CHECK: "1"`, bypassing task caching,
and checks architecture separately. The full profile preserves every previously
enabled rule, rule option, plugin, ignore pattern and TypeScript compiler option.

Local CLI checks defer **all type-aware lint rules and compiler diagnostics**.
Use the editor's TypeScript diagnostics while developing, `vp run typecheck`
for a compiler check, and `vp run check:full` before pushing. The compiler-only
command does not run type-aware lint rules such as floating-promise checks.
VS Code and Zed explicitly disable Oxlint's type-aware editor pass, avoiding
an additional type analysis alongside the TypeScript language service.

## Measurements and decisions

Measured on 2026-10-22 using baseline commit `e0ae9a4` and the tooling changes
described here, with 16 available lint threads. The
original `vp check` took **9.11s** end to end; formatting alone took **1.02s**,
and compiler checking alone took **3.98s**. These are single-run observations,
not CI runner estimates.

After the changes, end-to-end `vp check` took a median **4.31s** across three
runs, about **53% less elapsed time** than the original observation. The full
`vp run check:full` command took a median **10.26s**, including task-runner
startup; `vp run typecheck` took **4.68s** in one run. Every run passed.

Those timings describe the initial local/full split. Follow-up experiments
deferred Worker test setup and reduced local `vp check` from a **4.01s** median
to **1.47s**. Full-check task caching reduced unchanged runs from **8.57s** to
**0.11s**. The staged hook now runs `vp check --fix`; combined with deferred
test setup its one-file median was **1.44s**, compared with **2.17s** for the
previous formatter-only hook. See [follow-up benchmarks](TOOLING_FOLLOWUP_BENCHMARKS.md)
for the five-run samples, first-cache-miss cost and limitations.

`check:full` is a configuration-defined task with automatic file tracking,
`FULL_CHECK` in its environment fingerprint and no restored
output files. Inputs or environment changes invalidate a successful result.
CI bypasses this cache. Use `vp run --no-cache check:full` for a fresh check or
when the file-tracking supervisor is unavailable, such as a restricted sandbox.
The cache remains local; this workflow does not persist task results across CI
runs.

Test projects and their dynamic Cloudflare import are only constructed when
`VITEST=true`. Application plugins use the same test-process check, including
when Vitest overrides the mode. Ordinary format, lint, task lookup and editor
config reads avoid Worker setup.

To isolate lint costs, the resolved source configuration was serialized to a
temporary root JSON config and passed to `vp lint -c`. This preserved JS rules,
overrides and settings while removing Vite config loading from the comparison.
The following are median elapsed wall times over three sequential runs per
variant, with a warm filesystem and no task-result cache:

| Lint configuration                                                    | Median |
| --------------------------------------------------------------------- | -----: |
| Original rules and types                                              |  5.87s |
| Without type analysis                                                 |  3.94s |
| Without Tailwind canonical spelling                                   |  2.84s |
| Without any Tailwind rules                                            |  2.47s |
| Without types or Tailwind canonical spelling (selected local profile) |  1.02s |
| Without types or any Tailwind rules                                   |  0.72s |

The selected local profile reduces isolated lint time by about **83%** while
keeping the other Tailwind checks, including invalid and conflicting classes.
Removing those remaining Tailwind rules would save only about **0.3s** in this
comparison. Costs overlap, so differences should not be added together.

Each Tailwind rule was also run alone with native and other JS rules retained,
and type analysis disabled. `tailwindcss/enforces-canonical-classname` took
**3.87s**; the other individual Tailwind runs took **0.74–0.96s** each. These
were single-run comparisons of whole commands, not exclusive per-rule CPU
times. Canonical spelling is therefore deferred locally and retained in full
checks. No other Tailwind rule was disabled.

Keep formatter options: formatting was a small part of the original total,
and format-on-save and the staged-file hook narrow immediate
work to edited files. Keep all `tsconfig` strictness flags and the existing
`skipLibCheck: true`; move type analysis out of the frequent local lint pass
instead of weakening type safety at the CI boundary. The project already uses
the native TypeScript Go path through Vite+, rather than a separate `tsc` CI
pass.

## Diagnostic severity

Native `correctness` and `suspicious` categories remain errors. `perf`, `style`,
`pedantic`, `restriction` and `nursery` become warnings. Explicit rules follow
the same intent: naming, imports, JSX depth, preferred test APIs, property
ordering and Tailwind spelling are warnings. Framework dependency checks,
invalid/conflicting classes, missing test awaits and unsafe test behavior stay
errors. Category labels are broad, so explicit error overrides also preserve
React hook correctness, unsafe type operations, misused promises, exhaustive
switches, missing callback returns and invalid control flow. Existing
deliberate `off` settings remain off.

Warnings still block full checks. Severity is a presentation choice during
development; it does not remove a rule or reduce its execution cost.

## Validation

`vp check`, `vp run check:full`, `vp run typecheck`,
`vp run lint:arch --fail-on-warnings` and `vp test --run` passed. The test suite
contained 142 tests across 36 files.

Historical validation before the environment simplification: temporary source
probes verified that warnings succeed locally but fail full
and CI checks, correctness errors fail locally, and compiler errors,
type-aware floating-promise violations and noncanonical Tailwind classes fail
their full checks. A `CI=true` run still rejected warnings with
`VITE_PLUS_FULL_CHECK=0`. That CI-triggered behavior is historical; `CI` alone
now leaves the local profile active. The probes were removed afterward. The effective full
configuration was compared with the original after normalizing warning/error
severity to verify that enabled checks and their options were preserved.

After simplifying the environment handling, resolved-config probes confirmed
that `CI=true` alone uses the local profile and `FULL_CHECK=1` enables warning
rejection, type analysis and canonical spelling with or without `CI`. Local
and full checks passed, and all 142 tests passed with 100% coverage.

## Tooling capabilities and sources

Verified on 2026-10-22 against installed Vite+ 1.3.0, Oxlint 1.88.0,
Oxfmt 0.73.0 and oxlint-tsgolint 7.0.2004. Versions come from
`node_modules/vite-plus/package.json`; command support was checked with
`vp lint --help`, `vp check --help` and `vp fmt --help`.

### Keep severity separate from enforcement

Use `error` for likely broken behavior and `warn` for style, restrictions,
maintainability and optimization advice. Oxlint's rule configuration supports
`off`, `warn` and `error` (also their numeric forms and `allow`/`deny` aliases).
`info` is an editor diagnostic customization, not a native rule severity.
Category settings apply to native rules; explicit rule settings override them.
Therefore changing category severities alone leaves existing explicit errors
unchanged. [Oxlint configuration reference](https://oxc.rs/docs/guide/usage/linter/config-file-reference.html).

Set `lint.options.denyWarnings` for CI, or use `vp lint --deny-warnings` /
`--max-warnings=0`. These preserve warning presentation while failing the
command. The installed `vp check` has no corresponding warning CLI flag;
configure its underlying lint options instead. Keep unused-disable reporting
enabled. [Oxlint CLI](https://oxc.rs/docs/guide/usage/linter/cli.html),
[Vite+ check](https://viteplus.dev/guide/check).

Changing an enabled rule from error to warning still executes the rule; it
changes feedback, not the amount of checking.

### Distinguish type-aware rules from compiler diagnostics

`typeAware` enables rules that consume TypeScript types; `typeCheck` additionally
reports compiler errors. Both use tsgolint and the TypeScript Go toolchain.
Removing a few typed rules still requires constructing TypeScript programs for
the remaining typed rules. Disabling only `typeCheck` should therefore be
measured before assuming it removes most type-analysis cost.
[Type-aware linting](https://oxc.rs/docs/guide/usage/linter/type-aware.html).

`vp check --no-fmt --no-lint` isolates compiler checking when both type options
are enabled. File arguments narrow formatting and lint inputs, but type analysis
still requires the relevant TypeScript projects and their dependencies.
[Vite+ check](https://viteplus.dev/guide/check),
[type-aware architecture](https://oxc.rs/docs/guide/usage/linter/type-aware.html#overview).

For editors, explicitly setting VS Code's `oxc.typeAware: false` or Zed's
Oxlint LSP `typeAware: false` overrides the root type-aware setting. This allows
cheaper interactive linting while keeping the full CLI/CI checks. VS Code's
current scheduling setting is `oxc.lint.run`; native LSP uses `run`. `onSave`
currently only controls push diagnostics and has no effect for clients using
pull diagnostics. [Editor setup](https://oxc.rs/docs/guide/usage/linter/editors.html),
[LSP reference](https://oxc.rs/docs/guide/usage/linter/lsp-config-reference.html),
[VS Code extension settings](https://raw.githubusercontent.com/oxc-project/oxc-vscode/main/package.json).

### Measure the expensive boundaries

The installed CLI advertises `vp lint --debug=timings` for per-rule timings,
but it did not emit a timing table in this checkout. The measurements above
use elapsed wall time, including plugin initialization and TypeScript project
construction, to compare complete commands.
[Oxlint CLI](https://oxc.rs/docs/guide/usage/linter/cli.html#output).

Oxlint supports JS plugin registration and rules inside file overrides, so test
plugins can be restricted to test files. This limits applicable rules; it does
not guarantee that plugin startup disappears. Retain framework correctness
rules where practical and consider deferring measured expensive advisory rules
to a full check. [JS plugins](https://oxc.rs/docs/guide/usage/linter/js-plugins.html),
[override configuration](https://oxc.rs/docs/guide/usage/linter/config-file-reference.html#overrides).

The installed lint and formatter CLIs expose no per-file `--cache` flag. Vite+
does support whole-task caching through `vp run`: config tasks cache by default,
package scripts require opting in. This skips an unchanged successful command;
an input change invalidates it. If an environment variable changes check
behavior, include it in `cache.env` so local and CI modes cannot share a stale
success. [Vite+ task caching](https://viteplus.dev/guide/cache).

Prefer formatting the edited file on save and the staged-file format-and-lint
hook for immediate feedback. Keep the complete formatting check at
the CI boundary. The installed formatter accepts file paths, but has no
per-option performance profiler. [Vite+ formatting](https://viteplus.dev/guide/fmt),
[editor integration](https://viteplus.dev/guide/ide-integration).
