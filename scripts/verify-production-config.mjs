import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { URL } from "node:url";

const projectRoot = path.resolve(import.meta.dirname, "..");
const deployConfigPath = path.resolve(projectRoot, ".wrangler/deploy/config.json");
const errors = [];

async function main() {
  const deployConfig = JSON.parse(await readFile(deployConfigPath, "utf8"));
  const workerConfigPath = path.resolve(path.dirname(deployConfigPath), deployConfig.configPath);
  const workerConfig = JSON.parse(await readFile(workerConfigPath, "utf8"));

  if (workerConfig.name?.endsWith("-production")) {
    const authUrl = workerConfig.vars?.BETTER_AUTH_URL;
    if (typeof authUrl === "string") {
      const parsedAuthUrl = parseUrl(authUrl);
      if (parsedAuthUrl) {
        const hostname = parsedAuthUrl.hostname.toLowerCase();
        const isLoopbackHost =
          hostname === "localhost" ||
          hostname.endsWith(".localhost") ||
          hostname.startsWith("127.") ||
          hostname === "[::1]";

        if (
          parsedAuthUrl.protocol !== "https:" ||
          isLoopbackHost ||
          hostname.endsWith(".invalid")
        ) {
          reportValidationError(
            "replace the production URL placeholder with the canonical HTTPS origin",
          );
        }
      } else {
        reportValidationError("BETTER_AUTH_URL must be a valid HTTPS URL");
      }
    } else {
      reportValidationError("set env.production.vars.BETTER_AUTH_URL in wrangler.jsonc");
    }
  } else {
    reportValidationError("build with CLOUDFLARE_ENV=production before deploying");
  }

  const database = workerConfig.d1_databases?.find(({ binding }) => binding === "DB");
  if (database) {
    const validDatabaseId = /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/iu.test(
      database.database_id ?? "",
    );

    if (
      !database.database_name ||
      database.database_name === "set-your-production-database-name" ||
      !validDatabaseId ||
      database.database_id === "00000000-0000-0000-0000-000000000000"
    ) {
      reportValidationError("set the production DB name and ID in env.production.d1_databases");
    }

    if (
      path.resolve(path.dirname(workerConfigPath), database.migrations_dir) !==
        path.resolve(projectRoot, "drizzle") ||
      database.migrations_pattern !== `${database.migrations_dir}/*/migration.sql`
    ) {
      reportValidationError("preserve the nested Drizzle migration directory and pattern");
    }
  } else {
    reportValidationError("declare the production DB binding in env.production.d1_databases");
  }

  if (!workerConfig.secrets?.required?.includes("BETTER_AUTH_SECRET")) {
    reportValidationError("declare BETTER_AUTH_SECRET under env.production.secrets.required");
  }

  if (errors.length > 0) {
    process.exitCode = 1;
  } else {
    process.stdout.write(`Production deployment config is ready for ${workerConfig.name}.\n`);
  }
}

function reportValidationError(message) {
  errors.push(message);
  process.stderr.write(`Production deployment config is incomplete: ${message}\n`);
}

function parseUrl(value) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

await main();
