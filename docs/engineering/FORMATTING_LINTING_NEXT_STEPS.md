# Next formatting and linting improvements

Investigated on 2026-10-22 against the PR #21 checkout. This note records the
proposals before implementation. The current commands and adopted changes are
documented in [tooling performance](TOOLING_PERFORMANCE.md), starting from the
measured local/full split.

The four proposed follow-ups were subsequently
[benchmarked](TOOLING_FOLLOWUP_BENCHMARKS.md). Deferring test setup reduced
`vp check` from 4.01s to 1.47s; unchanged full-check cache hits took 0.11s.
Formatter-owned Tailwind ordering slowed checks. Staged linting added latency,
but combining it with deferred test setup beat the existing formatter-only
hook for a one-file change. The measurements qualify the proposals below.

## Recommended order

| Priority | Change                                                             | Expected benefit                                                                     | Main limitation                                                              |
| -------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| 1        | Stop constructing Worker test configuration during metadata reads  | Faster check, lint, format, staged checks and editor startup without dropping checks | Measure savings and preserve every test invocation mode                      |
| 2        | Cache successful full checks through Vite Task                     | Avoid repeating unchanged expensive work                                             | Whole-task caching does not accelerate changed inputs                        |
| 3        | Evaluate formatter ownership of Tailwind class ordering            | Save-time fixes and one owner for layout conventions                                 | New Tailwind initialization cost and ordering compatibility need measurement |
| 4        | Narrow JS plugin registration and document intentional rule policy | More predictable applicability and dependency upgrades                               | Startup savings are unproven; categories already supply many checks          |

## 1. Remove unrelated test work from config loading

The root [Vite configuration](../../vite.config.ts) already lazily imports
application plugins, but imports `@cloudflare/vitest-plugin` eagerly and awaits
`testConfig` for every config resolution. That helper reads D1 migrations and
constructs the Worker test plugin even when only `fmt` or `lint` is needed.
This follows directly from the top-level config factory and test helper.

