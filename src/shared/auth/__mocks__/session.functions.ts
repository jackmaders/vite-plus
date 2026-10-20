import { vi } from "vite-plus/test";

// oxlint-disable-next-line unicorn/no-null
const getSessionFn = vi.fn<() => Promise<unknown>>().mockResolvedValue(null);

export { getSessionFn };
