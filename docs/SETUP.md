# New Project Setup

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

The top-level Wrangler configuration is used to build and deploy the Worker.
Configure its D1 database and canonical application origin before deploying.
For local development, copy `.env.example` to `.dev.vars` and replace the
secret placeholder with a generated local secret. Those values override the
config's `vars`, including `BETTER_AUTH_URL`.

If you can access multiple Cloudflare accounts, set `CLOUDFLARE_ACCOUNT_ID` to
the intended account before running these commands. Confirm Wrangler is
authenticated and select the account:

```bash
pnpm exec wrangler whoami
```

Construct the Worker URL from the project name and the workers.dev subdomain
shown in your Cloudflare account:

```bash
WORKER_NAME="$(jq -er '.name' package.json)"
read -rp "Account subdomain (without .workers.dev): " WORKERS_SUBDOMAIN
WORKERS_URL="https://${WORKER_NAME}.${WORKERS_SUBDOMAIN}.workers.dev"
jq --arg url "$WORKERS_URL" \
  '.vars.BETTER_AUTH_URL = $url' wrangler.jsonc \
  > wrangler.jsonc.tmp && mv wrangler.jsonc.tmp wrangler.jsonc
```

Review `wrangler.jsonc` and confirm that the production URL points to the
intended Worker. If deploying to a custom domain, use its canonical HTTPS
origin instead.

Create the remote production D1 database, then copy its returned database name
and ID into the existing top-level `d1_databases` entry in `wrangler.jsonc`.
Keep the `DB` binding, `migrations_dir`, and `migrations_pattern` aligned with
the nested Drizzle migration files.

```bash
pnpm exec wrangler d1 create "${WORKER_NAME}-db"
```

Regenerate Worker binding types after updating the D1 configuration:

```bash
pnpm run cf:generate
```

Use `pnpm run db:migrate` for the local D1 database. To apply migrations to the
remote D1 database, pass Wrangler's remote flag explicitly:

```bash
pnpm run db:migrate --remote
```

For the first deployment, generate an auth secret and pass it to Wrangler using
a temporary secrets file. The trap removes the file when the shell exits:

```bash
BETTER_AUTH_SECRET="$(openssl rand -base64 32)"
ENV_FILE="$(mktemp "${TMPDIR:-/tmp}/worker-secrets.XXXXXX")"
trap 'rm -f "$ENV_FILE"' EXIT
printf 'BETTER_AUTH_SECRET="%s"\n' "$BETTER_AUTH_SECRET" > "$ENV_FILE"

pnpm run db:migrate --remote
pnpm run deploy --secrets-file "$ENV_FILE"
```

For later deployments, use `pnpm run deploy` to build and deploy the top-level
Worker configuration. Store the production `BETTER_AUTH_SECRET` in Cloudflare
as a Worker secret; the local secret belongs in `.dev.vars` only.

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
