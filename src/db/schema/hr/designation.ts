import {
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { companies } from "../core/company";
import { departments } from "./department";
import { activeColumn, idColumn } from "../common/base-columns";

export const designations = pgTable(
  "designations",
  {
    ...idColumn,

    companyId: uuid("company_id")
      .references(() => companies.id, { onDelete: "cascade" })
      .notNull(),

    departmentId: uuid("department_id")
      .references(() => departments.id, { onDelete: "set null" }),

    name: varchar("name", { length: 150 }).notNull(),
    level: integer("level").default(1).notNull(),
    description: text("description"),

    ...activeColumn,
  },
  (table) => ({
    companyIdx: index("designations_company_id_idx").on(table.companyId),
    departmentIdx: index("designations_department_id_idx").on(table.departmentId),
    companyNameUniqueIdx: uniqueIndex("designations_company_name_unique_idx").on(
      table.companyId,
      table.name,
    ),
  }),
);

export const designationRelations = relations(designations, ({ one }) => ({
  company: one(companies, {
    fields: [designations.companyId],
    references: [companies.id],
  }),
  department: one(departments, {
    fields: [designations.departmentId],
    references: [departments.id],
  }),
}));
