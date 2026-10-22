# Repository setup

## Project Setup

Prerequisites:

- [Vite+](https://viteplus.dev/guide/) 1.3.0: validate with `vp --version`.
- [Git](https://git-scm.com/downloads) 2.28 or newer: validate with `git --version`.
- [GitHub CLI](https://cli.github.com/) 2.x: validate with `gh --version` and authenticate with `gh auth login`.
- [jq](https://jqlang.org/): validate with `jq --version`.

Create the project and enter the generated directory:

```bash
vp create github:jackmaders/vite-plus
cd <project-name>
vp install
```

Set the project name in `package.json` and `wrangler.jsonc` from the current directory:

```bash
PROJECT_NAME="$(basename "$PWD")"
jq --arg name "$PROJECT_NAME" '.name = $name' package.json > package.json.tmp && mv package.json.tmp package.json
jq --arg name "$PROJECT_NAME" '.name = $name' wrangler.jsonc > wrangler.jsonc.tmp && mv wrangler.jsonc.tmp wrangler.jsonc
```

## Cloudflare Workers production setup

Local development uses the top-level Wrangler configuration, including
`BETTER_AUTH_URL=http://localhost:5173`. Production uses the separate
`production` environment in `wrangler.jsonc`; configure its D1 database and
canonical application origin before deploying.

1. Create a production D1 database:

   ```bash
   pnpm exec wrangler d1 create your-app-production
   ```

   Copy the returned database name and ID into `env.production.d1_databases` in
   `wrangler.jsonc`. Keep the `DB` binding, `migrations_dir`, and
   `migrations_pattern` aligned with the nested Drizzle migration files.

2. Set `env.production.vars.BETTER_AUTH_URL` to the canonical HTTPS origin users
   visit, such as the production `workers.dev` hostname or your custom domain.
   Replace the setup placeholder; leave the top-level local URL unchanged.
3. Set the production auth secret with
   `pnpm exec wrangler secret put BETTER_AUTH_SECRET --env production`. Wrangler
   requires this secret for production deployments. For local development,
   copy `.env.example` to `.dev.vars` and use a generated secret. The local URL
   comes from the top-level `vars` entry in `wrangler.jsonc`.
4. Regenerate Worker binding types after changing the production database
   configuration with `pnpm run cf:generate`.

Use `pnpm run db:migrate:local` for the local D1 database. Use
`pnpm run db:migrate:remote` only when you intend to apply migrations to the
production D1 database.

Deploy with `pnpm run deploy:production`. This selects the production Wrangler
environment during the Vite build, checks the generated deployment config, and
deploys that generated config to the separate `<worker-name>-production`
Worker. Do not add `--env production` to `wrangler deploy`; the Cloudflare Vite
plugin applies Wrangler environments at build time.

The compatibility date in `wrangler.jsonc` stays pinned until a deliberate
runtime update. Before changing it, review Cloudflare's
[compatibility changes](https://developers.cloudflare.com/workers/configuration/compatibility-dates/)
and validate affected Worker behavior.

## GitHub Setup

Create and push the repository:

```bash
export GH_OWNER="$(gh api user --jq .login)"
export GH_REPO="${GH_OWNER}/$(jq -r '.name' package.json)"

git add .
git commit -m "chore: initialize project"
gh repo create "$GH_REPO" --public --source=. --remote=origin --push
gh repo edit --default-branch main \
  --delete-branch-on-merge --enable-squash-merge \
  --enable-merge-commit=false --enable-rebase-merge=false
```

Aapply the main-branch ruleset:

```bash
gh api --method POST 'repos/{owner}/{repo}/rulesets' \
  --input .github/rulesets/protect-main.json
gh api 'repos/{owner}/{repo}/rules/branches/main'
```

AI reviews require a Gemini API key stored as a repository secret: `gh secret set GEMINI_API_KEY`.
