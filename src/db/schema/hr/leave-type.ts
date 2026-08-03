import {
  boolean,
  index,
  integer,
  pgTable,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { companies } from "../core/company";
import { activeColumn, idColumn } from "../common/base-columns";

export const leaveTypes = pgTable(
  "leave_types",
  {
    ...idColumn,

    companyId: uuid("company_id")
      .references(() => companies.id, { onDelete: "cascade" })
      .notNull(),

    name: varchar("name", { length: 100 }).notNull(),
    daysPerYear: integer("days_per_year").default(0).notNull(),
    carryForward: boolean("carry_forward").default(false).notNull(),
    requiresApproval: boolean("requires_approval").default(true).notNull(),
    paid: boolean("paid").default(true).notNull(),

    ...activeColumn,
  },
  (table) => ({
    companyIdx: index("leave_types_company_id_idx").on(table.companyId),
    companyNameUniqueIdx: uniqueIndex("leave_types_company_name_unique_idx").on(
      table.companyId,
      table.name,
    ),
  }),
);

export const leaveTypeRelations = relations(leaveTypes, ({ one }) => ({
  company: one(companies, {
    fields: [leaveTypes.companyId],
    references: [companies.id],
  }),
}));
