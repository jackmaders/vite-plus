import { drizzle } from "drizzle-orm/d1";
// oxlint-disable node/no-top-level-await
import { getPlatformProxy } from "wrangler";

import { seedAdmin } from "../src/shared/db/seed";

const seeders = [{ name: "seedAdmin", seeder: seedAdmin }];

const proxy = await getPlatformProxy<{ DB: Parameters<typeof drizzle>[0] }>();

try {
  const db = drizzle(proxy.env.DB);
  await Promise.all(
    seeders.map(async ({ name, seeder }) => {
      // eslint-disable-next-line no-console
      console.log(`Running seeder: ${name}...`);
      await seeder(db);
    }),
  );
  // eslint-disable-next-line no-console
  console.log("Database seeding completed successfully.");
} finally {
  await proxy.dispose();
}
