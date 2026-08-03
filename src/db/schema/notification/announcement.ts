import { pgEnum, pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

import { companies } from "../core/company";

export const announcementPriorityEnum = pgEnum("announcement_priority", [
  "low",
  "medium",
  "high",
]);

export const announcements = pgTable("announcements", {
  id: uuid("id").defaultRandom().primaryKey(),

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),

  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startDate: timestamp("start_date", { withTimezone: true }).defaultNow().notNull(),
  endDate: timestamp("end_date", { withTimezone: true }),
  priority: announcementPriorityEnum("priority").default("medium").notNull(),
  createdBy: uuid("created_by"),
});