Vite+ specifically recommends lazy plugin factories for metadata-only reads,
including lint, format, staged commands and editor tooling. Heavy package
imports must be inside the factory; dynamically importing a local helper file
alone does not avoid config bundling work.
[Official troubleshooting](https://viteplus.dev/guide/troubleshooting#slow-config-loading-caused-by-heavy-plugins).

First move the Cloudflare package import and migration read behind a verified
test-only boundary. Preserve the root lint and format blocks and the existing
client/Worker project definitions. Check both default `vp test` and project or
mode overrides: assuming `mode === "test"` is sufficient without checking
custom modes risks silently omitting projects. Do not use `command === "serve"`
alone to identify tests because development also uses that command.

Benchmark current versus deferred configuration using complete `vp check`,
`vp lint` and `vp fmt --check` commands with unchanged lint rules. Use repeated
runs and report their median. Validate Worker migrations, both test projects,
coverage, build and editor configuration loading. This is the best first
experiment because it removes unrelated work instead of trading away feedback.
The expected gain is a hypothesis until measured.

One fresh-process observation imported `vite-plus` in 115 ms, then
`@cloudflare/vitest-plugin` in 329 ms. This measures import overhead only;
it does not establish the end-to-end saving. An unchanged `vp check` passed
in approximately 4.2 seconds wall time during this investigation.

## 2. Cache repeat full checks

`check:full`, `typecheck` and `lint:arch` currently live in
[package scripts](../../package.json), with no task-cache opt-in. Vite Task
caches configuration-defined tasks by default; package scripts are uncached by
default. Successful cached tasks can replay their diagnostics and skip execution
when their arguments, tracked inputs and fingerprinted environment match.
[Official task caching](https://viteplus.dev/guide/cache).

Try a dedicated cached full-check task, or opt in only the relevant scripts.
Keep its full profile explicit and include `FULL_CHECK` in the cache key.
The original proposal included `CI` and the former full-check variable; that
CI-triggered profile is historical and no longer supported. Avoid broad caching of
mutating formatter commands. Test cache misses after source changes, new files,
config changes, dependency changes and environment changes, as well as a hit
after an unchanged successful check. Run an uncached correctness check while
validating the setup. The existing dependency cache in
[CI](../../.github/workflows/pull-request.yml) does not itself establish that
these scripts use task-result caching.

This benefits repeated checks after an unchanged tree, including an agent
rerunning validation. It does not replace the first full check after a source
edit, and any benefit across CI runs depends on persisting the task cache.

## 3. Give Tailwind class ordering one owner

Oxfmt provides opt-in `sortTailwindcss`, with a Tailwind stylesheet and named
function configuration. The repository currently sorts imports and package
scripts in the formatter, while class ordering is a lint warning.
[Official formatter sorting](https://oxc.rs/docs/guide/usage/formatter/sorting).

Evaluate `sortTailwindcss` using `src/app/styles/styles.css` and the actual
`cn`/`cva` call sites. Compare its output with the current
`tailwindcss/classnames-order` rule before disabling that lint rule. Check
conditional expressions, variant maps and generated shadcn components, which
are formatted but excluded from lint. Run format, lint fix, then format again
to detect competing fixes. Isolate any resulting repository-wide reorder in
its own mechanical commit.

Keep invalid, conflicting and unknown-class lint checks. Formatter sorting
is not a replacement for semantic class validation or canonical spelling.
PR #21 already measured only about 0.3 seconds for all remaining Tailwind
checks together, so promise save-time consistency rather than a large speedup.
Measure formatter startup and format-on-save latency before adopting it.

## 4. Make plugin scope and upgrade policy explicit

Testing Library and Playwright rules already sit in file overrides, but their
JS plugins are registered globally. Oxlint supports `jsPlugins` within overrides;
try moving registration alongside the rules and verify positive and negative
file-scope probes. Its JS plugin API remains alpha, which makes narrow scope
and upgrade validation useful even if startup time is unchanged.
[Official JS plugins](https://oxc.rs/docs/guide/usage/linter/js-plugins.html),
[configuration reference](https://oxc.rs/docs/guide/usage/linter/config-file-reference.html#overrides).

The native config enables every category, including nursery, while full checks
deny warnings. New native rules in an enabled category can therefore introduce
new blocking diagnostics on a dependency upgrade. Record a resolved rule
inventory during tooling upgrades and review additions deliberately. Consider
an explicit curated advisory rule list only if upgrade churn becomes a real
cost; it trades automatic new coverage for stability.
[Official category configuration](https://oxc.rs/docs/guide/usage/linter/config).

Do not infer absent coverage from absent explicit rule entries: enabled native
categories already activate rules. For example, React hook dependency checking
is a native correctness rule, so adding another JS React Hooks plugin merely
because `react/exhaustive-deps` is not explicitly listed would be premature.
[Native exhaustive-deps rule](https://oxc.rs/docs/guide/usage/linter/rules/react/exhaustive-deps).

## Changes to defer

Keep compiler strictness, full CI validation, unused-disable reporting and the
existing edited-file formatter workflow. PR #21 already measured the expensive
typed and canonical-class checks and deferred them locally. Further blanket
rule disabling is less attractive than removing config startup work. Adding
full linting to pre-commit should follow a measured staged-file experiment;
the existing formatter-only hook is already scoped to staged files.
[Existing measurements](TOOLING_PERFORMANCE.md),
[official staged checks](https://viteplus.dev/guide/commit-hooks).

A staged-file experiment can replace `"*": "vp fmt"` with
`"*": "vp check --fix"`. Under the local profile this adds lint feedback
without type analysis and still allows warnings. Measure commit latency and
verify partially staged files, ignored generated files and non-code files
before adopting it. This improves early feedback rather than check throughput.

## Investigation validation

`vp install`, `vp check` and `vp test --run` passed; the test run contained
142 tests across 36 files. Only this research note was added.
