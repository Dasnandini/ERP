import {
  pgTable,
  uuid,
  timestamp,
  boolean,
  unique,
} from "drizzle-orm/pg-core";

import { companies } from "./company";
import { users } from "./user";
import { roles } from "./role";
import { relations } from "drizzle-orm/_relations";
import { activeColumn, idColumn, timestamps } from "../common/base-columns";

export const memberships = pgTable(
  "memberships",
  {
    ...idColumn,

    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, {
        onDelete: "cascade",
      }),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, {
        onDelete: "restrict",
      }),

    joinedAt: timestamp("joined_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    invitedBy: uuid("invited_by").references(() => users.id, {
      onDelete: "set null",
    }),

    isDefaultCompany: boolean("is_default_company")
      .default(false)
      .notNull(),

    ...activeColumn,

    ...timestamps,
  },
  (table) => ({
    uniqueMembership: unique().on(table.companyId, table.userId),
  })
);

export const membershipRelations = relations(
  memberships,
  ({ one }) => ({
    company: one(companies, {
      fields: [memberships.companyId],
      references: [companies.id],
    }),

    user: one(users, {
      fields: [memberships.userId],
      references: [users.id],
    }),

    role: one(roles, {
      fields: [memberships.roleId],
      references: [roles.id],
    }),

    invitedByUser: one(users, {
      fields: [memberships.invitedBy],
      references: [users.id],
      relationName: "membershipInvitedBy",
    }),
  })
);