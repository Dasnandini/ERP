import {
  index,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { attendances } from "./attendance";

export const attendanceLogs = pgTable(
  "attendance_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    attendanceId: uuid("attendance_id")
      .references(() => attendances.id, { onDelete: "cascade" })
      .notNull(),
    logTime: timestamp("log_time", { withTimezone: true }).notNull(),
    type: varchar("type", { length: 20 }).notNull(),
    device: varchar("device", { length: 100 }),
    location: varchar("location", { length: 255 }),
  },
  (table) => ({
    attendanceIdx: index("attendance_logs_attendance_id_idx").on(table.attendanceId),
    logTimeIdx: index("attendance_logs_log_time_idx").on(table.logTime),
  }),
);

export const attendanceLogRelations = relations(attendanceLogs, ({ one }) => ({
  attendance: one(attendances, {
    fields: [attendanceLogs.attendanceId],
    references: [attendances.id],
  }),
}));
