import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { idColumn } from "../common/base-columns";
import { users } from "../core/user";
import { tasks } from "./task";

export const taskComments = pgTable("task_comments", {
  ...idColumn,

  taskId: uuid("task_id")
    .references(() => tasks.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
