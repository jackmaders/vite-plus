import { vi } from "vite-plus/test";

vi.mock(import("@/shared/auth/auth.server"));
vi.mock(import("@/shared/db/db.server"));
