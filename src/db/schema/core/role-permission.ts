import {
  pgTable,
  uuid,
  unique,
} from "drizzle-orm/pg-core";


import { roles } from "./role";
import { permissions } from "./permission";
import { relations } from "drizzle-orm/_relations";

export const rolePermissions = pgTable(
  "role_permissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, {
        onDelete: "cascade",
      }),

    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id, {
        onDelete: "cascade",
      }),
  },
  (table) => ({
    uniqueRolePermission: unique().on(
      table.roleId,
      table.permissionId
    ),
  })
);

export const rolePermissionRelations = relations(
  rolePermissions,
  ({ one }) => ({
    role: one(roles, {
      fields: [rolePermissions.roleId],
      references: [roles.id],
    }),

    permission: one(permissions, {
      fields: [rolePermissions.permissionId],
      references: [permissions.id],
    }),
  })
);