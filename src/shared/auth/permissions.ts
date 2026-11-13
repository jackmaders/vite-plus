import type { UserRole } from "../db/schema";

type Permission = "todos:read" | "todos:create" | "todos:update" | "todos:delete";

const ROLES: Record<UserRole, readonly Permission[]> = {
  admin: ["todos:read", "todos:create", "todos:update", "todos:delete"],
  user: ["todos:read", "todos:create", "todos:update", "todos:delete"],
};

function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) {
    return false;
  }

  const permissions: readonly Permission[] | undefined = (
    ROLES as Record<string, readonly Permission[]>
  )[role];

  return permissions?.includes(permission) ?? false;
}

export { hasPermission, type Permission };
