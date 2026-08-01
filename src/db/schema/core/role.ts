import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import { companies } from "./company";
import { memberships } from "./membership";
import { rolePermissions } from "./role-permission";
import { relations } from "drizzle-orm/_relations";
import { activeColumn, auditColumns, idColumn, softDelete, timestamps } from "../common/base-columns";

export const roles = pgTable(
  "roles",
  {
    ...idColumn,

    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),

    name: varchar("name", { length: 100 }).notNull(),

    description: text("description"),

    isSystem: boolean("is_system").default(false).notNull(),

    ...timestamps,

    ...softDelete,

    ...auditColumns,

    ...activeColumn,
  },
  (table) => ({
    uniqueRole: unique().on(table.companyId, table.name),
  })
);

export const roleRelations = relations(roles, ({ one, many }) => ({
  company: one(companies, {
    fields: [roles.companyId],
    references: [companies.id],
  }),

  memberships: many(memberships),

  rolePermissions: many(rolePermissions),
}));