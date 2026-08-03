import {
  date,
  index,
  pgTable,
  primaryKey,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { employees } from "./employee";
import { shifts } from "./shift";

export const employeeShifts = pgTable(
  "employee_shifts",
  {
    employeeId: uuid("employee_id")
      .references(() => employees.id, { onDelete: "cascade" })
      .notNull(),
    shiftId: uuid("shift_id")
      .references(() => shifts.id, { onDelete: "cascade" })
      .notNull(),
    effectiveFrom: date("effective_from").notNull(),
    effectiveTo: date("effective_to"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.employeeId, table.shiftId, table.effectiveFrom] }),
    employeeIdx: index("employee_shifts_employee_id_idx").on(table.employeeId),
    shiftIdx: index("employee_shifts_shift_id_idx").on(table.shiftId),
  }),
);

export const employeeShiftRelations = relations(employeeShifts, ({ one }) => ({
  employee: one(employees, {
    fields: [employeeShifts.employeeId],
    references: [employees.id],
  }),
  shift: one(shifts, {
    fields: [employeeShifts.shiftId],
    references: [shifts.id],
  }),
}));
