import {
  boolean,
  date,
  index,
  pgTable,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { employees } from "./employee";
import { idColumn } from "../common/base-columns";

export const salaryStructures = pgTable(
  "salary_structures",
  {
    ...idColumn,
    employeeId: uuid("employee_id")
      .references(() => employees.id, { onDelete: "cascade" })
      .notNull(),
    effectiveDate: date("effective_date").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
  },
  (table) => ({
    employeeIdx: index("salary_structures_employee_id_idx").on(table.employeeId),
    effectiveDateIdx: index("salary_structures_effective_date_idx").on(table.effectiveDate),
  }),
);

export const salaryStructureRelations = relations(salaryStructures, ({ one }) => ({
  employee: one(employees, {
    fields: [salaryStructures.employeeId],
    references: [employees.id],
  }),
}));
