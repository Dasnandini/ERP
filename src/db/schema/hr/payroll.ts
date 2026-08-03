import {
  check,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm/_relations";
import { employees } from "./employee";
import { idColumn } from "../common/base-columns";

export const payrollStatusEnum = pgEnum("payroll_status", [
  "draft",
  "generated",
  "paid",
]);

export const payrolls = pgTable(
  "payrolls",
  {
    ...idColumn,
    employeeId: uuid("employee_id")
      .references(() => employees.id, { onDelete: "cascade" })
      .notNull(),
    month: integer("month").notNull(),
    year: integer("year").notNull(),
    grossSalary: numeric("gross_salary", { precision: 12, scale: 2 }).default("0"),
    deductions: numeric("deductions", { precision: 12, scale: 2 }).default("0"),
    tax: numeric("tax", { precision: 12, scale: 2 }).default("0"),
    netSalary: numeric("net_salary", { precision: 12, scale: 2 }).default("0"),
    status: payrollStatusEnum("status").default("draft").notNull(),
    generatedBy: uuid("generated_by"),
    generatedAt: timestamp("generated_at", { withTimezone: true }),
  },
  (table) => ({
    employeeIdx: index("payrolls_employee_id_idx").on(table.employeeId),
    monthYearUniqueIdx: uniqueIndex("payrolls_employee_month_year_unique_idx").on(
      table.employeeId,
      table.month,
      table.year,
    ),
    monthRangeCheck: check(
      "payrolls_month_range_check",
      sql`${table.month} BETWEEN 1 AND 12`,
    ),
  }),
);

export const payrollRelations = relations(payrolls, ({ one }) => ({
  employee: one(employees, {
    fields: [payrolls.employeeId],
    references: [employees.id],
  }),
}));
