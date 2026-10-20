import type { Session, User } from "@/shared/db/schema";

const TEST_USER: User = {
  createdAt: new Date("2026-10-14T00:00:00Z"),
  email: "test@example.com",
  emailVerified: false,
  id: "user-1",
  // oxlint-disable-next-line unicorn/no-null
  image: null,
  name: "Test User",
  updatedAt: new Date("2026-10-14T00:00:00Z"),
};

const TEST_SESSION: { session: Session; user: User } = {
  session: {
    createdAt: new Date("2026-10-14T00:00:00Z"),
    expiresAt: new Date("2026-10-15T00:00:00Z"),
    id: "session-1",
    ipAddress: "127.0.0.1",
    token: "test-session-token",
    updatedAt: new Date("2026-10-14T00:00:00Z"),
    userAgent: "Mozilla/5.0",
    userId: TEST_USER.id,
  },
  user: TEST_USER,
};

export { TEST_SESSION, TEST_USER };
