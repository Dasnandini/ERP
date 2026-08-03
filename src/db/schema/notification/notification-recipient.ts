import { pgTable, uuid, timestamp, boolean } from "drizzle-orm/pg-core";

import { notifications } from "./notification";
import { users } from "../core/user";

export const notificationRecipients = pgTable("notification_recipients", {
  id: uuid("id").defaultRandom().primaryKey(),

  notificationId: uuid("notification_id")
    .references(() => notifications.id, { onDelete: "cascade" })
    .notNull(),

  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  readAt: timestamp("read_at", { withTimezone: true }),
  clickedAt: timestamp("clicked_at", { withTimezone: true }),
  isRead: boolean("is_read").default(false).notNull(),
});
