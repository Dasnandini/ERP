import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import { rolePermissions } from "./role-permission";
import { relations } from "drizzle-orm/_relations";
import { idColumn, timestamps } from "../common/base-columns";

export const permissions = pgTable(
  "permissions",
  {
   ...idColumn,

    module: varchar("module", { length: 100 }).notNull(),

    action: varchar("action", { length: 100 }).notNull(),

    code: varchar("code", { length: 100 }).notNull(),

    description: text("description"),

    ...timestamps,
  },
  (table) => ({
    uniquePermission: unique().on(table.code),
  })
);

export const permissionRelations = relations(
  permissions,
  ({ many }) => ({
    rolePermissions: many(rolePermissions),
  })
);