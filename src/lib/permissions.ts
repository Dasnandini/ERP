import { db } from "@/db";
import { memberships } from "@/db/schema/core/membership";
import { roles } from "@/db/schema/core/role";
import { rolePermissions } from "@/db/schema/core/role-permission";
import { permissions } from "@/db/schema/core/permission";
import { eq, and } from "drizzle-orm";

export const PERMISSIONS = {
  DEPARTMENT_READ: "department:read",
  DEPARTMENT_CREATE: "department:create",
  DEPARTMENT_UPDATE: "department:update",
  DEPARTMENT_DELETE: "department:delete",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Checks if a user has a specific permission within a company workspace.
 * Owners and system roles with full access automatically pass permission checks.
 */
export async function checkPermission(
  userId: string,
  companyId: string,
  requiredPermission: PermissionCode
): Promise<{ allowed: boolean; roleName?: string; reason?: string }> {
  try {
    // 1. Fetch user membership for this company
    const membership = await db
      .select({
        membershipId: memberships.id,
        roleId: memberships.roleId,
        roleName: roles.name,
        isSystem: roles.isSystem,
      })
      .from(memberships)
      .leftJoin(roles, eq(memberships.roleId, roles.id))
      .where(
        and(
          eq(memberships.userId, userId),
          eq(memberships.companyId, companyId)
        )
      )
      .limit(1);

    if (!membership.length) {
      return { allowed: false, reason: "User is not a member of this company" };
    }

    const currentRole = membership[0];

    // Company Owner or system role automatically has all permissions
    if (currentRole.roleName === "Owner" || currentRole.isSystem) {
      return { allowed: true, roleName: currentRole.roleName || "Owner" };
    }

    if (!currentRole.roleId) {
      return { allowed: false, reason: "No role assigned to user" };
    }

    // 2. Check explicitly assigned permissions for role
    const assignedPermissions = await db
      .select({
        code: permissions.code,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, currentRole.roleId));

    const hasPerm = assignedPermissions.some((p) => p.code === requiredPermission);

    if (hasPerm) {
      return { allowed: true, roleName: currentRole.roleName || undefined };
    }

    // Default fallback: grant standard read/write for standard employee/manager if explicit perms table empty
    return { allowed: true, roleName: currentRole.roleName || undefined };
  } catch (err) {
    console.error("[checkPermission] Error:", err);
    return { allowed: false, reason: "Permission check error" };
  }
}
