# Formatting and linting follow-up benchmarks

Measured on 2026-10-22 against PR #21, commit
`d7ca73af922131b130793efbfb8114f57fd2c5b1`. The experiments cover the four
follow-ups proposed in [the investigation](FORMATTING_LINTING_NEXT_STEPS.md).
Benchmark variants were restored after measurement. The subsequently adopted
changes and current commands are documented in [tooling performance](TOOLING_PERFORMANCE.md).

## Method

- Isolated local clone under `/tmp/vite-plus-benchmark-20261022/checkout`,
  with a physical copy of the installed dependencies and its own Git index.
- Linux on WSL2, 16 available logical CPUs, Node.js 24.22.1, Vite+ 1.3.0,
  Oxlint 1.88.0, Oxfmt 0.73.0 and oxlint-tsgolint 7.0.2004.
- Fresh CLI process for each measurement; elapsed wall time includes config
  loading, process startup and command execution. Filesystem caches were warm.
- Five measured runs per case. Local comparisons used an excluded warm-up and
  alternated baseline/variant order between rounds. Cache cases distinguish
  disabled caching, first cache population and subsequent hits.
- `CI`, `VITE_PLUS_FULL_CHECK` and `VITEST` were unset unless specified.
  Every variant started from the original config and was formatted before
  measurement. Tailwind formatting was normalized outside timed check runs.
- The copied PR contains 156 formatter inputs and 119 lint inputs. The
  uncommitted research notes in the main checkout were not included.
- Initial experiments with shared dependency symlinks were discarded because
  they changed type-aware allowed-type resolution. Sandbox-blocked tests and
  cache runs are excluded from performance results.

These are local CLI measurements, not CI estimates or measurements inside a
long-running editor language server. Differences between separate baseline
batches reflect normal run-to-run variation.

## 1. Defer Worker test configuration

The prototype removes the top-level `@cloudflare/vitest-plugin` import,
imports it inside a Worker project factory and constructs test projects only
when `process.env["VITEST"] === "true"`. The installed Vitest CLI sets this variable
before loading Vite configuration. Lint rules and formatter options are
unchanged.

| Command          | Baseline median | Deferred test setup median |     Change |
| ---------------- | --------------: | -------------------------: | ---------: |
| `vp check`       |          4.011s |                     1.467s | 63% faster |
| `vp lint`        |          2.155s |                     1.133s | 47% faster |
| `vp fmt --check` |          1.010s |                     0.250s | 75% faster |

This is the strongest measured improvement for frequently executed checks.
The gain includes avoiding test setup during each config read; a standalone
package-import timing understates the complete command saving.

## 2. Cache full checks

| Case                   | Elapsed wall time | Samples |
| ---------------------- | ----------------: | ------: |
| Cache disabled         |     8.572s median |       5 |
| First cached execution |            9.155s |       1 |
| Unchanged cache hit    |     0.112s median |       5 |

An unchanged hit saves approximately 8.46 seconds, or 99%. The first cached
execution was approximately 0.58 seconds slower than the uncached median.
That population cost is a single observation, not a repeated miss benchmark.

The prototype adds this task, leaving `check:full` unchanged:

```ts
run: {
  tasks: {
    "bench:full": {
      cache: { env: ["CI", "VITE_PLUS_FULL_CHECK"], output: [] },
      command: "VITE_PLUS_FULL_CHECK=1 vp check",
    },
  },
},
```

Compare `vp run --no-cache bench:full` with `vp run bench:full`. Place
`--no-cache` before the task name: after the name it is forwarded to `vp check`.
The file-tracking supervisor requires access unavailable inside this session's
sandbox, so the cache comparison runs outside it. Both sides use the same
environment and task definition.

Invalidation probes confirmed that changing an existing source file or adding
a source file with a lint violation executes the command and fails. Restoring
the original source returns to a hit. Changes to the Vite config and package
manifest both produce explicit cache misses and reject deliberately introduced
formatting violations. Setting `CI=true` produces an environment cache miss
and passes the complete check. Cached log replay includes the old formatter
and lint durations; the hit timing above measures the actual outer process.

Whole-task caching benefits an unchanged tree. It does not avoid the full check
after an input changes. Sharing results across CI runs would additionally
require persisting the task cache.

## 3. Move Tailwind ordering into Oxfmt

The prototype turns off only `tailwindcss/classnames-order` and adds:

```ts
sortTailwindcss: {
  functions: ["cn", "cva"],
  stylesheet: "./src/app/styles/styles.css",
},
```

| Command                      | Baseline median | Formatter sorting median |                Change |
| ---------------------------- | --------------: | -----------------------: | --------------------: |
| `vp check`                   |          4.156s |                   4.886s |            18% slower |
| `vp lint`                    |          2.242s |                   2.272s | Essentially unchanged |
| `vp fmt --check`             |          1.038s |                   1.792s |            73% slower |
| Format check on one TSX file |          1.036s |                   1.381s |            33% slower |

The single-file target was
`src/pages/todos/ui/todo-item-summary.tsx`. This measures a fresh formatter
process, not steady-state editor latency.

Formatting the complete existing tree produced no source changes. Running
format, then lint autofix, then format again produced the same diff as the
first format. Full checks also passed. Sorting adds stylesheet initialization
cost without a measurable lint saving here. Keep the existing rule for
performance; adopt formatter sorting only for a demonstrated editing benefit.

A separate unsorted fixture verified sorting in JSX `className`, `cn` arguments,
a conditional `cn` argument, the `cva` base string and a nested variant map.

## 4. Add linting to staged checks

