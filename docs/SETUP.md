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

## Local development and preview

Use Bash for the commands in this guide. OpenSSL is required to generate secrets.
The top-level `wrangler.jsonc` defines production non-secret vars and bindings.
For local development, copy `.dev.vars.example` to `.dev.vars` and replace the secret
placeholder with the output of `openssl rand -base64 32`. Keep `.dev.vars` ignored
by Git. Its auth URL overrides the production URL while running `vp dev`.

```bash
cp .dev.vars.example .dev.vars
# Replace the secret placeholder in .dev.vars before continuing.
openssl rand -base64 32
vp run db:migrate --local
vp dev
```

`vp preview` runs the compiled app locally on port 4173. Build first, then add its
local auth URL to the generated `.dev.vars` file. The Cloudflare Vite plugin
copies the required local secret during the build, but does not copy the auth URL
override when `secrets.required` is configured. Adding the URL explicitly allows
preview to use its own localhost origin:

```bash
vp build
printf 'BETTER_AUTH_URL="http://localhost:4173"\n' >> dist/server/.dev.vars
vp run db:migrate --local
vp preview
```

Repeat the URL override after rebuilding. Changes to local secrets also require
a rebuild. This generated `.dev.vars` file is used only by local preview and is
not uploaded as Worker secrets. D1 uses local storage for both local commands;
remote migrations require `--remote`.

The GitHub browser tests use `vp preview` on the runner. The browser-test step
supplies a local-only test secret and `BETTER_AUTH_URL=http://localhost:4173`
through its `env` block. The build artifact contains no test secrets, and CI does
not edit environment files. Production secrets are not needed for those tests.
See [Cloudflare local preview secrets](https://developers.cloudflare.com/workers/vite-plugin/reference/secrets/).

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
Drizzle migration files.

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

  vp run db:migrate --remote
  vp run deploy --secrets-file "$ENV_FILE"
)
```

For later deployments, apply pending production migrations with
`vp run db:migrate --remote`, then use `vp run deploy`. The deploy script
rebuilds before uploading, replacing the local preview output with the production
configuration.
Cloudflare preserves existing Worker secrets on subsequent deployments. For CI
production deployments, use a scoped Cloudflare API token and account ID in the
CI secret store; runtime secrets remain configured on the Worker.
See [deploying secrets](https://developers.cloudflare.com/workers/configuration/secrets/#upload-secrets-alongside-code).

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
