import { vi } from "vite-plus/test";

import type { Database } from "@/shared/db/index.server";

function createEmptyInsertMockDb(): Database {
  return {
    insert: vi
      .fn<() => { values: () => { returning: () => Promise<unknown[]> } }>()
      .mockReturnValue({
        values: vi.fn<() => { returning: () => Promise<unknown[]> }>().mockReturnValue({
          returning: vi.fn<() => Promise<unknown[]>>().mockResolvedValue([]),
        }),
      }),
  } as unknown as Database;
}

export { createEmptyInsertMockDb };
