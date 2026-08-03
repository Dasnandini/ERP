import {
  check,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  time,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm/_relations";
import { employees } from "./employee";
import { idColumn } from "../common/base-columns";

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "present",
  "absent",
  "half_day",
  "leave",
  "holiday",
  "wfh",
]);

export const attendances = pgTable(
  "attendances",
  {
    ...idColumn,

    employeeId: uuid("employee_id")
      .references(() => employees.id, { onDelete: "cascade" })
      .notNull(),

    attendanceDate: date("attendance_date").notNull(),
    checkIn: time("check_in", { precision: 0 }),
    checkOut: time("check_out", { precision: 0 }),
    workingHours: numeric("working_hours", { precision: 5, scale: 2 }),
    overtime: numeric("overtime", { precision: 5, scale: 2 }),
    lateMinutes: integer("late_minutes").default(0),
    status: attendanceStatusEnum("status").default("present").notNull(),
    remarks: text("remarks"),
  },
  (table) => ({
    employeeIdx: index("attendances_employee_id_idx").on(table.employeeId),
    attendanceDateUniqueIdx: uniqueIndex("attendances_employee_date_unique_idx").on(
      table.employeeId,
      table.attendanceDate,
    ),
    timeCheck: check(
      "attendances_check_out_after_check_in",
      sql`${table.checkOut} IS NULL OR ${table.checkIn} IS NULL OR ${table.checkOut} >= ${table.checkIn}`,
    ),
  }),
);

export const attendanceRelations = relations(attendances, ({ one }) => ({
  employee: one(employees, {
    fields: [attendances.employeeId],
    references: [employees.id],
  }),
}));
