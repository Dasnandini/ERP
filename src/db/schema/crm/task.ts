import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { activeColumn, auditColumns, idColumn, timestamps } from "../common/base-columns";
import { companies } from "../core/company";
import { users } from "../core/user";

export const taskEntityTypeEnum = pgEnum("task_entity_type", [
  "customer",
  "lead",
  "deal",
]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
]);

export const tasks = pgTable("tasks", {
  ...idColumn,

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),

  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  entityType: taskEntityTypeEnum("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  assignedTo: uuid("assigned_to").references(() => users.id, {
    onDelete: "set null",
  }),
  priority: taskPriorityEnum("priority").default("medium").notNull(),
  status: taskStatusEnum("status").default("pending").notNull(),
  dueDate: timestamp("due_date", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),

  ...timestamps,
  ...auditColumns,
  ...activeColumn,
});
