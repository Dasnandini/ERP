import { pgEnum, pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

import { companies } from "../core/company";

export const notificationTypeEnum = pgEnum("notification_type", [
  "info",
  "success",
  "warning",
  "error",
]);

export const notificationPriorityEnum = pgEnum("notification_priority", [
  "low",
  "medium",
  "high",
]);

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),

  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: notificationTypeEnum("type").default("info").notNull(),
  entityType: varchar("entity_type", { length: 100 }),
  entityId: uuid("entity_id"),
  priority: notificationPriorityEnum("priority").default("medium").notNull(),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
