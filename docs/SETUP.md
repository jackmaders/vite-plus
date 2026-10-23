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

## Environments and local development

Use a Bash shell for the commands in this guide. OpenSSL is required to generate
secrets. Non-secret settings and D1 bindings live in `wrangler.jsonc`; local
secrets live in ignored `.dev.vars` files. `.dev.vars.example` documents the
required local secret and is safe to commit.

| Target            | Wrangler configuration               | Auth origin                       | Secret source                               |
| ----------------- | ------------------------------------ | --------------------------------- | ------------------------------------------- |
| Local development | `env.development`                    | `http://localhost:5173`           | `.dev.vars`                                 |
| Local preview     | `env.preview`, selected during build | `http://localhost:4173`           | `.dev.vars`, copied into build output       |
| CI browser tests  | Same local preview build             | `http://localhost:4173`           | Disposable secret generated before building |
| Production        | Top-level configuration              | Configured canonical HTTPS origin | Cloudflare Worker secret                    |

The local environments explicitly declare their own vars, D1 binding, and required
secret because these settings are not inherited. Both use the same local D1
`database_name`. Neither points at the production database.

Create a local secret, apply local migrations, and start development:

```bash
cp .dev.vars.example .dev.vars
# Replace the placeholder in .dev.vars with the output of:
openssl rand -base64 32
vp run db:migrate:local
vp run dev
```

To run the compiled app locally:

```bash
vp run build:preview
vp run db:migrate:preview
vp run preview
```

Use the package scripts: `vp dev` bypasses the script that selects the development
configuration. `vp run build` produces the production build; `vp run build:preview`
produces the local preview build. Both write `dist`, so rebuild when switching.
The preview server uses the configuration and local secrets captured at build
time. Rebuild after changing local secrets. Do not use `.dev.vars` to override
the auth URL; keep the URL in the selected Wrangler configuration.

The GitHub browser-test workflow generates a disposable secret before building,
then migrates a local D1 database in each browser job. Its artifact contains a
local test secret and must never contain production secrets. These CI previews
run locally on the runner; they are not deployed Cloudflare Previews.

With the Cloudflare Vite plugin, select named environments using `CLOUDFLARE_ENV`
at dev/build time. Setting it only for preview or deployment does not retarget an
existing build. See [Cloudflare environments](https://developers.cloudflare.com/workers/vite-plugin/reference/cloudflare-environments/)
and [local preview secrets](https://developers.cloudflare.com/workers/vite-plugin/reference/secrets/).

## Cloudflare Workers production setup

The top-level Wrangler configuration is the production deployment contract.
Configure its canonical application origin and D1 database before deploying.
Commit the non-secret URL, database name, and database ID in `wrangler.jsonc`.
Keep the production auth secret in Cloudflare and a secure password manager;
never put it in `.dev.vars`, source control, or CI build artifacts.

Authenticate Wrangler, then inspect the available accounts:

```bash
pnpm exec wrangler login
pnpm exec wrangler whoami
```

Set `CLOUDFLARE_ACCOUNT_ID` to the intended account ID, especially when you can
access multiple accounts. `whoami` reports accounts; it does not select one.

```bash
export CLOUDFLARE_ACCOUNT_ID="<your-account-id>"
```

Set the canonical auth origin. Replace the example with your Worker's actual
`https://<worker-name>.<account-subdomain>.workers.dev` origin or custom domain:

```bash
WORKER_NAME="$(jq -er '.name' wrangler.jsonc)"
WORKERS_URL="https://<worker-name>.<account-subdomain>.workers.dev"
jq --arg url "$WORKERS_URL" \
  '.vars.BETTER_AUTH_URL = $url' wrangler.jsonc \
  > wrangler.jsonc.tmp && mv wrangler.jsonc.tmp wrangler.jsonc
```

If using a custom domain, also configure its Worker route/domain. Setting
`BETTER_AUTH_URL` alone does not configure routing.

Create the remote production D1 database, then copy its returned database name
and ID into the **top-level** `d1_databases` entry in `wrangler.jsonc`. Keep the
`DB` binding, `migrations_dir`, and `migrations_pattern` aligned with the nested
Drizzle migration files. Leave the local environment bindings unchanged.

```bash
pnpm exec wrangler d1 create "${WORKER_NAME}-db"
vp run cf:generate
```

Build and inspect the generated deployment configuration without changing remote
resources. Confirm the Worker name, canonical HTTPS origin, and D1 name/ID match
the intended production resources. Replace every production placeholder and
reject localhost origins before proceeding:

```bash
vp run build
jq '{name, vars, d1_databases, secrets}' dist/server/wrangler.json
pnpm exec wrangler deploy --dry-run
```

For the first deployment, generate a production auth secret with
`openssl rand -base64 32` and save it in your password manager. The block below
prompts for that saved secret without echoing it. It creates a temporary secrets
file and removes it when the subshell finishes, including on failure.
`--secrets-file` uploads the secret with the Worker code; local `.dev.vars` files
are not uploaded as Worker secrets.

```bash
(
  set -e
  ENV_FILE="$(mktemp "${TMPDIR:-/tmp}/worker-secrets.XXXXXX")"
  trap 'rm -f "$ENV_FILE"' EXIT
  read -r -s -p "Production BETTER_AUTH_SECRET: " BETTER_AUTH_SECRET
  printf '\n'
  test -n "$BETTER_AUTH_SECRET"
  printf 'BETTER_AUTH_SECRET="%s"\n' "$BETTER_AUTH_SECRET" > "$ENV_FILE"

  vp run db:migrate:production
  vp run deploy --secrets-file "$ENV_FILE"
)
```

For later deployments, apply pending production migrations with
`vp run db:migrate:production`, then use `vp run deploy`. The deploy script
rebuilds production before uploading, even if your last build was a local preview.
Cloudflare preserves existing Worker secrets on subsequent deployments. For CI
production deployments, use a scoped Cloudflare API token and account ID in the
CI secret store; runtime secrets remain configured on the Worker.
See [deploying secrets](https://developers.cloudflare.com/workers/configuration/secrets/#upload-secrets-alongside-code).

The compatibility date in `wrangler.jsonc` stays pinned until a deliberate
runtime update. Before changing it, review Cloudflare's
[compatibility changes](https://developers.cloudflare.com/workers/configuration/compatibility-dates/)
and validate affected Worker behavior.

## Optional deployed pull request previews

Cloudflare Workers Previews are separate from this project's local `preview`
Wrangler environment. To add hosted PR previews, configure Workers Builds or
external CI to build the app and run `wrangler preview`, rather than the
production `deploy` script. Configure a `previews` block with Preview vars and
bindings; production settings are not inherited. Supply the Preview's exact
auth origin and a separate auth secret using the Preview secret workflow.

Point Preview D1 bindings at a non-production database and migrate that same
database before deploying. Multiple Previews with the same database ID share
rows; use a different database per PR when isolation is needed. Preview URLs
are public unless you configure access controls.
See [Preview configuration](https://developers.cloudflare.com/workers/previews/configuration/),
[resource isolation and migrations](https://developers.cloudflare.com/workers/previews/resources/),
and [Workers Builds preview branches](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/).

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
