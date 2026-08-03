import {
  check,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm/_relations";
import { employees } from "./employee";
import { leaveTypes } from "./leave-type";
import { users } from "../core/user";

export const leaveRequestStatusEnum = pgEnum("leave_request_status", [
  "pending",
  "approved",
  "rejected",
  "cancelled",
]);

export const leaveRequests = pgTable(
  "leave_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    employeeId: uuid("employee_id")
      .references(() => employees.id, { onDelete: "cascade" })
      .notNull(),
    leaveTypeId: uuid("leave_type_id")
      .references(() => leaveTypes.id, { onDelete: "set null" }),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    days: integer("days").default(1).notNull(),
    reason: text("reason"),
    approvedBy: uuid("approved_by").references(() => users.id, {
      onDelete: "set null",
    }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    status: leaveRequestStatusEnum("status").default("pending").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    employeeIdx: index("leave_requests_employee_id_idx").on(table.employeeId),
    leaveTypeIdx: index("leave_requests_leave_type_id_idx").on(table.leaveTypeId),
    statusIdx: index("leave_requests_status_idx").on(table.status),
    dateRangeCheck: check(
      "leave_requests_date_range_check",
      sql`${table.endDate} >= ${table.startDate}`,
    ),
  }),
);

export const leaveRequestRelations = relations(leaveRequests, ({ one }) => ({
  employee: one(employees, {
    fields: [leaveRequests.employeeId],
    references: [employees.id],
  }),
  leaveType: one(leaveTypes, {
    fields: [leaveRequests.leaveTypeId],
    references: [leaveTypes.id],
  }),
  approvedByUser: one(users, {
    fields: [leaveRequests.approvedBy],
    references: [users.id],
  }),
}));