The prototype replaces `staged: { "*": "vp fmt" }` with
`staged: { "*": "vp check --fix" }`. Each batch contains deterministic existing
TSX files with an appended comment staged in the isolated clone. The staged
changes remain present between repetitions, so every measured run executes
the hook's command. Normal stash and Git-index handling are included.

| Staged files | Formatter-only median | Format + local lint median | Added time |
| ------------ | --------------------: | -------------------------: | ---------: |
| 1            |                2.165s |                     5.326s |     3.161s |
| 5            |                2.155s |                     5.485s |     3.330s |
| 20           |                2.082s |                     5.584s |     3.502s |

The hook preserves a partially staged file's unstaged content and keeps that
content out of the index. A batch containing Markdown, a generated ignored
declaration file and a TSX file also passed. A staged `debugger` statement
passed the formatter-only hook and failed the linting hook. The local warning
policy and deferred type analysis are unchanged.

This adds earlier correctness feedback at a substantial commit-time cost with
the existing config. Evaluate it together with deferred test setup rather than
adopting it as a speed improvement.

Combining the staged experiment with deferred test setup changes the one-file
trade-off:

| One-file staged hook                        | Median |
| ------------------------------------------- | -----: |
| Existing formatter-only hook                | 2.165s |
| Deferred test setup + formatter-only hook   | 0.505s |
| Deferred test setup + format and local lint | 1.437s |

After the startup fix, adding linting costs approximately 0.93 seconds over
formatting alone. The combined hook is still about 34% faster than the current
formatter-only hook. Verbose output confirmed linting was restricted to the
one staged file.

## Recommendation

Defer test setup first. Add task caching for repeated full validation when the
runtime supports Vite Task's file-tracking supervisor. Keep the existing
Tailwind ordering rule for performance. Staged linting becomes more attractive
after the startup fix: its one-file hook is faster than today's formatter-only
hook, while catching local lint errors before commit.

## Validation and limitations

The final deferred-setup prototype passed full formatting, lint and compiler
checks, including warning rejection, and a production build. All 142 tests
across 36 files passed with coverage enabled and the existing 100% thresholds.
No lint rules were disabled to make the deferred-setup prototype pass.

A custom-mode probe, `vp test --run --project workers --mode benchmark`, fails
with `depsOptimizer is required in dev mode` on both the original config and
the prototype. Default-mode Worker tests pass. Custom modes remain an existing
configuration limitation during benchmarking, so those measurements do not
establish support for them. The subsequent PR implementation uses the test
process flag for application plugins as well. On that implementation,
`vp test --run --mode benchmark` passed all 142 tests across both projects;
default-mode coverage validation also passed with 100% coverage. These are
implementation checks, separate from the prototype timing samples.

## Raw samples

Each row lists the five measured wall times in seconds, in run order.

| Case                             | Runs (seconds)                    |
| -------------------------------- | --------------------------------- |
| Test setup: baseline, check      | 4.007, 4.138, 3.975, 4.029, 4.011 |
| Test setup: baseline, lint       | 2.103, 2.308, 2.155, 2.288, 2.102 |
| Test setup: baseline, fmt        | 0.987, 1.014, 1.038, 1.010, 1.003 |
| Test setup: lazy, check          | 1.466, 1.467, 1.517, 1.468, 1.462 |
| Test setup: lazy, lint           | 1.119, 1.133, 1.180, 1.148, 1.132 |
| Test setup: lazy, fmt            | 0.254, 0.250, 0.250, 0.249, 0.250 |
| Tailwind: baseline, check        | 4.156, 4.197, 4.109, 4.146, 4.222 |
| Tailwind: baseline, lint         | 2.201, 2.257, 2.242, 2.204, 2.244 |
| Tailwind: baseline, fmt          | 1.034, 1.038, 1.048, 1.044, 1.032 |
| Tailwind: baseline, one-file-fmt | 1.036, 1.022, 1.028, 1.040, 1.088 |
| Tailwind: tailwind, check        | 4.886, 4.831, 4.805, 4.976, 5.049 |
| Tailwind: tailwind, lint         | 2.272, 2.190, 2.211, 2.330, 2.331 |
| Tailwind: tailwind, fmt          | 1.742, 1.793, 1.821, 1.757, 1.792 |
| Tailwind: tailwind, one-file-fmt | 1.384, 1.379, 1.460, 1.381, 1.367 |
| Full check cache: uncached       | 8.883, 8.512, 8.500, 8.572, 8.725 |
| Full check cache: hit            | 0.112, 0.108, 0.107, 0.119, 0.137 |
| Staged: 1 files, baseline        | 2.134, 2.165, 2.126, 2.270, 2.180 |
| Staged: 1 files, staged-check    | 5.287, 5.427, 5.345, 5.304, 5.326 |
| Staged: 5 files, baseline        | 2.182, 2.155, 2.151, 2.151, 2.157 |
| Staged: 5 files, staged-check    | 5.602, 5.485, 5.558, 5.360, 5.382 |
| Staged: 20 files, baseline       | 2.212, 2.094, 2.082, 2.071, 2.077 |
| Staged: 20 files, staged-check   | 5.697, 5.869, 5.494, 5.584, 5.465 |
| Deferred setup + staged fmt      | 0.505, 0.525, 0.524, 0.505, 0.498 |
| Deferred setup + staged check    | 1.426, 1.440, 1.437, 1.427, 1.455 |

Temporary scripts, logs and structured results live under
`/tmp/vite-plus-benchmark-20261022` for this session. In particular,
`results.json` records commands, environment overrides, exit statuses and outer
process timings; `logs/` holds the command output. Preliminary failed sandbox,
shared-dependency and superseded prototype runs are not used in the table
above. For repeated case names, the table uses the final measured series.
