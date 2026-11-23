# Tweakcn Theme Bridge

Status: accepted

Keep `src/app/styles/theme.css` as verbatim upstream tweakcn output and layer Base UI and app-level token overrides in `src/app/styles/theme-bridge.css`, imported after `shadcn/tailwind.css` in `src/app/styles/index.css`.

## Considered Options

- **Edit `theme.css` directly**: Rejected because re-exporting from tweakcn would overwrite local Base UI, radius, tracking, and `color-scheme` overrides.
- **Inline overrides in `index.css`**: Rejected to keep `index.css` focused on import ordering, font loading, and base html setup.

## Consequences

- Upstream `theme.css` updates can be pasted verbatim without re-applying local token fixes (`--input`, `--sidebar-border`, `--font-heading`, extended `--radius-*`, `--tracking-*`, `color-scheme`, and forced-colors focus rings).
