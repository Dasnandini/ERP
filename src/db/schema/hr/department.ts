import {
  boolean,
  check,
  index,
  pgEnum,
  pgTable,
  text,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm/_relations";
import { companies } from "../core/company";
import { users } from "../core/user";
import { activeColumn, auditColumns, idColumn, timestamps } from "../common/base-columns";
import { employees } from "./employee";

export const departmentStatusEnum = pgEnum("department_status", [
  "active",
  "inactive",
]);

export const departments = pgTable(
  "departments",
  {
    ...idColumn,

    companyId: uuid("company_id")
      .references(() => companies.id, { onDelete: "cascade" })
      .notNull(),

    name: varchar("name", { length: 150 }).notNull(),
    code: varchar("code", { length: 50 }),
    description: text("description"),
    managerId: uuid("manager_id").references(() => users.id, {
      onDelete: "set null",
    }),
    isDefault: boolean("is_default").default(false).notNull(),
    status: departmentStatusEnum("status").default("active").notNull(),

    ...timestamps,
    ...activeColumn,
    ...auditColumns,
  },
  (table) => ({
    companyIdx: index("departments_company_id_idx").on(table.companyId),
    companyNameUniqueIdx: uniqueIndex("departments_company_name_unique_idx").on(
      table.companyId,
      table.name,
    ),
    codeIdx: index("departments_code_idx").on(table.companyId, table.code),
    nameCheck: check("departments_name_not_empty", sql`${table.name} <> ''`),
  }),
);

export const departmentRelations = relations(departments, ({ one, many }) => ({
  company: one(companies, {
    fields: [departments.companyId],
    references: [companies.id],
  }),
  manager: one(users, {
    fields: [departments.managerId],
    references: [users.id],
  }),
  employees: many(employees),
}));
